import express from 'express';
import { getDB } from '../database/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get user analytics
router.get('/', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.userId;
  
  // Get user's test results
  db.all(`
    SELECT tr.*, t.subject, t.title, t.difficulty
    FROM test_results tr
    LEFT JOIN tests t ON tr.test_id = t.id
    WHERE tr.user_id = ?
    ORDER BY tr.completed_at DESC
  `, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching analytics:', err);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
    
    if (results.length === 0) {
      return res.json({
        totalTests: 0,
        averageScore: 0,
        recentActivity: [],
        progressTrend: [],
        studyStreak: 0,
        totalStudyTime: 0,
        subjectBreakdown: [],
        difficultyBreakdown: []
      });
    }
    
    // Calculate basic stats
    const totalTests = results.length;
    const averageScore = Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / totalTests);
    
    // Recent activity (last 10 results)
    const recentActivity = results.slice(0, 10).map(result => ({
      id: result.id,
      test_id: result.test_id,
      title: result.title || `Test ${result.test_id}`,
      subject: result.subject || 'general',
      score: result.score,
      time_spent: result.time_spent,
      completed_at: result.completed_at
    }));
    
    // Progress trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentResults = results.filter(result => 
      new Date(result.completed_at) >= thirtyDaysAgo
    );
    
    const progressTrend = recentResults.map(result => ({
      date: result.completed_at.split('T')[0],
      score: result.score,
      subject: result.subject
    }));
    
    // Calculate study streak (consecutive tests with score >= 60%)
    let studyStreak = 0;
    for (const result of results) {
      if (result.score >= 60) {
        studyStreak++;
      } else {
        break;
      }
    }
    
    // Total study time (sum of all test times in minutes)
    const totalStudyTime = Math.round(results.reduce((sum, r) => sum + (r.time_spent || 0), 0) / 60);
    
    // Subject breakdown
    const subjectStats = {};
    results.forEach(result => {
      const subject = result.subject || 'general';
      if (!subjectStats[subject]) {
        subjectStats[subject] = { count: 0, totalScore: 0, totalTime: 0 };
      }
      subjectStats[subject].count++;
      subjectStats[subject].totalScore += result.score || 0;
      subjectStats[subject].totalTime += result.time_spent || 0;
    });
    
    const subjectBreakdown = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      testsCount: stats.count,
      averageScore: Math.round(stats.totalScore / stats.count),
      totalTime: Math.round(stats.totalTime / 60), // Convert to minutes
      percentage: Math.round((stats.count / totalTests) * 100)
    }));
    
    // Difficulty breakdown
    const difficultyStats = {};
    results.forEach(result => {
      const difficulty = result.difficulty || 'medium';
      if (!difficultyStats[difficulty]) {
        difficultyStats[difficulty] = { count: 0, totalScore: 0 };
      }
      difficultyStats[difficulty].count++;
      difficultyStats[difficulty].totalScore += result.score || 0;
    });
    
    const difficultyBreakdown = Object.entries(difficultyStats).map(([difficulty, stats]) => ({
      difficulty,
      testsCount: stats.count,
      averageScore: Math.round(stats.totalScore / stats.count),
      percentage: Math.round((stats.count / totalTests) * 100)
    }));
    
    res.json({
      totalTests,
      averageScore,
      recentActivity,
      progressTrend,
      studyStreak,
      totalStudyTime,
      subjectBreakdown,
      difficultyBreakdown
    });
  });
});

// Get detailed results for a specific subject
router.get('/subject/:subject', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.userId;
  const subject = req.params.subject;
  
  db.all(`
    SELECT tr.*, t.title, t.difficulty
    FROM test_results tr
    LEFT JOIN tests t ON tr.test_id = t.id
    WHERE tr.user_id = ? AND (t.subject = ? OR tr.test_id LIKE ?)
    ORDER BY tr.completed_at DESC
  `, [userId, subject, `%${subject}%`], (err, results) => {
    if (err) {
      console.error('Error fetching subject analytics:', err);
      return res.status(500).json({ error: 'Failed to fetch subject analytics' });
    }
    
    if (results.length === 0) {
      return res.json({
        subject,
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        totalTime: 0,
        results: []
      });
    }
    
    const scores = results.map(r => r.score || 0);
    const totalTests = results.length;
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / totalTests);
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);
    const totalTime = Math.round(results.reduce((sum, r) => sum + (r.time_spent || 0), 0) / 60);
    
    const resultsWithDetails = results.map(result => ({
      id: result.id,
      title: result.title || `Test ${result.test_id}`,
      difficulty: result.difficulty || 'medium',
      score: result.score,
      time_spent: result.time_spent,
      completed_at: result.completed_at,
      answers: JSON.parse(result.answers || '[]')
    }));
    
    res.json({
      subject,
      totalTests,
      averageScore,
      bestScore,
      worstScore,
      totalTime,
      results: resultsWithDetails
    });
  });
});

// Get performance comparison with other users (anonymized)
router.get('/comparison', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.userId;
  
  // Get current user's average score
  db.get('SELECT average_score, tests_completed FROM users WHERE id = ?', [userId], (err, currentUser) => {
    if (err) {
      console.error('Error fetching user data:', err);
      return res.status(500).json({ error: 'Failed to fetch comparison data' });
    }
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get anonymized stats of all users for comparison
    db.all(`
      SELECT 
        COUNT(*) as total_users,
        AVG(average_score) as platform_average,
        MIN(average_score) as min_score,
        MAX(average_score) as max_score
      FROM users 
      WHERE tests_completed > 0
    `, (err, platformStats) => {
      if (err) {
        console.error('Error fetching platform stats:', err);
        return res.status(500).json({ error: 'Failed to fetch platform stats' });
      }
      
      const stats = platformStats[0];
      
      // Calculate percentile
      db.get(`
        SELECT COUNT(*) as users_below
        FROM users 
        WHERE average_score < ? AND tests_completed > 0
      `, [currentUser.average_score], (err, percentileData) => {
        if (err) {
          console.error('Error calculating percentile:', err);
          return res.status(500).json({ error: 'Failed to calculate percentile' });
        }
        
        const percentile = stats.total_users > 0 
          ? Math.round((percentileData.users_below / stats.total_users) * 100)
          : 50;
        
        res.json({
          user: {
            averageScore: currentUser.average_score,
            testsCompleted: currentUser.tests_completed,
            percentile
          },
          platform: {
            totalUsers: stats.total_users,
            averageScore: Math.round(stats.platform_average || 0),
            minScore: stats.min_score || 0,
            maxScore: stats.max_score || 0
          }
        });
      });
    });
  });
});

export default router;

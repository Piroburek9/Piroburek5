import express from 'express';
import { getDB } from '../database/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.userId;
  
  db.get('SELECT id, email, name, role, tests_completed, average_score, study_streak, total_study_time, created_at FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  });
});

// Update user profile
router.put('/', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.userId;
  const { name, email } = req.body;
  
  if (!name && !email) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  // Build dynamic update query
  const updateFields = [];
  const values = [];
  
  if (name) {
    updateFields.push('name = ?');
    values.push(name);
  }
  
  if (email) {
    updateFields.push('email = ?');
    values.push(email);
  }
  
  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(userId);
  
  const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
  
  db.run(query, values, function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      console.error('Error updating profile:', err);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    
    // Fetch updated user data
    db.get('SELECT id, email, name, role, tests_completed, average_score, study_streak, total_study_time FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        console.error('Error fetching updated profile:', err);
        return res.status(500).json({ error: 'Profile updated but failed to fetch updated data' });
      }
      
      res.json(user);
    });
  });
});

// Get user statistics
router.get('/stats', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.userId;
  
  // Get user basic info
  db.get('SELECT tests_completed, average_score, study_streak, total_study_time FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Error fetching user stats:', err);
      return res.status(500).json({ error: 'Failed to fetch user stats' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get test results for detailed stats
    db.all(`
      SELECT tr.*, t.subject, t.title
      FROM test_results tr
      LEFT JOIN tests t ON tr.test_id = t.id
      WHERE tr.user_id = ?
      ORDER BY tr.completed_at DESC
    `, [userId], (err, results) => {
      if (err) {
        console.error('Error fetching test results for stats:', err);
        return res.status(500).json({ error: 'Failed to fetch detailed stats' });
      }
      
      // Calculate detailed statistics
      const totalQuestions = results.reduce((sum, result) => {
        const answers = JSON.parse(result.answers || '[]');
        return sum + answers.length;
      }, 0);
      
      const correctAnswers = results.reduce((sum, result) => {
        const answers = JSON.parse(result.answers || '[]');
        return sum + answers.filter(answer => answer.correct).length;
      }, 0);
      
      // Calculate streak (consecutive tests with score >= 60%)
      let streak = 0;
      for (const result of results) {
        if (result.score >= 60) {
          streak++;
        } else {
          break;
        }
      }
      
      // Determine rank based on average score
      let rank = 'Начинающий';
      if (user.average_score >= 90) rank = 'Эксперт';
      else if (user.average_score >= 80) rank = 'Продвинутый';
      else if (user.average_score >= 70) rank = 'Средний';
      else if (user.average_score >= 60) rank = 'Развивающийся';
      
      // Generate achievements
      const achievements = [];
      if (user.tests_completed >= 1) achievements.push('Первый тест');
      if (user.tests_completed >= 5) achievements.push('Активный ученик');
      if (user.tests_completed >= 10) achievements.push('Настойчивый');
      if (streak >= 3) achievements.push('Серия побед');
      if (user.average_score >= 90) achievements.push('Отличник');
      if (user.total_study_time >= 60) achievements.push('Час изучения');
      
      // Recent tests (last 5)
      const recentTests = results.slice(0, 5).map(result => ({
        subject: result.subject || result.test_id.replace('test-', ''),
        score: Math.round(result.score),
        total: JSON.parse(result.answers || '[]').length,
        percentage: Math.round(result.score),
        completedAt: result.completed_at
      }));
      
      res.json({
        testsCompleted: user.tests_completed || 0,
        averageScore: user.average_score || 0,
        totalQuestions,
        correctAnswers,
        studyTime: user.total_study_time || 0,
        streak,
        rank,
        achievements,
        recentTests
      });
    });
  });
});

export default router;

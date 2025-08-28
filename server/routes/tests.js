import express from 'express';
import { getDB } from '../database/init.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Helper to generate test ID
function generateId(prefix = 'test') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get all tests
router.get('/', (req, res) => {
  const db = getDB();
  
  db.all('SELECT * FROM tests ORDER BY created_at DESC', (err, tests) => {
    if (err) {
      console.error('Error fetching tests:', err);
      return res.status(500).json({ error: 'Failed to fetch tests' });
    }
    
    // Parse questions JSON for each test
    const testsWithParsedQuestions = tests.map(test => ({
      ...test,
      questions: JSON.parse(test.questions || '[]')
    }));
    
    res.json(testsWithParsedQuestions);
  });
});

// Get specific test
router.get('/:id', (req, res) => {
  const db = getDB();
  const testId = req.params.id;
  
  db.get('SELECT * FROM tests WHERE id = ?', [testId], (err, test) => {
    if (err) {
      console.error('Error fetching test:', err);
      return res.status(500).json({ error: 'Failed to fetch test' });
    }
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    res.json({
      ...test,
      questions: JSON.parse(test.questions || '[]')
    });
  });
});

// Create new test (requires authentication and teacher/admin role)
router.post('/', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.userId;
  
  // Check user role
  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Error checking user role:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const { title, subject, difficulty, time_limit, questions } = req.body;
    
    if (!title || !subject || !difficulty || !questions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const testId = generateId('test');
    const questionsJson = JSON.stringify(questions);
    
    const stmt = db.prepare(`
      INSERT INTO tests (id, title, subject, difficulty, time_limit, questions, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(testId, title, subject, difficulty, time_limit, questionsJson, userId, function(err) {
      if (err) {
        console.error('Error creating test:', err);
        return res.status(500).json({ error: 'Failed to create test' });
      }
      
      res.status(201).json({
        id: testId,
        title,
        subject,
        difficulty,
        time_limit,
        questions,
        created_by: userId,
        created_at: new Date().toISOString()
      });
    });
    
    stmt.finalize();
  });
});

// Submit test result
router.post('/submit', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.userId;
  const { answers, score, timeSpent, subject, difficulty } = req.body;
  
  if (!answers || score === undefined || timeSpent === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const resultId = generateId('result');
  const testId = `test-${subject || 'general'}`;
  const answersJson = JSON.stringify(answers);
  
  const stmt = db.prepare(`
    INSERT INTO test_results (id, user_id, test_id, answers, score, time_spent)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(resultId, userId, testId, answersJson, score, timeSpent, function(err) {
    if (err) {
      console.error('Error submitting test result:', err);
      return res.status(500).json({ error: 'Failed to submit test result' });
    }
    
    // Update user statistics
    updateUserStats(userId, score, timeSpent);
    
    res.json({
      id: resultId,
      user_id: userId,
      test_id: testId,
      answers,
      score,
      time_spent: timeSpent,
      completed_at: new Date().toISOString()
    });
  });
  
  stmt.finalize();
});

// Submit test result for specific test
router.post('/:id/submit', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.userId;
  const testId = req.params.id;
  const { answers, score, timeSpent } = req.body;
  
  if (!answers || score === undefined || timeSpent === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const resultId = generateId('result');
  const answersJson = JSON.stringify(answers);
  
  const stmt = db.prepare(`
    INSERT INTO test_results (id, user_id, test_id, answers, score, time_spent)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(resultId, userId, testId, answersJson, score, timeSpent, function(err) {
    if (err) {
      console.error('Error submitting test result:', err);
      return res.status(500).json({ error: 'Failed to submit test result' });
    }
    
    // Update user statistics
    updateUserStats(userId, score, timeSpent);
    
    res.json({
      id: resultId,
      user_id: userId,
      test_id: testId,
      answers,
      score,
      time_spent: timeSpent,
      completed_at: new Date().toISOString()
    });
  });
  
  stmt.finalize();
});

// Get user's test results
router.get('/results/me', authenticateToken, (req, res) => {
  const db = getDB();
  const userId = req.userId;
  
  db.all(`
    SELECT tr.*, t.title, t.subject, t.difficulty
    FROM test_results tr
    LEFT JOIN tests t ON tr.test_id = t.id
    WHERE tr.user_id = ?
    ORDER BY tr.completed_at DESC
  `, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching test results:', err);
      return res.status(500).json({ error: 'Failed to fetch test results' });
    }
    
    // Parse answers JSON for each result
    const resultsWithParsedAnswers = results.map(result => ({
      ...result,
      answers: JSON.parse(result.answers || '[]')
    }));
    
    res.json(resultsWithParsedAnswers);
  });
});

// Helper function to update user statistics
function updateUserStats(userId, score, timeSpent) {
  const db = getDB();
  
  // Get current user stats
  db.get('SELECT tests_completed, average_score, total_study_time FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Error fetching user stats:', err);
      return;
    }
    
    if (!user) return;
    
    const newTestsCompleted = (user.tests_completed || 0) + 1;
    const newAverageScore = user.tests_completed > 0
      ? Math.round(((user.average_score || 0) * user.tests_completed + score) / newTestsCompleted)
      : Math.round(score);
    const newTotalStudyTime = (user.total_study_time || 0) + Math.round(timeSpent / 60); // Convert to minutes
    
    // Update user stats
    const stmt = db.prepare(`
      UPDATE users 
      SET tests_completed = ?, average_score = ?, total_study_time = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(newTestsCompleted, newAverageScore, newTotalStudyTime, userId, (err) => {
      if (err) {
        console.error('Error updating user stats:', err);
      }
    });
    
    stmt.finalize();
  });
}

export default router;

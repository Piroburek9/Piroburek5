import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../data/eduplatform.db');
const DATA_DIR = join(__dirname, '../data');

let db = null;

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database connection
function getDB() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }
  return db;
}

// Initialize database schema
export async function initDatabase() {
  const db = getDB();
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT DEFAULT 'student',
          tests_completed INTEGER DEFAULT 0,
          average_score REAL DEFAULT 0,
          study_streak INTEGER DEFAULT 0,
          total_study_time INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tests table
      db.run(`
        CREATE TABLE IF NOT EXISTS tests (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          subject TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          time_limit INTEGER,
          questions TEXT NOT NULL, -- JSON array
          created_by TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id)
        )
      `);

      // Test results table
      db.run(`
        CREATE TABLE IF NOT EXISTS test_results (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          test_id TEXT NOT NULL,
          answers TEXT NOT NULL, -- JSON array
          score REAL NOT NULL,
          time_spent INTEGER NOT NULL,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (test_id) REFERENCES tests(id)
        )
      `);

      // Sessions table for authentication
      db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // User progress tracking
      db.run(`
        CREATE TABLE IF NOT EXISTS user_progress (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          subject TEXT NOT NULL,
          topic TEXT,
          progress_data TEXT NOT NULL, -- JSON
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // AI chat history (optional)
      db.run(`
        CREATE TABLE IF NOT EXISTS chat_history (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          message TEXT NOT NULL,
          response TEXT NOT NULL,
          context TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database tables created/verified');
          insertDefaultData().then(resolve).catch(reject);
        }
      });
    });
  });
}

// Insert default data
async function insertDefaultData() {
  const db = getDB();
  
  return new Promise((resolve, reject) => {
    // Check if data already exists
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row.count > 0) {
        console.log('Default data already exists');
        resolve();
        return;
      }
      
      console.log('Inserting default data...');
      
      // Insert default users
      const defaultUsers = [
        {
          id: 'user_demo',
          email: 'demo@example.com',
          password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
          name: 'Demo User',
          role: 'student'
        },
        {
          id: 'user_admin',
          email: 'admin@example.com',
          password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
          name: 'Admin User',
          role: 'admin'
        },
        {
          id: 'user_teacher',
          email: 'teacher@example.com',
          password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // teacher123
          name: 'Teacher User',
          role: 'teacher'
        }
      ];

      const insertUser = db.prepare(`
        INSERT INTO users (id, email, password_hash, name, role)
        VALUES (?, ?, ?, ?, ?)
      `);

      defaultUsers.forEach(user => {
        insertUser.run(user.id, user.email, user.password_hash, user.name, user.role);
      });
      insertUser.finalize();

      // Insert default tests
      const defaultTests = [
        {
          id: 'test-1',
          title: 'Математика - Алгебра',
          subject: 'mathematics',
          difficulty: 'medium',
          time_limit: 1800,
          questions: JSON.stringify([
            {
              id: 'q1',
              question: 'Решите уравнение: 2x + 5 = 13',
              type: 'multiple_choice',
              options: ['x = 4', 'x = 3', 'x = 5', 'x = 6'],
              correct_answer: 0,
              explanation: '2x + 5 = 13, значит 2x = 8, откуда x = 4'
            },
            {
              id: 'q2',
              question: 'Найдите значение выражения: (3 + 2) × 4',
              type: 'multiple_choice',
              options: ['20', '18', '14', '16'],
              correct_answer: 0,
              explanation: 'Сначала вычисляем в скобках: 3 + 2 = 5, затем 5 × 4 = 20'
            }
          ]),
          created_by: 'user_teacher'
        },
        {
          id: 'test-2',
          title: 'История Казахстана',
          subject: 'history',
          difficulty: 'easy',
          time_limit: 1200,
          questions: JSON.stringify([
            {
              id: 'q1',
              question: 'В каком году была провозглашена независимость Казахстана?',
              type: 'multiple_choice',
              options: ['1990', '1991', '1992', '1993'],
              correct_answer: 1,
              explanation: 'Казахстан провозгласил независимость 16 декабря 1991 года'
            }
          ]),
          created_by: 'user_teacher'
        }
      ];

      const insertTest = db.prepare(`
        INSERT INTO tests (id, title, subject, difficulty, time_limit, questions, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      defaultTests.forEach(test => {
        insertTest.run(test.id, test.title, test.subject, test.difficulty, test.time_limit, test.questions, test.created_by);
      });
      insertTest.finalize();

      console.log('Default data inserted successfully');
      resolve();
    });
  });
}

// Export database connection
export { getDB };

// Close database connection
export function closeDB() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

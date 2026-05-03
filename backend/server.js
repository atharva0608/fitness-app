const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const app = express();
app.use(cors());
app.use(express.json());

let db;

async function initDB() {
  const dbPath = process.env.DB_PATH || './database.sqlite';
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      password TEXT,
      age INTEGER,
      height INTEGER,
      weight INTEGER,
      bmi REAL
    );

    CREATE TABLE IF NOT EXISTS logs (
      check_key TEXT PRIMARY KEY,
      completed BOOLEAN,
      val1 TEXT,
      val2 TEXT,
      unit TEXT,
      sets TEXT
    );

    CREATE TABLE IF NOT EXISTS history (
      date TEXT PRIMARY KEY,
      completion INTEGER,
      name TEXT
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_json TEXT
    );

    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  
  try {
    await db.exec('ALTER TABLE logs ADD COLUMN sets TEXT');
  } catch(e) {
    // Column already exists
  }
  
  console.log("SQLite Database initialized");
}

initDB();

// --- USER ENDPOINTS ---
app.get('/api/user', async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users ORDER BY id DESC LIMIT 1');
    res.json(user || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user', async (req, res) => {
  const { name, email, password, age, height, weight, bmi } = req.body;
  try {
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      await db.run('UPDATE users SET name = ?, password = ?, age = ?, height = ?, weight = ?, bmi = ? WHERE id = ?', 
        [name, password, age, height, weight, bmi, existing.id]);
    } else {
      await db.run('INSERT INTO users (name, email, password, age, height, weight, bmi) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [name, email, password, age, height, weight, bmi]);
    }
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- LOGS ENDPOINTS ---
app.get('/api/logs', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM logs');
    // Convert to dictionary format expected by frontend: { 'd1_warmup': { completed: true, val1: '10' } }
    const checks = {};
    rows.forEach(row => {
      checks[row.check_key] = {
        completed: row.completed === 1,
        val1: row.val1,
        val2: row.val2,
        unit: row.unit,
        sets: row.sets
      };
    });
    res.json(checks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/logs', async (req, res) => {
  const { check_key, completed, val1, val2, unit, sets } = req.body;
  try {
    const existing = await db.get('SELECT check_key FROM logs WHERE check_key = ?', [check_key]);
    if (existing) {
      await db.run('UPDATE logs SET completed = ?, val1 = ?, val2 = ?, unit = ?, sets = ? WHERE check_key = ?',
        [completed ? 1 : 0, val1, val2, unit, sets, check_key]);
    } else {
      await db.run('INSERT INTO logs (check_key, completed, val1, val2, unit, sets) VALUES (?, ?, ?, ?, ?, ?)',
        [check_key, completed ? 1 : 0, val1, val2, unit, sets]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/logs/batch', async (req, res) => {
  const { checks } = req.body; // Expects object of keys to log data
  try {
    await db.run('BEGIN TRANSACTION');
    for (const [key, data] of Object.entries(checks)) {
      if (!data) continue;
      const completed = data.completed ? 1 : 0;
      const val1 = data.val1 || null;
      const val2 = data.val2 || null;
      const unit = data.unit || null;
      const sets = data.sets || null;
      
      const existing = await db.get('SELECT check_key FROM logs WHERE check_key = ?', [key]);
      if (existing) {
        await db.run('UPDATE logs SET completed = ?, val1 = ?, val2 = ?, unit = ?, sets = ? WHERE check_key = ?',
          [completed, val1, val2, unit, sets, key]);
      } else {
        await db.run('INSERT INTO logs (check_key, completed, val1, val2, unit, sets) VALUES (?, ?, ?, ?, ?, ?)',
          [key, completed, val1, val2, unit, sets]);
      }
    }
    await db.run('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await db.run('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/logs/clear', async (req, res) => {
  try {
    await db.run('DELETE FROM logs');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- META ENDPOINTS (History, Week state) ---
app.get('/api/meta', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM meta');
    const meta = {};
    rows.forEach(r => meta[r.key] = r.value);
    
    // Also attach history
    const history = await db.all('SELECT * FROM history ORDER BY date ASC');
    meta.history = history;

    res.json(meta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/meta', async (req, res) => {
  const { week, lastUpdated, historyItem } = req.body;
  try {
    if (week) await db.run('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', ['week', week, week]);
    if (lastUpdated) await db.run('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?', ['lastUpdated', lastUpdated, lastUpdated]);
    
    if (historyItem) {
      const { date, completion, name } = historyItem;
      const existing = await db.get('SELECT date FROM history WHERE date = ?', [date]);
      if (existing) {
        await db.run('UPDATE history SET completion = ? WHERE date = ?', [completion, date]);
      } else {
        await db.run('INSERT INTO history (date, completion, name) VALUES (?, ?, ?)', [date, completion, name]);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PLAN ENDPOINTS ---
app.get('/api/plan', async (req, res) => {
  try {
    const plan = await db.get('SELECT plan_json FROM plans ORDER BY id DESC LIMIT 1');
    res.json(plan ? JSON.parse(plan.plan_json) : null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/plan', async (req, res) => {
  const { plan } = req.body;
  try {
    const jsonStr = JSON.stringify(plan);
    const existing = await db.get('SELECT id FROM plans ORDER BY id DESC LIMIT 1');
    if (existing) {
      await db.run('UPDATE plans SET plan_json = ? WHERE id = ?', [jsonStr, existing.id]);
    } else {
      await db.run('INSERT INTO plans (plan_json) VALUES (?)', [jsonStr]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend API running on port ${PORT}`));

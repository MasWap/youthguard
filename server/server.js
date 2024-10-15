const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'timeguarduser',
  password: 'timeguardpassword',
  database: 'timeguard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );
    if (rows.length > 0) {
      const match = await bcrypt.compare(password, rows[0].password);
      if (match) {
        res.json({ success: true, user: { id: rows[0].id, username: rows[0].username } });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

async function getAccountCount() {
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM admins');
  return rows[0].count;
}

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Vérifier le nombre de comptes existants
    const accountCount = await getAccountCount();
    if (accountCount > 0) {
      return res.status(403).json({ success: false, message: 'Registration is closed. Only one admin account is allowed.' });
    }
    
    // Vérifier si l'admin existe déjà
    const [existingAdmin] = await pool.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );
    
    if (existingAdmin.length > 0) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO admins (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    res.json({ success: true, admin: { id: result.insertId, username } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/can-register', async (req, res) => {
  try {
    const accountCount = await getAccountCount();
    res.json({ canRegister: accountCount === 0 });
  } catch (error) {
    console.error('Can register check error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/logout', (req, res) => {
  // Dans une application réelle, vous pourriez gérer la session ici
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username FROM admins');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Liste des utilisateurs avec gestion
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const [result] = await pool.query('DELETE FROM admins WHERE id = ?', [userId]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/kids', async (req, res) => {
  try {
    const { username, password, birthDate, adminId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO kids (username, password, birth_date, admin_id) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, birthDate, adminId]
    );
    res.json({ success: true, kid: { id: result.insertId, username } });
  } catch (error) {
    console.error('Add kid error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/kids', async (req, res) => {
  try {
    const [kids] = await pool.query('SELECT id, username, birth_date FROM kids');
    res.json(kids);
  } catch (error) {
    console.error('Get kids error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
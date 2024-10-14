const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

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
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    if (rows.length > 0) {
      res.json({ success: true, user: { id: rows[0].id, username: rows[0].username } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
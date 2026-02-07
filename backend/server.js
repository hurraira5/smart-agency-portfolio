const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- AUTH & LOGIN (FIXED) ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    
    if (userResult.rows.length === 0) return res.status(401).json({ message: "User not found!" });

    const user = userResult.rows[0];
    if (user.password.toString() !== password.toString()) {
      return res.status(401).json({ message: "Invalid password!" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, branch_id: user.branch_id },
      process.env.JWT_SECRET || 'admin123',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role.toLowerCase().trim(), // Ensure role is clean
        branch_id: user.branch_id 
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server Error: " + err.message });
  }
});

// --- MANAGER REGISTRATION ---
app.post('/api/auth/register-manager', async (req, res) => {
  const { username, email, password, branch_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username || 'Manager', email, password, 'manager', parseInt(branch_id)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// REST OF YOUR API (Restaurants, Orders, Menu etc.) - Keep them as they are
app.get('/', (req, res) => res.send("Smart Agency API LIVE"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
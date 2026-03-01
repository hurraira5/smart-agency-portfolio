const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- SIMPLE CORS (Jo pehle kaam kar raha tha) ---
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- TEST ROUTE ---
app.get('/', (req, res) => res.send("Server is Running! 🚀"));

// --- ORIGINAL LOGIN ROUTE ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User not found!" });
    }

    const user = userResult.rows[0];

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password!" });
    }

    // Simple role pick
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'admin123'
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      } 
    });

  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// --- BASIC RESTAURANTS & BRANCHES ---
app.get('/api/restaurants', async (req, res) => {
  const result = await pool.query('SELECT * FROM restaurants');
  res.json(result.rows);
});

app.get('/api/restaurants/:id/branches', async (req, res) => {
  const result = await pool.query('SELECT * FROM branches WHERE restaurant_id = $1', [req.params.id]);
  res.json(result.rows);
});

app.post('/api/branches', async (req, res) => {
  const { restaurant_id, branch_name, manager_email, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO branches (restaurant_id, branch_name, manager_email, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [restaurant_id, branch_name, manager_email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: "DB Error" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
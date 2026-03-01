const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const Pusher = require('pusher');
require('dotenv').config();

const app = express();

// --- 1. HARDOCC CORS BYPASS ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- 2. LOGIN ROUTE (100% FIXED) ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // LOWER() aur TRIM() use kiya taaki koi space ya capital ka masla na rahe
    const userResult = await pool.query(
      'SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))', 
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User not found!" });
    }

    const user = userResult.rows[0];

    // Password ko bhi trim kar ke check kar rahe hain
    if (String(user.password).trim() !== String(password).trim()) {
      return res.status(401).json({ message: "Invalid password!" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, branch_id: user.branch_id, restaurant_id: user.restaurant_id },
      process.env.JWT_SECRET || 'admin123'
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        branch_id: user.branch_id, 
        restaurant_id: user.restaurant_id 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: "Database Error" });
  }
});

// --- 3. RESTAURANTS & BRANCHES (DATA FETCH FIX) ---
app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "DB Error" }); }
});

app.get('/api/restaurants/:id/branches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE restaurant_id = $1 ORDER BY id ASC', [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "DB Error" }); }
});

app.get('/api/orders/:branch_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE branch_id = $1 ORDER BY id DESC', [req.params.branch_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: "DB Error" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server LIVE`));
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 1. CORS & MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 2. DATABASE CONNECTION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- 3. TEST ROUTE ---
app.get('/', (req, res) => res.send("Smart Server is LIVE! 🚀"));

// --- 4. LOGIN ROUTE (STABLE VERSION) ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User not found!" });
    }

    const user = userResult.rows[0];

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
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// --- 5. RESTAURANTS ROUTES ---
app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching restaurants" });
  }
});

app.post('/api/restaurants', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO restaurants (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 6. BRANCHES ROUTES (FIXED FOR DASHBOARD) ---
app.get('/api/restaurants/:id/branches', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM branches WHERE restaurant_id = $1 ORDER BY id ASC', [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching branches" });
  }
});

app.post('/api/branches', async (req, res) => {
  const { restaurant_id, branch_name, manager_email, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO branches (restaurant_id, branch_name, manager_email, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [restaurant_id, branch_name, manager_email, password]
    );
    // User table mein bhi entry taaki manager login kar sakay
    await pool.query(
      'INSERT INTO users (username, email, password, role, branch_id) VALUES ($1, $2, $3, $4, $5)',
      [branch_name, manager_email, password, 'manager', result.rows[0].id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

// --- 7. ORDERS ROUTES ---
app.get('/api/orders/:branch_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE branch_id = $1 ORDER BY id DESC', [req.params.branch_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// --- 8. DELETE & UPDATE (EXTRA SAFETY) ---
app.delete('/api/branches/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM branches WHERE id = $1', [req.params.id]);
    res.json({ message: "Branch deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 1. Root Route (Status Check)
app.get('/', (req, res) => {
  res.send("Burger O'Clock API is up and running!");
});

// 2. LOGIN ROUTE (Bypass Version)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User table mein nahi mila!" });
    }
    const user = userResult.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'admin123',
      { expiresIn: '1d' }
    );
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// ==========================================
// 3. RESTAURANTS ROUTES (Naya Feature)
// ==========================================

// Subse pehle Restaurant add karein
app.post('/api/restaurants', async (req, res) => {
  const { name, owner_name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO restaurants (name, owner_name) VALUES ($1, $2) RETURNING *',
      [name, owner_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Saare Restaurants ki list hasil karein
app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. BRANCHES ROUTES (Linked with Restaurant)
// ==========================================

// Nayi Branch register karein (restaurant_id ke sath)
app.post('/api/branches/register', async (req, res) => {
  const { branch_name, location, manager_name, contact_number, restaurant_id } = req.body;
  try {
    const newBranch = await pool.query(
      'INSERT INTO branches (branch_name, location, manager_name, contact_number, restaurant_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [branch_name, location, manager_name, contact_number, restaurant_id]
    );
    res.status(201).json(newBranch.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kisi specific restaurant ki saari branches dekhne ke liye
app.get('/api/restaurants/:id/branches', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM branches WHERE restaurant_id = $1', [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Branch Delete karne ka route
app.delete('/api/branches/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM branches WHERE id = $1', [req.params.id]);
    res.json({ message: "Branch Deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Port Setting
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
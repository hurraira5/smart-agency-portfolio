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

// 1. Root Route
app.get('/', (req, res) => {
  res.send("Burger O'Clock API is running with Menu Support!");
});

// 2. LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User table mein nahi mila!" });
    }
    const user = userResult.rows[0];
    if (user.password !== password) {
      return res.status(401).json({ message: "Ghalat Password!" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, branch_id: user.branch_id },
      process.env.JWT_SECRET || 'admin123',
      { expiresIn: '1d' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// 3. MENU ROUTES
app.post('/api/menu', async (req, res) => {
  const { name, price, category, branch_id } = req.body;
  try {
    const newItem = await pool.query(
      'INSERT INTO menu_items (name, price, category, branch_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, price, category, branch_id]
    );
    res.status(201).json(newItem.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/menu/:branch_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items WHERE branch_id = $1', [req.params.branch_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE MENU ITEM ROUTE (Naya Add Kiya)
app.delete('/api/menu/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. REGISTER MANAGER 
app.post('/api/auth/register-manager', async (req, res) => {
  const { username, email, password, branch_id } = req.body;
  try {
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, role, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username || 'Manager', email, password, 'admin', branch_id]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database Error", details: err.message });
  }
});

// 5. RESTAURANTS & BRANCHES
app.post('/api/restaurants', async (req, res) => {
  const { name, owner_name, type } = req.body;
  try {
    const result = await pool.query('INSERT INTO restaurants (name, owner_name, type) VALUES ($1, $2, $3) RETURNING *', [name, owner_name, type || 'single']);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/branches/register', async (req, res) => {
  const { branch_name, location, manager_name, contact_number, restaurant_id } = req.body;
  try {
    const result = await pool.query('INSERT INTO branches (branch_name, location, manager_name, contact_number, restaurant_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [branch_name, location, manager_name, contact_number, restaurant_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/restaurants/:id/branches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE restaurant_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/branches/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
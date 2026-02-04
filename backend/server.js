const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Password secure karne ke liye
const jwt = require('jsonwebtoken'); // Login session ke liye
require('dotenv').config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "apka_secret_key_123";

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 2. DATABASE CONNECTION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- 3. LOGIN ROUTE (Email/Username Login) ---
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body; 
  try {
    // Email ya Username dono se dhoondo
    const userRes = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1', 
      [identifier]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: "User nahi mila!" });
    }

    const user = userRes.rows[0];
    
    // Password match check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password galat hai!" });
    }

    // Token banao (Role aur Branch ID ke sath)
    const token = jwt.sign(
      { id: user.id, role: user.role, branch_id: user.branch_id }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({ 
      token, 
      user: { id: user.id, username: user.username, role: user.role, branch_id: user.branch_id } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. SUPER ADMIN: BRANCH ONBOARDING ---
app.post('/api/admin/branches', async (req, res) => {
  const { name, location, boss_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO branches (name, location, boss_id) VALUES ($1, $2, $3) RETURNING *',
      [name, location, boss_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 5. MENU ROUTES ---
app.get('/api/menu', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Menu Error: " + err.message });
  }
});

// --- 6. ORDER POST ROUTE (With Branch ID) ---
app.post('/api/orders', async (req, res) => {
  const { customer_name, phone, address, items, total_amount, branch_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO orders (customer_name, phone, address, items, total_amount, status, branch_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [customer_name, phone, address, JSON.stringify(items), total_amount, 'pending', branch_id]
    );
    res.json({ message: "Order Received!", order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Order Save Error: " + err.message });
  }
});

// --- 7. GET ORDERS (Role Based Filtering) ---
app.get('/api/orders', async (req, res) => {
  const { role, branch_id } = req.query; // Dashboard se query aayegi
  try {
    let query = 'SELECT * FROM orders';
    let params = [];

    // Agar Manager ya Boss hai toh sirf unki branch ka data dikhao
    if (role !== 'superadmin' && branch_id) {
      query += ' WHERE branch_id = $1';
      params.push(branch_id);
    }

    query += ' ORDER BY id DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Get Orders Error: " + err.message });
  }
});

// --- 8. DELETE ORDER ROUTE ---
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Order nahi mila!" });
    }
    res.json({ message: "Order Deleted Successfully! ✅" });
  } catch (err) {
    res.status(500).json({ error: "Delete Error: " + err.message });
  }
});

// --- 9. EXPORT ---
module.exports = app;
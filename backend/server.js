const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const Pusher = require('pusher');
require('dotenv').config();

const app = express();

// --- 1. HARDOCC CORS BYPASS (Vercel/Browser fix) ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// --- 2. CONFIGURATIONS ---
const pusher = new Pusher({
  appId: "2121335",
  key: "bcac1c75483080b47786",
  secret: "47427f42de48a0a9aea1",
  cluster: "mt1",
  useTLS: true
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const generateTxnId = () => `TXN-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

// --- 3. AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (userResult.rows.length === 0) return res.status(401).json({ message: "User not found!" });

    const user = userResult.rows[0];
    if (String(user.password).trim() !== String(password).trim()) {
      return res.status(401).json({ message: "Invalid password!" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, branch_id: user.branch_id, restaurant_id: user.restaurant_id },
      process.env.JWT_SECRET || 'admin123',
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { id: user.id, username: user.username, role: user.role, branch_id: user.branch_id, restaurant_id: user.restaurant_id } 
    });
  } catch (err) {
    res.status(500).json({ error: "Login Error" });
  }
});

// --- 4. RESTAURANT ROUTES ---
app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
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

// --- 5. BRANCH ROUTES ---
app.get('/api/restaurants/:id/branches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE restaurant_id = $1 ORDER BY id ASC', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

app.post('/api/branches', async (req, res) => {
  const { restaurant_id, branch_name, manager_email, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO branches (restaurant_id, branch_name, manager_email, password, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [restaurant_id, branch_name, manager_email, password, 'active']
    );
    await pool.query(
      'INSERT INTO users (username, email, password, role, branch_id) VALUES ($1, $2, $3, $4, $5)',
      [branch_name, manager_email, password, 'manager', result.rows[0].id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

// --- 6. ORDER ROUTES ---
app.post('/api/orders', async (req, res) => {
  const { branch_id, customer_name, customer_phone, customer_address, items, total_amount, payment_method } = req.body;
  try {
    const txnId = generateTxnId();
    const result = await pool.query(
      'INSERT INTO orders (branch_id, customer_name, customer_phone, customer_address, items, total_amount, payment_method, transaction_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [branch_id, customer_name, customer_phone, customer_address, JSON.stringify(items), total_amount, payment_method, txnId, 'pending']
    );
    pusher.trigger("orders-channel", "new-order", { branch_id, message: `Naya order: ${customer_name}`, total: total_amount });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:branch_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE branch_id = $1 ORDER BY id DESC', [req.params.branch_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

// --- 7. UTILITY ROUTES (Edit/Delete/Status) ---
app.put('/api/branches/:id', async (req, res) => {
  await pool.query('UPDATE branches SET branch_name = $1 WHERE id = $2', [req.body.branch_name, req.params.id]);
  res.json({ message: "Updated" });
});

app.delete('/api/branches/:id', async (req, res) => {
  await pool.query('DELETE FROM branches WHERE id = $1', [req.params.id]);
  res.json({ message: "Deleted" });
});

app.get('/api/menu/:branch_id', async (req, res) => {
  const result = await pool.query('SELECT * FROM menu WHERE branch_id = $1', [req.params.branch_id]);
  res.json(result.rows);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Smart Server LIVE`));
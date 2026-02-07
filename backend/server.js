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

// Root Route
app.get('/', (req, res) => {
  res.send("Smart Agency API is LIVE - 6-Digit Order IDs & Manager Fix Active!");
});

// --- 1. RESTAURANTS & BRANDS ---

app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/restaurants', async (req, res) => {
  const { name, type } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO restaurants (name, type) VALUES ($1, $2) RETURNING *',
      [name, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/restaurants/:id/branches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE restaurant_id = $1 ORDER BY id DESC', [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 2. BRANCH & MANAGER MANAGEMENT ---

// FIXED: Manager Registration Logic
app.post('/api/auth/register-manager', async (req, res) => {
  const { username, email, password, branch_id } = req.body;

  if (!email || !password || !branch_id) {
    return res.status(400).json({ error: "Email, Password, and Branch ID are required!" });
  }

  try {
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists!" });
    }

    const result = await pool.query(
      'INSERT INTO users (username, email, password, role, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username || 'Branch Manager', email, password, 'manager', parseInt(branch_id)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { 
    console.error("Manager Registration Error:", err.message);
    res.status(500).json({ error: "Database Rejection: " + err.message }); 
  }
});

app.put('/api/branches/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE branches SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/branches/register', async (req, res) => {
  const { branch_name, location, manager_name, contact_number, restaurant_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO branches (branch_name, location, manager_name, contact_number, restaurant_id, status) 
       VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
      [branch_name, location, manager_name, contact_number, restaurant_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 3. ORDERS API (WITH 6-DIGIT RANDOM ID) ---

app.get('/api/orders/:branch_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE branch_id = $1 ORDER BY created_at DESC', 
      [req.params.branch_id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
  const { branch_id, customer_name, customer_phone, customer_address, city, items, total_amount, delivery_fee, subtotal } = req.body;
  
  const customOrderId = Math.floor(100000 + Math.random() * 900000);

  try {
    const newOrder = await pool.query(
      `INSERT INTO orders (id, branch_id, customer_name, customer_phone, customer_address, city, items, total_amount, payment_method, delivery_fee, subtotal) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [customOrderId, branch_id, customer_name, customer_phone, customer_address, city, JSON.stringify(items), total_amount, 'Cash on Delivery', delivery_fee, subtotal]
    );
    res.status(201).json(newOrder.rows[0]);
  } catch (err) { 
    if (err.code === '23505') {
       const retryId = Math.floor(100000 + Math.random() * 900000);
       const retryResult = await pool.query(
         `INSERT INTO orders (id, branch_id, customer_name, customer_phone, customer_address, city, items, total_amount, payment_method, delivery_fee, subtotal) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
         [retryId, branch_id, customer_name, customer_phone, customer_address, city, JSON.stringify(items), total_amount, 'Cash on Delivery', delivery_fee, subtotal]
       );
       return res.status(201).json(retryResult.rows[0]);
    }
    res.status(500).json({ error: err.message }); 
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
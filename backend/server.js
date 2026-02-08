const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const generateTxnId = () => {
  const datePart = Date.now().toString(36).toUpperCase(); 
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TXN-${datePart}-${randomPart}`;
};

// --- AUTH & LOGIN ---
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
        role: user.role.toLowerCase().trim(), 
        branch_id: user.branch_id 
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// --- BOSS ROUTE: GET ALL BRANCHES ORDERS FOR A BRAND ---
app.get('/api/boss/orders/:restaurantId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT orders.* FROM orders 
       JOIN branches ON orders.branch_id = branches.id 
       WHERE branches.restaurant_id = $1 
       ORDER BY orders.created_at DESC`, 
      [req.params.restaurantId]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- UPDATED REGISTRATION: Supports Manager & Boss Roles ---
app.post('/api/auth/register-manager', async (req, res) => {
  const { username, email, password, branch_id, role } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username || 'Manager', email, password, role || 'manager', parseInt(branch_id)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE ORDER WITH TRANSACTION ID
app.post('/api/orders', async (req, res) => {
  const { branch_id, customer_name, customer_phone, customer_address, items, subtotal, delivery_fee, total_amount } = req.body;
  const transaction_id = generateTxnId();
  try {
    const result = await pool.query(
      `INSERT INTO orders 
      (branch_id, customer_name, customer_phone, customer_address, items, subtotal, delivery_fee, total_amount, status, transaction_id, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Received', $9, NOW()) RETURNING *`,
      [branch_id, customer_name, customer_phone, customer_address, JSON.stringify(items), subtotal, delivery_fee, total_amount, transaction_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/orders/:branchId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE branch_id = $1 ORDER BY created_at DESC', [req.params.branchId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// REST OF YOUR ROUTES...
app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/restaurants/:id/branches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE restaurant_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/restaurants', async (req, res) => {
  const { name, type } = req.body;
  try {
    await pool.query('INSERT INTO restaurants (name, type) VALUES ($1, $2)', [name, type]);
    res.status(201).send("Created");
  } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/branches/register', async (req, res) => {
  const { branch_name, location, restaurant_id } = req.body;
  try {
    await pool.query('INSERT INTO branches (branch_name, location, restaurant_id, status) VALUES ($1, $2, $3, $4)', [branch_name, location, restaurant_id, 'active']);
    res.status(201).send("Branch Registered");
  } catch (err) { res.status(500).send(err.message); }
});

app.get('/', (req, res) => res.send("Smart Agency Enterprise API LIVE"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
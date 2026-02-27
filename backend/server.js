const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const Pusher = require('pusher');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- PUSHER CONFIG ---
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

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateTxnId = () => `TXN-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

// --- LOGIN ROUTE (FIXED & ADDED) ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Email check (LOWER case taaki galti na ho)
    const userResult = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User not found!" });
    }

    const user = userResult.rows[0];

    // 2. Password check
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password!" });
    }

    // 3. Role handling (Agar null ho toh customer bana do, aur hamesha lowercase rakho)
    const userRole = (user.role || 'customer').toLowerCase().trim();

    // 4. Token generation
    const token = jwt.sign(
      { id: user.id, role: userRole, branch_id: user.branch_id, restaurant_id: user.restaurant_id },
      process.env.JWT_SECRET || 'admin123',
      { expiresIn: '7d' }
    );

    // 5. Response
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: userRole, 
        branch_id: user.branch_id,
        restaurant_id: user.restaurant_id 
      } 
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server Error during login" });
  }
});

// --- RESTAURANTS & BRANCHES ---

app.post('/api/restaurants', async (req, res) => {
  const { name, admin_email, admin_password, logo_url } = req.body;
  try {
    const resResult = await pool.query(
      'INSERT INTO restaurants (name, logo_url) VALUES ($1, $2) RETURNING *',
      [name, logo_url || '']
    );
    const restaurantId = resResult.rows[0].id;

    if(admin_email && admin_password) {
        await pool.query(
            'INSERT INTO users (username, email, password, role, restaurant_id) VALUES ($1, $2, $3, $4, $5)',
            [name + " Boss", admin_email, admin_password, 'boss', restaurantId]
        );
    }
    res.status(201).json(resResult.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/branches', async (req, res) => {
  const { restaurant_id, branch_name, manager_email, password, plan } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO branches (restaurant_id, branch_name, manager_email, password, plan, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [restaurant_id, branch_name, manager_email, password, plan || 'Monthly', 'active']
    );
    await pool.query(
      'INSERT INTO users (username, email, password, role, branch_id) VALUES ($1, $2, $3, $4, $5)',
      [branch_name, manager_email, password, 'manager', result.rows[0].id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: "DB Error" }); }
});

app.put('/api/branches/:id', async (req, res) => {
    try {
        const { branch_name } = req.body;
        await pool.query('UPDATE branches SET branch_name = $1 WHERE id = $2', [branch_name, req.params.id]);
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/branches/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM branches WHERE id = $1', [req.params.id]);
        await pool.query('DELETE FROM users WHERE branch_id = $1', [req.params.id]); 
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/auth/reset-credentials', async (req, res) => {
    const { type, id, email, password } = req.body;
    try {
        if(type === 'manager') {
            await pool.query('UPDATE branches SET manager_email = $1, password = $2 WHERE id = $3', [email, password, id]);
            await pool.query('UPDATE users SET email = $1, password = $2 WHERE branch_id = $3', [email, password, id]);
        } else if (type === 'boss') {
            await pool.query('UPDATE users SET email = $1, password = $2 WHERE restaurant_id = $3 AND role = $4', [email, password, id, 'boss']);
        }
        res.json({ message: "Success" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ORDERS ---
app.post('/api/orders', async (req, res) => {
  const { branch_id, customer_name, customer_phone, customer_address, items, total_amount, payment_method } = req.body;
  try {
    const txnId = generateTxnId();
    const result = await pool.query(
      'INSERT INTO orders (branch_id, customer_name, customer_phone, customer_address, items, total_amount, payment_method, transaction_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [branch_id, customer_name, customer_phone, customer_address, JSON.stringify(items), total_amount, payment_method, txnId, 'pending']
    );

    pusher.trigger("orders-channel", "new-order", {
      branch_id: branch_id,
      message: `Naya order aaya hai: ${customer_name}`,
      total: total_amount
    });

    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- GETTERS ---
app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/restaurants/:id/branches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE restaurant_id = $1 ORDER BY id ASC', [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/orders/:branch_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE branch_id = $1 ORDER BY created_at DESC', [req.params.branch_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Smart Server Running on ${PORT}`));
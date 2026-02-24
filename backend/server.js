const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateTxnId = () => `TXN-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

// --- GOOGLE AUTH & LOGIN ---
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
        const { email, name, picture } = ticket.getPayload();
        let userResult = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
        let user;
        if (userResult.rows.length === 0) {
            const newUser = await pool.query(
                'INSERT INTO users (username, email, role, profile_pic, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [name, email, 'customer', picture, 'google-auth-no-pass']
            );
            user = newUser.rows[0];
        } else {
            const updatedUser = await pool.query('UPDATE users SET profile_pic = $1 WHERE email = $2 RETURNING *', [picture, email]);
            user = updatedUser.rows[0];
        }
        const jwtToken = jwt.sign({ id: user.id, role: user.role, branch_id: user.branch_id }, process.env.JWT_SECRET || 'admin123', { expiresIn: '7d' });
        res.json({ token: jwtToken, user: { id: user.id, username: user.username, role: user.role.toLowerCase().trim(), branch_id: user.branch_id, profile_pic: user.profile_pic } });
    } catch (error) { res.status(401).json({ error: "Google verification failed" }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (userResult.rows.length === 0) return res.status(401).json({ message: "User not found!" });
    const user = userResult.rows[0];
    if (user.password !== password) return res.status(401).json({ message: "Invalid password!" });
    const token = jwt.sign({ id: user.id, role: user.role, branch_id: user.branch_id }, process.env.JWT_SECRET || 'admin123');
    res.json({ token, user: { id: user.id, username: user.username, role: user.role.toLowerCase(), branch_id: user.branch_id } });
  } catch (err) { res.status(500).json({ error: "Server Error" }); }
});

// --- CATEGORIES ---
app.get('/api/branches/:id/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE branch_id = $1 ORDER BY name ASC', [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/categories', async (req, res) => {
  const { branch_id, name } = req.body;
  try {
    const result = await pool.query('INSERT INTO categories (branch_id, name) VALUES ($1, $2) RETURNING *', [branch_id, name]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- VOUCHERS SYSTEM ---
app.get('/api/branches/:id/vouchers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vouchers WHERE branch_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Important: Fetch single voucher for Checkout validation
app.get('/api/vouchers/:branchId/:code', async (req, res) => {
  const { branchId, code } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM vouchers WHERE branch_id = $1 AND LOWER(code) = LOWER($2)',
      [branchId, code]
    );
    if (result.rows.length > 0) res.json(result.rows[0]);
    else res.status(404).json({ message: "Invalid Code" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/vouchers', async (req, res) => {
  const { branch_id, code, discount_amount, min_order } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO vouchers (branch_id, code, discount_amount, min_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [branch_id, code, discount_amount, min_order]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/vouchers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vouchers WHERE id = $1', [req.params.id]);
    res.json({ message: "Voucher deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- DELIVERY AREAS ---
app.get('/api/delivery-areas/master', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM delivery_areas_master ORDER BY area_name ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/branches/:id/delivery-areas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM delivery_areas WHERE branch_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/branches/delivery-areas/sync', async (req, res) => {
  const { branch_id, area_name, fee } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO delivery_areas (branch_id, area_name, fee) VALUES ($1, $2, $3) ON CONFLICT (branch_id, area_name) DO UPDATE SET fee = $3 RETURNING *',
      [branch_id, area_name, fee]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- CONFIG & MENU & ORDERS ---
app.put('/api/branches/:id/config', async (req, res) => {
  const { theme_color, is_cod_enabled, is_online_enabled, delivery_fee, tax_percentage, status, discount_global } = req.body;
  try {
    const result = await pool.query(
      `UPDATE branches SET theme_color = $1, is_cod_enabled = $2, is_online_enabled = $3, delivery_fee = $4, tax_percentage = $5, status = $6, discount_global = $7 WHERE id = $8 RETURNING *`,
      [theme_color, is_cod_enabled, is_online_enabled, delivery_fee, tax_percentage, status, discount_global, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/menu', async (req, res) => {
  const { branch_id, name, price, category, description, image_url } = req.body;
  try {
    const result = await pool.query('INSERT INTO menu (branch_id, name, price, category, description, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [branch_id, name, price, category, description, image_url]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM menu WHERE id = $1', [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/menu/:branch_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu WHERE branch_id = $1 ORDER BY id DESC', [req.params.branch_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ORDERS SYSTEM (Fuse Standard) ---
app.get('/api/orders/:branch_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE branch_id = $1 ORDER BY created_at DESC', [req.params.branch_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
  const { branch_id, customer_name, customer_phone, customer_address, items, total_amount, payment_method } = req.body;
  try {
    const txnId = generateTxnId();
    const result = await pool.query(
      'INSERT INTO orders (branch_id, customer_name, customer_phone, customer_address, items, total_amount, payment_method, transaction_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [branch_id, customer_name, customer_phone, customer_address, JSON.stringify(items), total_amount, payment_method, txnId, 'pending']
    );
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

app.get('/api/branches/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(5000, () => console.log('Enterprise SaaS Server LIVE on 5000'));
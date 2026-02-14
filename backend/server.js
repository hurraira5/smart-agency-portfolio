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

// --- AUTH (Same as yours) ---
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

// --- NEW: CATEGORIES SYSTEM ---
app.get('/api/branches/:id/categories', async (req, res) => {
  const result = await pool.query('SELECT * FROM categories WHERE branch_id = $1 ORDER BY name ASC', [req.params.id]);
  res.json(result.rows);
});

app.post('/api/categories', async (req, res) => {
  const { branch_id, name } = req.body;
  const result = await pool.query('INSERT INTO categories (branch_id, name) VALUES ($1, $2) RETURNING *', [branch_id, name]);
  res.status(201).json(result.rows[0]);
});

// --- NEW: MASTER DELIVERY AREAS (For Dropdown) ---
app.get('/api/delivery-areas/master', async (req, res) => {
  const result = await pool.query('SELECT * FROM delivery_areas_master ORDER BY area_name ASC');
  res.json(result.rows);
});

// --- DELIVERY AREAS (Branch Specific) ---
app.get('/api/branches/:id/delivery-areas', async (req, res) => {
  const result = await pool.query('SELECT * FROM delivery_areas WHERE branch_id = $1', [req.params.id]);
  res.json(result.rows);
});

app.post('/api/branches/delivery-areas/sync', async (req, res) => {
  const { branch_id, area_name, fee } = req.body;
  const result = await pool.query(
    'INSERT INTO delivery_areas (branch_id, area_name, fee) VALUES ($1, $2, $3) ON CONFLICT (branch_id, area_name) DO UPDATE SET fee = $3 RETURNING *',
    [branch_id, area_name, fee]
  );
  res.json(result.rows[0]);
});

// --- CONFIG & MENU & ORDERS (Standard SaaS) ---
app.put('/api/branches/:id/config', async (req, res) => {
  const { theme_color, is_cod_enabled, is_online_enabled, delivery_fee, tax_percentage, status, discount_global } = req.body;
  const result = await pool.query(
    `UPDATE branches SET theme_color = $1, is_cod_enabled = $2, is_online_enabled = $3, delivery_fee = $4, tax_percentage = $5, status = $6, discount_global = $7 WHERE id = $8 RETURNING *`,
    [theme_color, is_cod_enabled, is_online_enabled, delivery_fee, tax_percentage, status, discount_global, req.params.id]
  );
  res.json(result.rows[0]);
});

app.post('/api/menu', async (req, res) => {
  const { branch_id, name, price, category, description, image_url } = req.body;
  const result = await pool.query('INSERT INTO menu (branch_id, name, price, category, description, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [branch_id, name, price, category, description, image_url]);
  res.status(201).json(result.rows[0]);
});

app.get('/api/menu/:branch_id', async (req, res) => {
  const result = await pool.query('SELECT * FROM menu WHERE branch_id = $1 ORDER BY id DESC', [req.params.branch_id]);
  res.json(result.rows);
});

app.get('/api/restaurants', async (req, res) => {
  const result = await pool.query('SELECT * FROM restaurants ORDER BY id ASC');
  res.json(result.rows);
});

app.get('/api/restaurants/:id/branches', async (req, res) => {
  const result = await pool.query('SELECT * FROM branches WHERE restaurant_id = $1 ORDER BY id ASC', [req.params.id]);
  res.json(result.rows);
});

app.listen(5000, () => console.log('Enterprise Server Running on 5000'));
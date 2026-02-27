const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
const Pusher = require('pusher');
require('dotenv').config();

const app = express();

// --- 1. HARDOCC CORS FIX ---
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());

// --- 2. PUSHER CONFIG ---
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

// --- TEST ROUTE ---
app.get('/', (req, res) => res.send("Smart API is LIVE! 🚀"));

// --- 3. LOGIN ROUTE (FINAL BULLETPROOF) ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    
    if (userResult.rows.length === 0) return res.status(401).json({ message: "User not found!" });

    const user = userResult.rows[0];
    if (String(user.password) !== String(password)) return res.status(401).json({ message: "Invalid password!" });

    const userRole = (user.role || 'customer').toLowerCase().trim();

    const token = jwt.sign(
      { id: user.id, role: userRole, branch_id: user.branch_id, restaurant_id: user.restaurant_id },
      process.env.JWT_SECRET || 'admin123',
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { id: user.id, username: user.username, role: userRole, branch_id: user.branch_id, restaurant_id: user.restaurant_id } 
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- RESTAURANTS & BRANCHES ---
app.post('/api/restaurants', async (req, res) => {
  const { name, admin_email, admin_password } = req.body;
  try {
    const resResult = await pool.query('INSERT INTO restaurants (name) VALUES ($1) RETURNING *', [name]);
    const restaurantId = resResult.rows[0].id;
    if(admin_email && admin_password) {
        await pool.query('INSERT INTO users (username, email, password, role, restaurant_id) VALUES ($2, $3, $4, $5, $1)',
            [restaurantId, name + " Boss", admin_email, admin_password, 'boss']);
    }
    res.status(201).json(resResult.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/branches', async (req, res) => {
  const { restaurant_id, branch_name, manager_email, password } = req.body;
  try {
    const result = await pool.query('INSERT INTO branches (restaurant_id, branch_name, manager_email, password, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [restaurant_id, branch_name, manager_email, password, 'active']);
    await pool.query('INSERT INTO users (username, email, password, role, branch_id) VALUES ($1, $2, $3, $4, $5)',
      [branch_name, manager_email, password, 'manager', result.rows[0].id]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: "DB Error" }); }
});

app.get('/api/restaurants', async (req, res) => {
  const result = await pool.query('SELECT * FROM restaurants ORDER BY id ASC');
  res.json(result.rows);
});

app.get('/api/restaurants/:id/branches', async (req, res) => {
  const result = await pool.query('SELECT * FROM branches WHERE restaurant_id = $1', [req.params.id]);
  res.json(result.rows);
});

app.get('/api/orders/:branch_id', async (req, res) => {
  const result = await pool.query('SELECT * FROM orders WHERE branch_id = $1 ORDER BY id DESC', [req.params.branch_id]);
  res.json(result.rows);
});

// Update/Delete/Reset Routes
app.put('/api/branches/:id', async (req, res) => {
  await pool.query('UPDATE branches SET branch_name = $1 WHERE id = $2', [req.body.branch_name, req.params.id]);
  res.json({ message: "Updated" });
});

app.delete('/api/branches/:id', async (req, res) => {
  await pool.query('DELETE FROM branches WHERE id = $1', [req.params.id]);
  res.json({ message: "Deleted" });
});

app.put('/api/auth/reset-credentials', async (req, res) => {
  const { type, id, email, password } = req.body;
  if(type === 'manager') {
      await pool.query('UPDATE branches SET manager_email = $1, password = $2 WHERE id = $3', [email, password, id]);
      await pool.query('UPDATE users SET email = $1, password = $2 WHERE branch_id = $3', [email, password, id]);
  } else {
      await pool.query('UPDATE users SET email = $1, password = $2 WHERE restaurant_id = $3 AND role = $4', [email, password, id, 'boss']);
  }
  res.json({ message: "Success" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server LIVE` ));
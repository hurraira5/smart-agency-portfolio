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

const generateTxnId = () => {
  const datePart = Date.now().toString(36).toUpperCase(); 
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TXN-${datePart}-${randomPart}`;
};

// --- AUTH & GOOGLE LOGIN ---
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
    if (user.password.toString() !== password.toString()) return res.status(401).json({ message: "Invalid password!" });
    const token = jwt.sign({ id: user.id, role: user.role, branch_id: user.branch_id }, process.env.JWT_SECRET || 'admin123', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role.toLowerCase().trim(), branch_id: user.branch_id } });
  } catch (err) { res.status(500).json({ error: "Server Error" }); }
});

// --- MENU & BRANCHES ---
app.post('/api/menu', async (req, res) => {
  const { branch_id, name, price, category, description, image_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO menu (branch_id, name, price, category, description, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [branch_id, name, price, category, description, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/menu/:branch_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu WHERE branch_id = $1 ORDER BY id DESC', [req.params.branch_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM menu WHERE id = $1', [req.params.id]);
    res.json({ message: "Item removed" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/branches/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/restaurants/:id/branches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE restaurant_id = $1 ORDER BY id ASC', [req.params.id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/branches/register', async (req, res) => {
  const { branch_name, location, restaurant_id } = req.body;
  try {
    const result = await pool.query('INSERT INTO branches (branch_name, location, restaurant_id, status) VALUES ($1, $2, $3, $4) RETURNING *', [branch_name, location, restaurant_id, 'active']);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/restaurants', async (req, res) => {
  const { name, type } = req.body;
  try {
    const result = await pool.query('INSERT INTO restaurants (name, type) VALUES ($1, $2) RETURNING *', [name, type]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ORDERS ---
app.get('/api/orders/:branch_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE branch_id = $1 ORDER BY created_at DESC', [req.params.branch_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
  const { branch_id, customer_name, customer_phone, customer_address, items, total_amount } = req.body;
  try {
    const txn = generateTxnId();
    const result = await pool.query(
      `INSERT INTO orders (branch_id, customer_name, customer_phone, customer_address, items, total_amount, status, transaction_id, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, 'Received', $7, NOW()) RETURNING *`,
      [branch_id, customer_name, customer_phone, customer_address, JSON.stringify(items), total_amount, txn]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/', (req, res) => res.send("Smart Agency Enterprise API LIVE"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
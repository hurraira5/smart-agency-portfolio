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
  res.send("Smart Agency API is LIVE - Master Control Mode Active!");
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

// --- 2. BRANCH & MANAGER MANAGEMENT (FIXED & IMPROVED) ---

// CREATE MANAGER LOGIN - Isay maine update kiya hai taaki crash na ho
app.post('/api/auth/register-manager', async (req, res) => {
  const { username, email, password, branch_id } = req.body;

  // Manual Check taaki backend crash na ho
  if (!email || !password || !branch_id) {
    return res.status(400).json({ error: "Missing Required Fields (Email, Password, or Branch ID)" });
  }

  try {
    // Check if user already exists
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "This email is already registered!" });
    }

    const result = await pool.query(
      'INSERT INTO users (username, email, password, role, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [username || 'Branch Manager', email, password, 'manager', branch_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { 
    console.error("Manager Registration Error:", err.message);
    res.status(500).json({ error: "Database Error: " + err.message }); 
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

// --- 3. ORDERS API ---

app.get('/api/orders/:branch_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE branch_id = $1 ORDER BY created_at DESC', 
      [req.params.branch_id]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
  const { branch_id, customer_name, customer_phone, customer_address, city, items, total_amount, delivery_fee, subtotal } = req.body;
  try {
    const newOrder = await pool.query(
      `INSERT INTO orders (branch_id, customer_name, customer_phone, customer_address, city, items, total_amount, payment_method, delivery_fee, subtotal) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [branch_id, customer_name, customer_phone, customer_address, city, JSON.stringify(items), total_amount, 'Cash on Delivery', delivery_fee, subtotal]
    );
    res.status(201).json(newOrder.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 4. MENU API ---

app.get('/api/menu/:branch_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items WHERE branch_id = $1 ORDER BY id DESC', [req.params.branch_id]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/menu', async (req, res) => {
  const { name, price, category, branch_id, description } = req.body;
  try {
    const newItem = await pool.query('INSERT INTO menu_items (name, price, category, branch_id, description) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, price, category, branch_id, description]);
    res.status(201).json(newItem.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 5. SETTINGS (TAX & DELIVERY) ---

app.post('/api/delivery-fees', async (req, res) => {
  const { branch_id, area_name, fee } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO delivery_fees (branch_id, area_name, fee) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (branch_id, area_name) DO UPDATE SET fee = EXCLUDED.fee 
       RETURNING *`,
      [branch_id, area_name, fee]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/branches/:id/tax', async (req, res) => {
  const { tax_rate } = req.body;
  try {
    await pool.query('UPDATE branches SET tax_rate = $1 WHERE id = $2', [tax_rate, req.params.id]);
    res.json({ message: "Tax updated successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 6. AUTH & LOGIN ---

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(401).json({ message: "User not found!" });
    const user = userResult.rows[0];
    if (user.password !== password) return res.status(401).json({ message: "Invalid password!" });

    const token = jwt.sign({ id: user.id, role: user.role, branch_id: user.branch_id }, process.env.JWT_SECRET || 'admin123', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, branch_id: user.branch_id } });
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
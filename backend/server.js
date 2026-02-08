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
    if (user.password.toString() !== password.toString()) return res.status(401).json({ message: "Invalid password!" });
    const token = jwt.sign({ id: user.id, role: user.role, branch_id: user.branch_id }, process.env.JWT_SECRET || 'admin123', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role.toLowerCase().trim(), branch_id: user.branch_id } });
  } catch (err) { res.status(500).json({ error: "Server Error" }); }
});

// --- BOSS ORDERS ---
app.get('/api/boss/orders/:restaurantId', async (req, res) => {
  try {
    const result = await pool.query(`SELECT orders.* FROM orders JOIN branches ON orders.branch_id = branches.id WHERE branches.restaurant_id = $1 ORDER BY orders.created_at DESC`, [req.params.restaurantId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- REGISTRATION ---
app.post('/api/auth/register-manager', async (req, res) => {
  const { username, email, password, branch_id, role } = req.body;
  try {
    const result = await pool.query('INSERT INTO users (username, email, password, role, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [username || 'User', email, password, role || 'manager', parseInt(branch_id)]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- BRANCH CRUD ---
app.put('/api/branches/:id', async (req, res) => {
  const { branch_name, location } = req.body;
  try {
    await pool.query('UPDATE branches SET branch_name = $1, location = $2 WHERE id = $3', [branch_name, location, req.params.id]);
    res.json({ message: "Updated" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/branches/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM branches WHERE id = $1', [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/branches/:id/tax', async (req, res) => {
  const { tax_rate } = req.body;
  try {
    await pool.query('UPDATE branches SET tax_rate = $1 WHERE id = $2', [tax_rate, req.params.id]);
    res.json({ message: "Tax Updated" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- PASSWORD UPDATE ---
app.put('/api/auth/update-password', async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  try {
    const user = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (user.rows[0].password !== oldPassword) return res.status(401).json({ message: "Old password incorrect" });
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, userId]);
    res.json({ message: "Password updated" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ORDERS & MENU ---
app.post('/api/orders', async (req, res) => {
  const { branch_id, customer_name, customer_phone, customer_address, items, subtotal, delivery_fee, total_amount } = req.body;
  const transaction_id = generateTxnId();
  try {
    const result = await pool.query(`INSERT INTO orders (branch_id, customer_name, customer_phone, customer_address, items, subtotal, delivery_fee, total_amount, status, transaction_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Received', $9, NOW()) RETURNING *`, [branch_id, customer_name, customer_phone, customer_address, JSON.stringify(items), subtotal, delivery_fee, total_amount, transaction_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/orders/:branchId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE branch_id = $1 ORDER BY created_at DESC', [req.params.branchId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

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

app.get('/api/menu/:branchId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items WHERE branch_id = $1', [req.params.branchId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/menu', async (req, res) => {
  const { name, price, category, branch_id } = req.body;
  try {
    await pool.query('INSERT INTO menu_items (name, price, category, branch_id) VALUES ($1, $2, $3, $4)', [name, price, category, branch_id]);
    res.status(201).send("Item Added");
  } catch (err) { res.status(500).send(err.message); }
});

app.put('/api/menu/:id', async (req, res) => {
  const { name, price } = req.body;
  try {
    await pool.query('UPDATE menu_items SET name = $1, price = $2 WHERE id = $3', [name, price, req.params.id]);
    res.json({ message: "Updated" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ message: "Status Updated" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/branches/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/delivery-fees/:branchId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM delivery_fees WHERE branch_id = $1', [req.params.branchId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/delivery-fees', async (req, res) => {
  const { area_name, fee, branch_id } = req.body;
  try {
    await pool.query('INSERT INTO delivery_fees (area_name, fee, branch_id) VALUES ($1, $2, $3)', [area_name, fee, branch_id]);
    res.status(201).send("Fee Added");
  } catch (err) { res.status(500).send(err.message); }
});

app.delete('/api/delivery-fees/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM delivery_fees WHERE id = $1', [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/', (req, res) => res.send("Smart Agency Enterprise API LIVE"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
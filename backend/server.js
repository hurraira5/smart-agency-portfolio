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
  res.send("Burger O'Clock API is LIVE with Full Manager Support!");
});

// --- 1. ORDERS API ---

// Get Orders for a specific branch
app.get('/api/orders/:branch_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE branch_id = $1 ORDER BY created_at DESC', 
      [req.params.branch_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status (Accept/Cancel)
app.put('/api/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', 
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// Full Order Edit (Customer Details & Items)
app.put('/api/orders/:id', async (req, res) => {
  const { customer_name, customer_phone, customer_address, items, total_amount } = req.body;
  try {
    const result = await pool.query(
      `UPDATE orders SET customer_name=$1, customer_phone=$2, customer_address=$3, items=$4, total_amount=$5 
       WHERE id=$6 RETURNING *`,
      [customer_name, customer_phone, customer_address, JSON.stringify(items), total_amount, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// Post New Order (from Frontend)
app.post('/api/orders', async (req, res) => {
  const { branch_id, customer_name, customer_phone, customer_address, city, items, total_amount, payment_method } = req.body;
  try {
    const newOrder = await pool.query(
      `INSERT INTO orders (branch_id, customer_name, customer_phone, customer_address, city, items, total_amount, payment_method) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [branch_id, customer_name, customer_phone, customer_address, city, JSON.stringify(items), total_amount, payment_method]
    );
    res.status(201).json(newOrder.rows[0]);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// --- 2. MENU API ---

// Get Menu Items for a branch
app.get('/api/menu/:branch_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM menu_items WHERE branch_id = $1 ORDER BY id DESC', 
      [req.params.branch_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add New Menu Item
app.post('/api/menu', async (req, res) => {
  const { name, price, category, branch_id, description } = req.body;
  try {
    const newItem = await pool.query(
      'INSERT INTO menu_items (name, price, category, branch_id, description) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
      [name, price, category, branch_id, description]
    );
    res.status(201).json(newItem.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit Existing Menu Item (NEW ROUTE)
app.put('/api/menu/:id', async (req, res) => {
  const { name, price, category, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE menu_items SET name=$1, price=$2, category=$3, description=$4 WHERE id=$5 RETURNING *',
      [name, price, category, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// Delete Menu Item
app.delete('/api/menu/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. AUTH & BRANCHES ---

// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(401).json({ message: "User not found!" });
    
    const user = userResult.rows[0];
    if (user.password !== password) return res.status(401).json({ message: "Invalid password!" });

    const token = jwt.sign(
      { id: user.id, role: user.role, branch_id: user.branch_id }, 
      process.env.JWT_SECRET || 'admin123', 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        branch_id: user.branch_id 
      } 
    });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// Get Branch Details
app.get('/api/branches/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
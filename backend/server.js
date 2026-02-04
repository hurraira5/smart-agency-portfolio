const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 1. Home Route (Check karne ke liye ke API chal rahi hai)
app.get('/', (req, res) => {
  res.send("Burger O'Clock API is Live! 🍔 (Agency + Menu + Orders are Active)");
});

// --- 2. AGENCY ROUTES (Purana Data) ---
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: " + err.message);
  }
});

// --- 3. RESTAURANT MENU ROUTES ---
app.get('/api/menu', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: " + err.message);
  }
});

app.post('/api/menu/add', async (req, res) => {
  const { name, description, price, category, image_url } = req.body;
  try {
    await pool.query(
      'INSERT INTO menu_items (name, description, price, category, image_url) VALUES ($1, $2, $3, $4, $5)', 
      [name, description, price, category, image_url]
    );
    res.json({ message: "Dish Added Successfully! 🍔" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: " + err.message);
  }
});

// --- 4. ORDERS ROUTES (Naya Checkout System) ---
app.post('/api/orders', async (req, res) => {
  const { customer_name, phone, address, items, total_amount } = req.body;
  try {
    // Items ko JSON string mein badal kar save karenge taaki database handle kar sakay
    const result = await pool.query(
      'INSERT INTO orders (customer_name, phone, address, items, total_amount, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
      [customer_name, phone, address, JSON.stringify(items), total_amount, 'pending']
    );
    res.json({ message: "Order Received! ✅", order: result.rows[0] });
  } catch (err) { 
    console.error("Order Save Error:", err.message);
    res.status(500).send("Database Error: " + err.message); 
  }
});

// --- 5. VIEW ORDERS (Admin ke liye taaki aap dekh saken orders) ---
app.get('/api/orders/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = app;
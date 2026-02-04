const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS ko handle karna taaki Frontend data utha sakay
app.use(cors({
  origin: '*', // Sab origins ko allow kar raha hai (Testing ke liye best hai)
  methods: ['GET', 'POST']
}));

app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 1. Home Route (Check karne ke liye)
app.get('/', (req, res) => {
  res.send("Burger O'Clock API is Fully Functional! 🍔");
});

// --- 2. AGENCY ROUTES ---
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Agency Error: " + err.message);
  }
});

// --- 3. MENU ROUTES ---
app.get('/api/menu', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Menu Error: " + err.message);
  }
});

app.post('/api/menu/add', async (req, res) => {
  const { name, description, price, category, image_url } = req.body;
  try {
    await pool.query(
      'INSERT INTO menu_items (name, description, price, category, image_url) VALUES ($1, $2, $3, $4, $5)', 
      [name, description, price, category, image_url]
    );
    res.json({ message: "Dish Added!" });
  } catch (err) {
    res.status(500).send("Add Menu Error: " + err.message);
  }
});

// --- 4. ORDER SAVE ROUTE (Customer Checkout) ---
app.post('/api/orders', async (req, res) => {
  const { customer_name, phone, address, items, total_amount } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO orders (customer_name, phone, address, items, total_amount, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
      [customer_name, phone, address, JSON.stringify(items), total_amount, 'pending']
    );
    res.json({ message: "Order Received!", order: result.rows[0] });
  } catch (err) { 
    res.status(500).send("Save Order Error: " + err.message); 
  }
});

// --- 5. GET ALL ORDERS (Admin Dashboard ke liye) ---
app.get('/api/orders', async (req, res) => {
  try {
    console.log("Fetching orders from database..."); // Debugging ke liye
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    console.log("Orders found:", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).send("Get Orders Error: " + err.message);
  }
});

module.exports = app;
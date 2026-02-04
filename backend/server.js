const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 2. DATABASE CONNECTION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- 3. BASIC ROUTES ---
app.get('/', (req, res) => {
  res.send("Burger O'Clock API is Running! 🍔");
});

// --- 4. MENU ROUTES (Khana Check Karne Ke Liye) ---
app.get('/api/menu', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Menu Error: " + err.message);
  }
});

// --- 5. ORDER POST ROUTE (Customer Order Save Karne Ke Liye) ---
app.post('/api/orders', async (req, res) => {
  const { customer_name, phone, address, items, total_amount } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO orders (customer_name, phone, address, items, total_amount, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [customer_name, phone, address, JSON.stringify(items), total_amount, 'pending']
    );
    res.json({ message: "Order Received!", order: result.rows[0] });
  } catch (err) {
    res.status(500).send("Order Save Error: " + err.message);
  }
});

// --- 6. GET ALL ORDERS (Admin Panel Ke Liye) ---
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Get Orders Error: " + err.message);
  }
});

// --- 7. DELETE ORDER ROUTE (Admin Se Delete Karne Ke Liye) ---
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req
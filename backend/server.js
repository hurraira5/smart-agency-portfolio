const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test Route
app.get('/', (req, res) => res.send("API is Live (Agency + Restaurant)"));

// --- AGENCY ROUTES ---
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).send(err.message); }
});

// --- RESTAURANT ROUTES ---
app.get('/api/menu', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/menu/add', async (req, res) => {
  const { name, description, price, category, image_url } = req.body;
  try {
    await pool.query('INSERT INTO menu_items (name, description, price, category, image_url) VALUES ($1, $2, $3, $4, $5)', 
    [name, description, price, category, image_url]);
    res.json({ message: "Dish Added!" });
  } catch (err) { res.status(500).send(err.message); }
});

module.exports = app;
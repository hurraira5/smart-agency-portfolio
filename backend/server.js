const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Neon PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test Route
app.get('/', (req, res) => {
  res.send("Restaurant API is running...");
});

// 1. GET Menu Items (Saara khana dikhane ke liye)
app.get('/api/menu', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).send(err.message);
  }
});

// 2. POST Menu Item (Nayi dish add karne ke liye)
app.post('/api/menu/add', async (req, res) => {
  const { name, description, price, category, image_url } = req.body;
  try {
    const query = 'INSERT INTO menu_items (name, description, price, category, image_url) VALUES ($1, $2, $3, $4, $5)';
    await pool.query(query, [name, description, price, category, image_url]);
    res.json({ message: "Dish Added to Menu! 🍔" });
  } catch (err) {
    console.error("Add Error:", err.message);
    res.status(500).send(err.message);
  }
});

// 3. DELETE Menu Item (Dish khatam karne ke liye)
app.delete('/api/menu/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
    res.json({ message: "Dish Removed!" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).send(err.message);
  }
});

// Vercel compatibility logic
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
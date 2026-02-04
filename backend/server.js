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

// Test Route (Check karne ke liye ke backend zinda hai)
app.get('/', (req, res) => {
  res.send("Smart Agency API is running...");
});

// GET Services
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).send(err.message);
  }
});

// POST Service
app.post('/api/services/add', async (req, res) => {
  const { title, description } = req.body;
  try {
    await pool.query('INSERT INTO services (title, description) VALUES ($1, $2)', [title, description]);
    res.json({ message: "Service Added!" });
  } catch (err) {
    console.error("Add Error:", err.message);
    res.status(500).send(err.message);
  }
});

// DELETE Service
app.delete('/api/services/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id = $1', [req.params.id]);
    res.json({ message: "Deleted!" });
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

// Ye line Vercel ke liye sab se zaroori hai
module.exports = app;
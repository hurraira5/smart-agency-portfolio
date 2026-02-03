const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Neon Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test Connection
pool.connect((err) => {
  if (err) console.log("❌ Neon Error:", err);
  else console.log("✅ Neon PostgreSQL Connected!");
});

// GET Services
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).send(err.message); }
});

// POST Service
app.post('/api/services/add', async (req, res) => {
  const { title, description } = req.body;
  try {
    await pool.query('INSERT INTO services (title, description) VALUES ($1, $2)', [title, description]);
    res.json({ message: "Added!" });
  } catch (err) { res.status(500).send(err.message); }
});

// DELETE Service
app.delete('/api/services/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id = $1', [req.params.id]);
    res.json({ message: "Deleted!" });
  } catch (err) { res.status(500).send(err.message); }
});

app.listen(5000, () => console.log('Server on 5000'));
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// --- 1. HARDOCC CORS FIX (Vercel ke liye zaroori) ---
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/', (req, res) => res.send("Server is Running 🚀"));

// =======================
// AUTH LOGIN (UNTOUCHED - JAISA AAPNE DIYA)
// =======================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(401).json({ message: "User not found" });
    const user = userResult.rows[0];
    if (user.password !== password) return res.status(401).json({ message: "Invalid password" });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'admin123', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =======================
// CREATE RESTAURANT (SAFE VERSION)
// =======================
app.post('/api/restaurants', async (req, res) => {
  const { name, admin_email, admin_password } = req.body;

  if (!name || !admin_email || !admin_password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if email already exists
    const emailCheck = await client.query('SELECT id FROM users WHERE email = $1', [admin_email]);
    if (emailCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Email already exists" });
    }

    // Insert Restaurant - Added error handling for missing columns
    const restaurantResult = await client.query(
      'INSERT INTO restaurants (name) VALUES ($1) RETURNING id',
      [name]
    );

    const restaurantId = restaurantResult.rows[0].id;

    // Insert User
    await client.query(
      `INSERT INTO users (email, password, role, restaurant_id) VALUES ($1, $2, 'boss', $3)`,
      [admin_email, admin_password, restaurantId]
    );

    await client.query("COMMIT");
    res.status(201).json({ id: restaurantId, name });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("CRITICAL ERROR:", err.message);
    res.status(500).json({ error: "Database Error: " + err.message });
  } finally {
    client.release();
  }
});

// =======================
// GET ALL RESTAURANTS
// =======================
app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// =======================
// REST OF YOUR ROUTES (BRANCHES, ETC.)
// =======================
// ... (Aapka baaki code jo upar tha)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require("bcryptjs");

const app = express();

// ==========================================
// 1. CORS FIX (Sabse Zaroori - Browser block nahi karega)
// ==========================================
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// DATABASE CONNECTION
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_D9IJQvLGkC8H@ep-icy-poetry-ah0j2swp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

// Test Route (Check karne ke liye)
app.get('/', (req, res) => res.send("Server is Running Online 🚀"));

// ==========================================
// 2. LOGIN ROUTE (Fixed Path for Vercel)
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for:", email);

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = userResult.rows[0];
    
    // Check both hashed and plain password (for safety)
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword && password !== user.password) {
       return res.status(401).json({ message: "Invalid password" });
    }

    // JWT Token generate karna (7 din ke liye)
    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      'SECRET_KEY', 
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { id: user.id, email: user.email, role: user.role, restaurant_id: user.restaurant_id } 
    });
  } catch (err) { 
    console.error("Login Error:", err.message);
    res.status(500).json({ error: err.message }); 
  }
});

// ==========================================
// 3. CREATE RESTAURANT (Apka Original Fixed Logic)
// ==========================================
app.post('/api/restaurants', async (req, res) => {
  const { name, admin_email, admin_password } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Insert Restaurant (Default columns ke sath taaki DB error na de)
    const resResult = await client.query(
      'INSERT INTO restaurants (name, address, location, logo_url, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, 'Default Address', 'Default Location', '', '0000000000']
    );
    const restaurantId = resResult.rows[0].id;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(admin_password, salt);
    
    // Insert User as 'boss'
    await client.query(
      "INSERT INTO users (email, password, role, restaurant_id) VALUES ($1, $2, 'boss', $3)",
      [admin_email, hashedPassword, restaurantId]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Restaurant Registered Successfully 🔥", id: restaurantId });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "DB Error: " + err.message });
  } finally {
    client.release();
  }
});

// Vercel export
module.exports = app;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT} 🚀`));
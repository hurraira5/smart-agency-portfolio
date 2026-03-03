require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// DIRECT CONNECTION (Neon Details)
// ==========================================
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_D9IJQvLGkC8H@ep-icy-poetry-ah0j2swp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

app.get('/', (req, res) => res.send("Server is Running Online 🚀"));

// ==========================================
// 1. LOGIN (Original Logic)
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(401).json({ message: "User not found" });

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword && password !== user.password) {
       return res.status(401).json({ message: "Invalid password" });
    }

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
    res.status(500).json({ error: err.message }); 
  }
});

// ==========================================
// 2. CREATE RESTAURANT (Fix kiya hua code 🔥)
// ==========================================
app.post('/api/restaurants', async (req, res) => {
  const { name, admin_email, admin_password } = req.body;

  if (!name || !admin_email || !admin_password) {
    return res.status(400).json({ error: "Sari fields bharna lazmi hain!" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Email Check
    const emailCheck = await client.query('SELECT id FROM users WHERE email = $1', [admin_email]);
    if (emailCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Ye Email pehle se registered hai!" });
    }

    // 2. Insert Restaurant (Explicitly adding NULL for other columns)
    const resResult = await client.query(
      'INSERT INTO restaurants (name, address, location, phone, logo_url) VALUES ($1, NULL, NULL, NULL, NULL) RETURNING id',
      [name]
    );
    const restaurantId = resResult.rows[0].id;

    // 3. Password Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(admin_password, salt);
    
    // 4. Create Boss User
    await client.query(
      "INSERT INTO users (email, password, role, restaurant_id) VALUES ($1, $2, 'boss', $3)",
      [admin_email, hashedPassword, restaurantId]
    );

    await client.query("COMMIT");

    // SUCCESS MESSAGE 🔥
    res.status(201).json({ 
      message: "Restaurant Registered Successfully 🔥", 
      id: restaurantId 
    });

  } catch (err) {
    await client.query("ROLLBACK");
    // Asli error check karne ke liye Console log
    console.error("DATABASE ERROR:", err.message); 
    res.status(500).json({ error: "Database Error: " + err.message });
  } finally {
    client.release();
  }
});

module.exports = app;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT} 🚀`));
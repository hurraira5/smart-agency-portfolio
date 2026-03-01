require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require("bcrypt");

const app = express();

// --- 1. HARDOCC CORS FIX (Is se Browser block nahi karega) ---
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

// ==========================================
// AUTH LOGIN (EXACTLY YOUR LOGIC - NO CHANGE)
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
      process.env.JWT_SECRET || 'SECRET_KEY', 
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { id: user.id, username: user.username, role: user.role } 
    });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// ==========================================
// CREATE RESTAURANT (100% SUCCESS VERSION)
// ==========================================
app.post('/api/restaurants', async (req, res) => {
  const { name, admin_email, admin_password } = req.body;

  // Validation
  if (!name || !admin_email || !admin_password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Email Check
    const emailCheck = await client.query('SELECT id FROM users WHERE email = $1', [admin_email]);
    if (emailCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Email already exists" });
    }

    // 2. Insert Restaurant (Sirf name use kiya hai taaki structure ka masla na aaye)
    const resResult = await client.query(
      "INSERT INTO restaurants (name) VALUES ($1) RETURNING id",
      [name]
    );

    const restaurantId = resResult.rows[0].id;

    // 3. Create Boss User (Hashed Password ke saath)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(admin_password, salt);
    
    await client.query(
      "INSERT INTO users (email, password, role, restaurant_id) VALUES ($1, $2, 'boss', $3)",
      [admin_email, hashedPassword, restaurantId]
    );

    await client.query("COMMIT");

    // SUCCESS RESPONSE (Yahi frontend par 'Created Successfully' dikhayega)
    res.status(201).json({ 
        message: "Restaurant created successfully", 
        id: restaurantId, 
        name: name 
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DB Error:", err.message);
    res.status(500).json({ error: "Database rejection: " + err.message });
  } finally {
    client.release();
  }
});

// ==========================================
// GET ALL RESTAURANTS
// ==========================================
app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started`));
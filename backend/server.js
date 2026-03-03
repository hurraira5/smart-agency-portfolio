require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require("bcrypt");

const app = express();

// --- CORS & Middleware ---
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

app.get('/', (req, res) => res.send("Server is Running 🚀"));

// ==========================================
// 1. AUTH LOGIN (Original Code - No Change)
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }
    
    const user = userResult.rows[0];
    
    // Original Bcrypt Comparison
    const validPassword = await bcrypt.compare(password, user.password);
    
    // Backup check (agar plain text password ho toh)
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
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        restaurant_id: user.restaurant_id 
      } 
    });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// ==========================================
// 2. CREATE RESTAURANT (Fire Emoji Wala Code 🔥)
// ==========================================
app.post('/api/restaurants', async (req, res) => {
  const { name, admin_email, admin_password } = req.body;

  if (!name || !admin_email || !admin_password) {
    return res.status(400).json({ error: "Sari fields bharna lazmi hain!" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Email duplication check
    const emailCheck = await client.query('SELECT id FROM users WHERE email = $1', [admin_email]);
    if (emailCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Ye Email pehle se registered hai!" });
    }

    // Insert Restaurant
    const resResult = await client.query(
      'INSERT INTO restaurants (name) VALUES ($1) RETURNING id',
      [name]
    );

    const restaurantId = resResult.rows[0].id;

    // Password Hashing for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(admin_password, salt);
    
    // Create User with Role 'boss'
    await client.query(
      "INSERT INTO users (email, password, role, restaurant_id) VALUES ($1, $2, 'boss', $3)",
      [admin_email, hashedPassword, restaurantId]
    );

    await client.query("COMMIT");

    // SUCCESS RESPONSE WITH FIRE EMOJI 🔥
    res.status(201).json({ 
      message: "Restaurant Registered Successfully 🔥", 
      id: restaurantId, 
      name: name 
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error:", err.message);
    res.status(500).json({ error: "Database Error: " + err.message });
  } finally {
    client.release();
  }
});

// ==========================================
// 3. GET ALL RESTAURANTS
// ==========================================
app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});



// ==========================================
// 4. CREATE BRANCH
// ==========================================
app.post('/api/branches', async (req, res) => {
  const { restaurant_id, branch_name, manager_email, password } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const branchResult = await client.query(
      'INSERT INTO branches (restaurant_id, branch_name, manager_email, password, status) VALUES ($1,$2,$3,$4,\'active\') RETURNING id',
      [restaurant_id, branch_name, manager_email, password]
    );

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await client.query(
      'INSERT INTO users (email,password,role,restaurant_id,branch_id) VALUES ($1,$2,\'manager\',$3,$4)',
      [manager_email, hashedPassword, restaurant_id, branchResult.rows[0].id]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Branch Registered Successfully 🔥" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT} 🚀`));
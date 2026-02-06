const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 1. Root Route (Status Check)
app.get('/', (req, res) => {
  res.send("Burger O'Clock API is up and running!");
});

// 2. LOGIN ROUTE (Bypass Version for Testing)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for:", email);

  try {
    // Database mein user check karein
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User table mein nahi mila!" });
    }

    const user = userResult.rows[0];

    // Password bypass karke seedha token generate kar rahe hain
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'admin123',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// 3. BRANCH REGISTRATION ROUTE (Naya Feature)
app.post('/api/branches/register', async (req, res) => {
  const { branch_name, location, manager_name, contact_number } = req.body;
  
  try {
    const newBranch = await pool.query(
      'INSERT INTO branches (branch_name, location, manager_name, contact_number) VALUES ($1, $2, $3, $4) RETURNING *',
      [branch_name, location, manager_name, contact_number]
    );
    res.status(201).json(newBranch.rows[0]);
  } catch (err) {
    console.error("Branch Register Error:", err.message);
    res.status(500).json({ message: "Branch add nahi ho saki", error: err.message });
  }
});

// 4. GET ALL BRANCHES (Dashboard par dikhane ke liye)
app.get('/api/branches', async (req, res) => {
  try {
    const allBranches = await pool.query('SELECT * FROM branches ORDER BY created_at DESC');
    res.json(allBranches.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Port Setting
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
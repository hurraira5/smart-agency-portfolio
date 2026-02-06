const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Root Route (Checking if API is alive)
app.get('/', (req, res) => {
  res.send("Burger O'Clock API is up and running!");
});

// LOGIN ROUTE (PASSWORD BYPASS VERSION)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for:", email);

  try {
    // 1. Database mein user dhoondein
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User table mein nahi mila!" });
    }

    const user = userResult.rows[0];

    // 2. BYPASS LOGIC: Password check nahi hoga, seedha token banega
    console.log("Bypassing password check for user:", user.username);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'admin123',
      { expiresIn: '1d' }
    );

    // 3. Response bhejein
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
    console.error("Server Error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Port settings
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
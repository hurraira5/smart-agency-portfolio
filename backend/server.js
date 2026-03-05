require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

// ==========================================
// CORS CONFIGURATION (VERCEL FRONTEND)
// ==========================================
const corsOptions = {
  origin: "*", // later change to your frontend domain
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use((req,res,next)=>{
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods","GET,POST,PUT,DELETE,OPTIONS");
  next();
});

// ==========================================
// DATABASE CONNECTION (NEON POSTGRESQL)
// ==========================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : false
});

// ==========================================
// TEST ROUTE
// ==========================================
app.get('/', (req, res) => {
  res.send("Server is Running 🚀");
});

// ==========================================
// LOGIN API
// ==========================================
app.post('/api/auth/login', async (req, res) => {

  const { email, password } = req.body;

  try {

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // bcrypt check
    let validPassword = false;

    try {
      validPassword = await bcrypt.compare(password, user.password);
    } catch (err) {}

    // allow plaintext (for old users)
    if (!validPassword && password !== user.password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {

    console.error("Login Error:", error);

    res.status(500).json({
      error: "Server error"
    });

  }

});

// ==========================================
// CREATE RESTAURANT
// ==========================================
app.post('/api/restaurants', async (req, res) => {

  const { name, admin_email, admin_password } = req.body;

  if (!name || !admin_email || !admin_password) {
    return res.status(400).json({
      error: "All fields are required"
    });
  }

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    // check if email exists
    const emailCheck = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [admin_email]
    );

    if (emailCheck.rows.length > 0) {

      await client.query("ROLLBACK");

      return res.status(400).json({
        error: "Email already exists"
      });

    }

    // create restaurant
    const restaurantResult = await client.query(
      "INSERT INTO restaurants (name) VALUES ($1) RETURNING id",
      [name]
    );

    const restaurantId = restaurantResult.rows[0].id;

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(admin_password, salt);

    // create boss user
    await client.query(
      `INSERT INTO users (email,password,role,restaurant_id)
       VALUES ($1,$2,'boss',$3)`,
      [admin_email, hashedPassword, restaurantId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Restaurant Registered Successfully 🔥",
      restaurant_id: restaurantId
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error("Create Restaurant Error:", error);

    res.status(500).json({
      error: "Database error"
    });

  } finally {

    client.release();

  }

});

// ==========================================
// GET ALL RESTAURANTS
// ==========================================
app.get('/api/restaurants', async (req, res) => {

  try {

    const result = await pool.query(
      "SELECT * FROM restaurants ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Database error"
    });

  }

});

// ==========================================
// SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT} 🚀`);
});
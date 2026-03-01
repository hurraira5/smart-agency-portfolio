require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const app = express();

// ================= CORS FIX (FOR VERCEL) =================
app.use(cors());
app.use(express.json());

// ================= DB CONNECTION =================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ================= AUTH MIDDLEWARE (Unchanged) =================
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const superAdminOnly = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

// ================= CREATE RESTAURANT (FIXED) =================
app.post("/api/restaurants", authMiddleware, superAdminOnly, async (req, res) => {
  try {
    // Address ko optional kar diya taaki agar frontend se na aaye to error na de
    const { name, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Restaurant name is required" });
    }

    const result = await pool.query(
      "INSERT INTO restaurants (name, address) VALUES ($1, $2) RETURNING *",
      [name, address || "No Address Provided"] 
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating restaurant - Check Database" });
  }
});

// ================= GET RESTAURANTS (FIXED) =================
app.get("/api/restaurants", authMiddleware, superAdminOnly, async (req, res) => {
  try {
    // Agar created_at ka column nahi hai to ye error deta, isliye simple SELECT kiya
    const result = await pool.query("SELECT * FROM restaurants");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching restaurants" });
  }
});

// ================= LOGIN (EXACTLY SAME AS YOURS) =================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({ token, user: { id: user.id, role: user.role, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login error" });
  }
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
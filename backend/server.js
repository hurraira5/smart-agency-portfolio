require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

// ==========================================
// IMPROVED CORS CONFIGURATION
// ==========================================
const allowedOrigins = [
  "http://localhost:3000",
  "https://smart-agency-food-frontend-new.vercel.app",
  "https://smart-agency-food-frontend-new.vercel.app/",
  "https://smart-agency-backend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());

// ==========================================
// DATABASE
// ==========================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_D9IJQvLGkC8H@ep-icy-poetry-ah0j2swp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

// ==========================================
// TEST ROUTE
// ==========================================
app.get("/", (req, res) => {
  res.json({ 
    message: "Backend Running 🚀",
    cors: "enabled",
    environment: process.env.NODE_ENV || "development"
  });
});

// ==========================================
// TEST CORS ROUTE
// ==========================================
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "CORS is working!",
    origin: req.headers.origin 
  });
});

// ==========================================
// LOGIN - UPDATED WITH BETTER ERROR HANDLING
// ==========================================
app.post("/api/auth/login", async (req, res) => {
  // Set CORS headers explicitly for this route
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ 
      message: "Email and password are required" 
    });
  }

  try {
    // Get user with role-specific data
    const result = await pool.query(`
      SELECT u.*, 
             r.id as restaurant_id, 
             r.name as restaurant_name,
             b.id as branch_id,
             b.branch_name
      FROM users u
      LEFT JOIN restaurants r ON u.restaurant_id = r.id
      LEFT JOIN branches b ON u.branch_id = b.id
      WHERE u.email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Check password
    let validPassword = false;
    try {
      validPassword = await bcrypt.compare(password, user.password);
    } catch (e) {
      // Fallback to plain text comparison (temporary, for existing users)
      validPassword = (password === user.password);
    }

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        email: user.email,
        branch_id: user.branch_id,
        restaurant_id: user.restaurant_id
      },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "7d" }
    );

    // Return complete user data
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username || user.email.split('@')[0],
        role: user.role,
        branch_id: user.branch_id,
        branch_name: user.branch_name,
        restaurant_id: user.restaurant_id,
        restaurant_name: user.restaurant_name
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);
});

module.exports = app;
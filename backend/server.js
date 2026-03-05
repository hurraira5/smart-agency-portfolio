require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

// ==========================================
// CORS
// ==========================================
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://smart-agency-food-frontend-new.vercel.app"
  ],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(express.json());

// ==========================================
// DATABASE
// ==========================================
const pool = new Pool({
  connectionString:
  "postgresql://neondb_owner:npg_D9IJQvLGkC8H@ep-icy-poetry-ah0j2swp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

// ==========================================
// TEST
// ==========================================
app.get("/", (req,res)=>{
  res.json({message:"Backend Running 🚀"});
});

// ==========================================
// LOGIN
// ==========================================
app.post("/api/auth/login", async (req,res)=>{

  const {email,password} = req.body;

  try{

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if(result.rows.length === 0){
      return res.status(401).json({message:"User not found"});
    }

    const user = result.rows[0];

    let validPassword = false;

    try{
      validPassword = await bcrypt.compare(password,user.password);
    }catch(e){}

    if(!validPassword && password !== user.password){
      return res.status(401).json({message:"Invalid password"});
    }

    const token = jwt.sign(
      {id:user.id,role:user.role},
      process.env.JWT_SECRET || "SECRET_KEY",
      {expiresIn:"7d"}
    );

    res.json({
      token,
      user:{
        id:user.id,
        role:user.role
      }
    });

  }catch(err){

    console.log(err);

    res.status(500).json({
      error:"Server error"
    });

  }

});

module.exports = app;
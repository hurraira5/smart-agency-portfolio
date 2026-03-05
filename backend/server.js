require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

// ==========================================
// CORS FIX (Allow Vercel + Localhost)
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
// DATABASE CONNECTION (NEON POSTGRESQL)
// ==========================================
const pool = new Pool({
  connectionString:
  "postgresql://neondb_owner:npg_D9IJQvLGkC8H@ep-icy-poetry-ah0j2swp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

// ==========================================
// TEST ROUTE
// ==========================================
app.get("/", (req,res)=>{
  res.send("Backend Running 🚀");
});

// ==========================================
// LOGIN API
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

// ==========================================
// CREATE RESTAURANT
// ==========================================
app.post("/api/restaurants", async (req,res)=>{

  const {name,admin_email,admin_password} = req.body;

  try{

    const restaurant = await pool.query(
      "INSERT INTO restaurants(name) VALUES($1) RETURNING id",
      [name]
    );

    const restaurantId = restaurant.rows[0].id;

    const hashed = await bcrypt.hash(admin_password,10);

    await pool.query(
      "INSERT INTO users(email,password,role,restaurant_id) VALUES($1,$2,'boss',$3)",
      [admin_email,hashed,restaurantId]
    );

    res.json({
      message:"Restaurant Created",
      restaurantId
    });

  }catch(err){

    console.log(err);

    res.status(500).json({
      error:"Database error"
    });

  }

});

// ==========================================
// GET RESTAURANTS
// ==========================================
app.get("/api/restaurants", async (req,res)=>{

  try{

    const result = await pool.query(
      "SELECT * FROM restaurants ORDER BY id DESC"
    );

    res.json(result.rows);

  }catch(err){

    res.status(500).json({error:"Database error"});

  }

});

// ==========================================
// GET BRANCHES
// ==========================================
app.get("/api/restaurants/:id/branches", async (req,res)=>{

  const id = req.params.id;

  try{

    const result = await pool.query(
      "SELECT * FROM branches WHERE restaurant_id=$1",
      [id]
    );

    res.json(result.rows);

  }catch(err){

    res.json([]);

  }

});

// ==========================================
// CREATE BRANCH
// ==========================================
app.post("/api/branches", async (req,res)=>{

  const {restaurant_id,branch_name,manager_email,password} = req.body;

  try{

    const branch = await pool.query(
      "INSERT INTO branches(branch_name,restaurant_id,status) VALUES($1,$2,'active') RETURNING id",
      [branch_name,restaurant_id]
    );

    const branchId = branch.rows[0].id;

    const hashed = await bcrypt.hash(password,10);

    await pool.query(
      "INSERT INTO users(email,password,role,branch_id) VALUES($1,$2,'manager',$3)",
      [manager_email,hashed,branchId]
    );

    res.json({
      message:"Branch Created"
    });

  }catch(err){

    console.log(err);

    res.status(500).json({
      error:"Branch create failed"
    });

  }

});

// ==========================================
// DELETE BRANCH
// ==========================================
app.delete("/api/branches/:id", async (req,res)=>{

  const id = req.params.id;

  try{

    await pool.query(
      "DELETE FROM branches WHERE id=$1",
      [id]
    );

    res.json({
      message:"Branch Deleted"
    });

  }catch(err){

    res.status(500).json({
      error:"Delete failed"
    });

  }

});

// ==========================================
// RESET CREDENTIALS
// ==========================================
app.put("/api/auth/reset-credentials", async (req,res)=>{

  const {type,id,email,password} = req.body;

  try{

    const hashed = await bcrypt.hash(password,10);

    if(type === "boss"){

      await pool.query(
        "UPDATE users SET email=$1,password=$2 WHERE restaurant_id=$3 AND role='boss'",
        [email,hashed,id]
      );

    }else{

      await pool.query(
        "UPDATE users SET email=$1,password=$2 WHERE branch_id=$3 AND role='manager'",
        [email,hashed,id]
      );

    }

    res.json({
      message:"Credentials Updated"
    });

  }catch(err){

    res.status(500).json({
      error:"Update failed"
    });

  }

});

// ==========================================
// SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
  console.log("Server running on port "+PORT+" 🚀");
});
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_D9IJQvLGkC8H@ep-icy-poetry-ah0j2swp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

app.get('/', (req, res) => res.send("Server is Running Online 🚀"));

// 1. LOGIN (Wahi purana logic jo chal raha tha)
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

    const token = jwt.sign({ id: user.id, role: user.role }, 'SECRET_KEY', { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// 2. CREATE RESTAURANT (Ab columns ke sath banega)
app.post('/api/restaurants', async (req, res) => {
  const { name, admin_email, admin_password } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Yahan columns (address, location, logo_url, phone) add kiye hain taaki DB error na de
    const resResult = await client.query(
      'INSERT INTO restaurants (name, address, location, logo_url, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, 'Default Address', 'Default Location', '', '0000000000']
    );
    const restaurantId = resResult.rows[0].id;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(admin_password, salt);
    
    await client.query(
      "INSERT INTO users (email, password, role, restaurant_id) VALUES ($1, $2, 'boss', $3)",
      [admin_email, hashedPassword, restaurantId]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Restaurant Registered Successfully 🔥", id: restaurantId });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "DB Error: " + err.message });
  } finally {
    client.release();
  }
});

module.exports = app;
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT} 🚀`));
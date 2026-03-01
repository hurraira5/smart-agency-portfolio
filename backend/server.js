const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// =======================
// TEST ROUTE
// =======================
app.get('/', (req, res) => {
  res.send("Server is Running 🚀");
});

// =======================
// AUTH LOGIN
// =======================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'admin123',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// =======================
// CREATE RESTAURANT (Brand)
// =======================
app.post('/api/restaurants', async (req, res) => {
  const { name, admin_email, admin_password } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO restaurants (name) VALUES ($1) RETURNING *',
      [name]
    );

    // Create boss user
    await pool.query(
      'INSERT INTO users (email, password, role, restaurant_id) VALUES ($1,$2,$3,$4)',
      [admin_email, admin_password, 'boss', result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating restaurant" });
  }
});

// =======================
// GET ALL RESTAURANTS
// =======================
app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM restaurants ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching restaurants" });
  }
});

// =======================
// GET BRANCHES BY RESTAURANT
// =======================
app.get('/api/restaurants/:id/branches', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM branches WHERE restaurant_id = $1 ORDER BY id DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error fetching branches" });
  }
});

// =======================
// CREATE BRANCH
// =======================
app.post('/api/branches', async (req, res) => {
  const { restaurant_id, branch_name, manager_email, password } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO branches 
       (restaurant_id, branch_name, manager_email, password, status)
       VALUES ($1,$2,$3,$4,'active')
       RETURNING *`,
      [restaurant_id, branch_name, manager_email, password]
    );

    // Create manager user
    await pool.query(
      `INSERT INTO users (email,password,role,restaurant_id,branch_id)
       VALUES ($1,$2,'manager',$3,$4)`,
      [manager_email, password, restaurant_id, result.rows[0].id]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating branch" });
  }
});

// =======================
// UPDATE BRANCH NAME
// =======================
app.put('/api/branches/:id', async (req, res) => {
  const { branch_name } = req.body;

  try {
    await pool.query(
      'UPDATE branches SET branch_name = $1 WHERE id = $2',
      [branch_name, req.params.id]
    );
    res.json({ message: "Branch updated" });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// =======================
// TOGGLE BRANCH STATUS
// =======================
app.put('/api/branches/:id/status', async (req, res) => {
  const { status } = req.body;

  try {
    await pool.query(
      'UPDATE branches SET status = $1 WHERE id = $2',
      [status, req.params.id]
    );
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: "Status update failed" });
  }
});

// =======================
// DELETE BRANCH
// =======================
app.delete('/api/branches/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM branches WHERE id = $1',
      [req.params.id]
    );
    res.json({ message: "Branch deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// =======================
// RESET CREDENTIALS
// =======================
app.put('/api/auth/reset-credentials', async (req, res) => {
  const { type, id, email, password } = req.body;

  try {
    if (type === 'boss') {
      await pool.query(
        'UPDATE users SET email=$1,password=$2 WHERE restaurant_id=$3 AND role=$4',
        [email, password, id, 'boss']
      );
    }

    if (type === 'manager') {
      await pool.query(
        'UPDATE users SET email=$1,password=$2 WHERE branch_id=$3 AND role=$4',
        [email, password, id, 'manager']
      );
    }

    res.json({ message: "Credentials updated" });

  } catch (err) {
    res.status(500).json({ error: "Reset failed" });
  }
});

// =======================
// ORDERS BY BRANCH
// =======================
app.get('/api/orders/:branchId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE branch_id = $1 ORDER BY id DESC',
      [req.params.branchId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Orders fetch failed" });
  }
});

// =======================
// MENU BY BRANCH
// =======================
app.get('/api/menu/:branchId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM menu WHERE branch_id = $1',
      [req.params.branchId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Menu fetch failed" });
  }
});

// =======================
// VOUCHERS BY BRANCH
// =======================
app.get('/api/branches/:branchId/vouchers', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vouchers WHERE branch_id = $1',
      [req.params.branchId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Voucher fetch failed" });
  }
});


// =======================
// SERVER START
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const generateTxnId = () => {
  const datePart = Date.now().toString(36).toUpperCase(); 
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `TXN-${datePart}-${randomPart}`;
};

// ==========================================
// 1. AUTH & USER MANAGEMENT
// ==========================================

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (userResult.rows.length === 0) return res.status(401).json({ message: "User not found!" });
    const user = userResult.rows[0];
    if (user.password.toString() !== password.toString()) return res.status(401).json({ message: "Invalid password!" });
    const token = jwt.sign({ id: user.id, role: user.role, branch_id: user.branch_id }, process.env.JWT_SECRET || 'admin123', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role.toLowerCase().trim(), branch_id: user.branch_id } });
  } catch (err) { res.status(500).json({ error: "Server Error" }); }
});

app.post('/api/auth/register-manager', async (req, res) => {
  const { username, email, password, branch_id, role } = req.body;
  try {
    const result = await pool.query('INSERT INTO users (username, email, password, role, branch_id) VALUES ($1, $2, $3, $4, $5) RETURNING *', [username || 'Manager', email, password, role || 'manager', parseInt(branch_id)]);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ✅ ADDED: DELETE MANAGER/BOSS ACCOUNT
app.delete('/api/auth/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: "Account deleted successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 2. BRANCH & RESTAURANT MANAGEMENT
// ==========================================

// ✅ ADDED: BRANCH STATUS UPDATE (Active/Paused/Closed)
app.put('/api/branches/:id/status', async (req, res) => {
  const { status } = req.body; // 'active', 'paused', 'closed'
  try {
    await pool.query('UPDATE branches SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ message: `Branch is now ${status}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM restaurants ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/restaurants/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('BEGIN');
    await pool.query('DELETE FROM orders WHERE branch_id IN (SELECT id FROM branches WHERE restaurant_id = $1)', [id]);
    await pool.query('DELETE FROM branches WHERE restaurant_id = $1', [id]);
    await pool.query('DELETE FROM restaurants WHERE id = $1', [id]);
    await pool.query('COMMIT');
    res.json({ message: "Brand deleted!" });
  } catch (err) { await pool.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
});

// ==========================================
// 3. ORDERS API (WITH SECURITY CHECK)
// ==========================================



app.post('/api/orders', async (req, res) => {
  const { branch_id, customer_name, customer_phone, customer_address, items, total_amount } = req.body;

  try {
    // 🛡️ SECURITY CHECK: Order block karein agar branch offline hai
    const branchCheck = await pool.query('SELECT status FROM branches WHERE id = $1', [branch_id]);
    
    if (branchCheck.rows.length === 0 || branchCheck.rows[0].status !== 'active') {
      return res.status(403).json({ 
        message: "Order Blocked! This branch is currently not accepting orders." 
      });
    }

    const transaction_id = generateTxnId();
    const result = await pool.query(
      `INSERT INTO orders 
      (branch_id, customer_name, customer_phone, customer_address, items, total_amount, status, transaction_id, created_at) 
      VALUES ($1, $2, $3, $4, $5, $6, 'Received', $7, NOW()) RETURNING *`,
      [branch_id, customer_name, customer_phone, customer_address, JSON.stringify(items), total_amount, transaction_id]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ... (Baaki saare routes jo pehle se thay) ...

app.get('/', (req, res) => res.send("Smart Agency Enterprise API LIVE"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
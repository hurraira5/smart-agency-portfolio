const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Environment variables load karne ke liye
dotenv.config();

const app = express();

// --- MIDDLEWARE ---
// Taaki hum JSON data receive kar saken
app.use(express.json());
// Taaki Frontend (React) aur Backend aapas mein baat kar saken
app.use(cors());

// --- ROUTES ---
// Services ke liye route
app.use('/api/services', require('./routes/serviceRoutes'));
// Orders ke liye route
app.use('/api/orders', require('./routes/orderRoutes'));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully (Local)!');
    })
    .catch((err) => {
        console.log('❌ MongoDB Connection Error:', err);
    });

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔗 API Link: http://localhost:${PORT}/api/services`);
});
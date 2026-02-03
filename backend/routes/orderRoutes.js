const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// 1. Naya Order Save karne ka rasta (Ye pehle se tha)
router.post('/place-order', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 2. Saare orders dekhne ke liye (Naya code yahan add karein)
router.get('/all', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }); // Newest first
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Order delete karne ke liye
router.delete('/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Order deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; // Ye line hamesha sabse niche honi chahiye
const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// 1. Saari services hasil karna (Pehle se tha)
router.get('/', async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Nayi Service add karna (Admin ke liye)
router.post('/add', async (req, res) => {
    const service = new Service({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price
    });
    try {
        const newService = await service.save();
        res.status(201).json(newService);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. Service delete karna (Admin ke liye)
router.delete('/:id', async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: "Service Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
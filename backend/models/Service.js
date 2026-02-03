const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, Optional: true },
    image: { type: String }, // Hum image ka URL yahan rakhenge
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
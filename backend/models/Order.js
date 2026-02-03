const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    serviceName: { type: String, required: true },
    status: { 
        type: String, 
        default: 'Pending', 
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'] 
    },
    totalAmount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
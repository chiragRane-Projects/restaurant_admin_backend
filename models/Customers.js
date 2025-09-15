const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    address: {type: String, required: true},
    authProvider: { type: String, enum: ['email', 'google'], default: 'email' },
    googleId: { type: String },
    visits: {type: Number, default: 0},
    loyaltyPoints: {type: Number, default: 0}, 
}, {timestamps: true})

module.exports = mongoose.model('Customer', customerSchema);
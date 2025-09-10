const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    quantity: {type: String, enum:['half', 'full'], default: 'full'},
    category: {type: String, enum:['starters', 'main-course', 'dessert', 'beverages'], required: true},
    dietory: {type: String, enum: ['veg', 'non-veg', 'egge'], required: true},
    price: {type: Number, required: true},
    image: {type: String},
}, {timestamps: true});

module.exports = mongoose.model("Dish", dishSchema);
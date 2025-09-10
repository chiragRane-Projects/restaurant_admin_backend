const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNo: {type: Number, required: true, unique: true},
    seatingCap: {type: Number, default: 2, required: true},
    isAvailable: {type: Boolean, required: true, default: true},
    reservation: {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    from: Date,
    to: Date
  }
}, {timestamps: true});

module.exports = mongoose.model('Table', tableSchema);
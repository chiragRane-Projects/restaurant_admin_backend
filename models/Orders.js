const mongoose = require('mongoose')

const ordersSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    items: [
      {
        dish: { type: mongoose.Schema.Types.ObjectId, ref: "Dish", required: true },
        name: { type: String, required: true }, 
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    status: { type: String, enum: ['preparing', 'ready', 'cancelled', 'delivered'], default: "preparing" },
    paymentMode: { type: String, enum: ['cod', 'online'], required: true  },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: "pending"},
    totalAmount: {type: Number, required: true}
}, { timestamps: true });

module.exports = mongoose.model('Order', ordersSchema);
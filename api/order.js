const express = require('express')
const router = express.Router();
const Order = require("../models/Orders");
const Dishes = require("../models/Dishes");
const {auth, ownerOnly} = require('../middleware/auth');

router.get("/", auth, ownerOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer")
      .populate("items.dish")
      .populate("tableId");

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    return res.status(200).json({ message: "Orders fetched", orders });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customer, items, paymentMode } = req.body;

    let totalAmount = 0;

    const orderItems = [];

    for (const item of items) {
      const dish = await Dishes.findById(item.dish);
      if (!dish) {
        return res.status(404).json("No such item found");
      }
    }

    const quantity = item.quantity || 1;
    const price = dish.price;
    const subTotal = price * quantity;

    totalAmount += subTotal;

    orderItems.push(
      {
        dish: dish._id,
        name: dish.name,
        price: price,
        quantity: quantity,
      }
    );

    const newOrder = new Order({
      customer,
      items: orderItems,
      paymentMode,
      tableId,
      totalAmount,
      status: "preparing",
      paymentStatus: "pending",
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order: savedOrder,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
})


module.exports = router;
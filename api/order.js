const express = require('express');
const router = express.Router();
const Dish = require('../models/Dishes');
const Order = require('../models/Orders');
const { auth, ownerOnly } = require('../middleware/auth');

router.get('/', auth, ownerOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("items.dish")
      .sort({ createdAt: -1 });

    if (orders.length === 0) return res.status(404).json({ message: "No orders found" });

    return res.status(200).json({ message: "Orders fetched", orders });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Server Error", error });
  }
});

router.get('/my-orders', auth, async(req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
    .sort({ createdAt: -1 });

    return res.json({message: "My orders fetched", orders});
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
})

router.post('/', auth, async (req, res) => {
  try {
    const { items, paymentMode } = req.body;

    if (!items) {
      return res.status(400).json({ message: "No items in order" });
    }

    let totalAmount = 0;
    const populatedItems = [];

    for (let item of items) {
      const dish = await Dish.findById(item.dish);

      if (!dish) {
        return res.status(404).json({ message: `Dish not found: ${item.dish}` });
      }

      const orderItem = {
        dish: dish._id,
        name: dish.name,
        price: dish.price,
        quantity: item.quantity
      };

      populatedItems.push(orderItem);
      totalAmount += dish.price * item.quantity;
    }

    const newOrder = await Order.create({
      customer: req.user.id,
      items: populatedItems,
      paymentMode,
      totalAmount,
    })

    return res.status(201).json({message: "Order Placed", order: newOrder._id});
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Server error" });
  }
})

router.patch('/:id/status', auth, ownerOnly, async(req, res) => {
  try {
    const {status} = req.body;
    const order = await Order.findById(req.params.id);

    if(!order){
      return res.status(404).json({message: "Order not found"});
    }

    order.status = status;
    await order.save();

    return res.status(200).json({message: "Order updated", orderId: order._id});
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
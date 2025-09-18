// /api/adminReports.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Orders");
const { auth, ownerOnly } = require("../middleware/auth");

// ---------- DASHBOARD SUMMARY ----------
router.get("/stats/summary", auth, ownerOnly, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todaySales, weekSales, monthSales, activeOrders, topDishAgg] =
      await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: startOfToday } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: startOfWeek } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: startOfMonth } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
        Order.countDocuments({ status: { $in: ["preparing", "ready"] } }),
        Order.aggregate([
          { $unwind: "$items" },
          { $group: { _id: "$items.name", qty: { $sum: "$items.quantity" } } },
          { $sort: { qty: -1 } },
          { $limit: 1 },
        ]),
      ]);

    res.json({
      todaySales: todaySales[0]?.total || 0,
      weekSales: weekSales[0]?.total || 0,
      monthSales: monthSales[0]?.total || 0,
      activeOrders,
      topDish: topDishAgg[0]?._id || "N/A",
      currency: "INR",
    });
  } catch (err) {
    console.error("Summary API error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- REVENUE TREND ----------
router.get("/stats/revenue-trend", auth, ownerOnly, async (req, res) => {
  try {
    const { range = "7d" } = req.query;
    let days = 7;
    if (range.endsWith("d")) days = parseInt(range) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(
      revenue.map(r => ({
        date: r._id,
        revenue: r.revenue,
        currency: "INR",
      }))
    );
  } catch (err) {
    console.error("Revenue trend error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- DIETARY BREAKDOWN ----------
router.get("/stats/dietary-breakdown", auth, ownerOnly, async (req, res) => {
  try {
    const breakdown = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          qty: { $sum: "$items.quantity" },
        },
      },
    ]);

    let veg = 0, nonVeg = 0, eggetarian = 0;
    breakdown.forEach(item => {
      const name = item._id.toLowerCase();
      if (name.includes("egg")) eggetarian += item.qty;
      else if (name.includes("veg")) veg += item.qty;
      else nonVeg += item.qty;
    });

    res.json({ veg, nonVeg, eggetarian });
  } catch (err) {
    console.error("Dietary breakdown error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- REPORTS (paginated + filter) ----------
router.get("/reports/orders", auth, ownerOnly, async (req, res) => {
  try {
    let { start, end, page = 1, limit = 20 } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;

    const query = {};
    if (start && end) {
      query.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("customer", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ total, page, limit, data: orders });
  } catch (err) {
    console.error("Reports API error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

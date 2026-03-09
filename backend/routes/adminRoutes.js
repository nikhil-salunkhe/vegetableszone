const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const adminAuth = require("../middleware/adminAuth");

// ✅ GET ALL USERS
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET ALL ORDERS (with user info)
router.get("/orders", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ UPDATE ORDER STATUS
router.put("/order/:id", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE ORDER (Force delete even Purchased)
router.delete("/order/:id", adminAuth, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted by admin" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/user/:id", adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE ROLE
router.put("/user/:id/role", adminAuth, async (req, res) => {
  try {
    const { role } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

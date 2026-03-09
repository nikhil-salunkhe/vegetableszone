const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Vegetable = require("../models/Vegetable");
const User = require("../models/User"); // ⚠️ Make sure you have User model

const router = express.Router();

// 🔑 Razorpay Keys
const razorpay = new Razorpay({
  key_id: "rzp_test_SLCoWbJ62YvrdO",
  key_secret: "bDphMtggNwe0fOWKDzxeRSGe",
});

// 📧 Email Transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nsalunkhe803@gmail.com",        // 🔴 replace
    pass: "lnigofxvhntzawtq", // 🔴 replace
  },
});

// ================= CREATE RAZORPAY ORDER =================
router.post("/checkout/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const cartItems = await Cart.find({ userId });

    if (!cartItems.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    res.json({ razorpayOrder, totalAmount });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Checkout failed" });
  }
});

// ================= VERIFY PAYMENT =================
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", "bDphMtggNwe0fOWKDzxeRSGe")
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const cartItems = await Cart.find({ userId });

    // ✅ STOCK VALIDATION
    for (let item of cartItems) {
      const product = await Vegetable.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `${item.name} out of stock`,
        });
      }
    }

    // ✅ REDUCE STOCK
    for (let item of cartItems) {
      await Vegetable.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // ✅ SAVE ORDER
    const order = new Order({
      userId,
      items: cartItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image: item.image,
      })),
      totalAmount,
      status: "Purchased",
      deliveryStatus: "Pending",
    });

    await order.save();

    // ================= SEND EMAIL =================

    const user = await User.findById(userId);

    if (user && user.email) {
      const itemsHtml = cartItems
        .map(
          (item) =>
            `<li>${item.name} (${item.quantity} ${item.unit}) - ₹${item.price}</li>`
        )
        .join("");

      const mailOptions = {
        from: "nsalunkhe803@gmail.com",
        to: user.email,
        subject: "Order Purchased Successfully 🛒",
        html: `
          <h2>Hello ${user.name},</h2>
          <p>Thank you for shopping with Fresh Vegetable Shop.</p>
          <h3>Order Details:</h3>
          <ul>${itemsHtml}</ul>
          <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
          <p>Your order will be delivered soon 🚚</p>
          <br/>
          <p>Thank you ❤️</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    // ================= CLEAR CART =================
    await Cart.deleteMany({ userId });

    res.json({ message: "Payment successful & Email sent!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment failed" });
  }
});

// ================= GET USER ORDERS =================
router.get("/:userId", async (req, res) => {
  const orders = await Order.find({ userId: req.params.userId });
  res.json(orders);
});

// ================= DELETE ORDER =================
router.delete("/delete/:orderId", async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  for (let item of order.items) {
    await Vegetable.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity },
    });
  }

  await Order.findByIdAndDelete(order._id);

  res.json({ message: "Order cancelled successfully" });
});

module.exports = router;
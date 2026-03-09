const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Vegetable" },
      name: String,
      price: Number,
      quantity: Number,
      image: String,
      unit: String,
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "Purchased" }, // Purchased, Shipped, Delivered
  deliveryStatus: { type: String, default: "Pending" }, // Pending, Delivering, Delivered
  orderDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
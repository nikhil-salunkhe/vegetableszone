// models/Cart.js
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: String,
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vegetable",
    required: true,
  },
  name: String,
  price: Number,
  image: String,
  quantity: Number,
  unit: { type: String, default: "Kg" },   // NEW
  totalPrice: { type: Number, default: 0 } // NEW
});

module.exports = mongoose.model("Cart", cartSchema);
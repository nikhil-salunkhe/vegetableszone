const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
  },

  vegetable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vegetable",
  },

  quantity: Number,
  pricePerKg: Number,
  totalAmount: Number,

  paymentStatus: {
    type: String,
    default: "Pending",
  },

  purchaseDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Purchase", purchaseSchema);
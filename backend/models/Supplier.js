const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,

  vegetables: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vegetable",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Supplier", supplierSchema);
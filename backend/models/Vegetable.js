const mongoose = require("mongoose");

const vegetableSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    stock: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["Fruits", "Root", "Leafy"],
    },
    image: {
      type: String,
      default: "",
    },
    isAvailable: Boolean,
  },
  { timestamps: true }   // ✅ VERY IMPORTANT
);

module.exports = mongoose.model("Vegetable", vegetableSchema);
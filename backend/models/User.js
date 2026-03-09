const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, unique: true },
    password: { type: String, required: true },

    address: { type: String, required: true }, // ✅ NEW
    profilePhoto: { type: String }, // ✅ NEW (image path)

    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
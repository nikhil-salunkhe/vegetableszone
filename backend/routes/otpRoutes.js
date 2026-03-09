const express = require("express");
const twilio = require("twilio");
const router = express.Router();
const User = require("../models/User");

// Twilio credentials
const accountSid = "AC3f2f2f306b317bf80fb9072895e3ad71";
const authToken = "95db0e7abe90f8530af5e2a3291b2b14";
const twilioNumber = "+13614702934"; // Twilio number without spaces
const client = twilio(accountSid, authToken);

// In-memory OTP store
const otpStore = {};

// -------------------- SEND OTP --------------------
router.post("/send-otp", async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ message: "Mobile number is required" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send OTP via Twilio
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: twilioNumber,
      to: mobile
    });

    // Save OTP in memory with 5 min expiry
    otpStore[mobile] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    console.log(`OTP for ${mobile}: ${otp}`); // For debugging
    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("OTP Send Error:", err.message);
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
});

// -------------------- VERIFY OTP --------------------
router.post("/verify-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) return res.status(400).json({ message: "Mobile and OTP are required" });

    const record = otpStore[mobile];
    if (!record) return res.status(400).json({ message: "OTP not requested" });

    if (Date.now() > record.expires) {
      delete otpStore[mobile];
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark user as verified if exists
    const user = await User.findOne({ mobile });
    if (user) {
      user.isVerified = true;
      await user.save();
    }

    // Delete OTP from memory
    delete otpStore[mobile];

    res.json({ message: "OTP verified successfully" });

  } catch (err) {
    console.error("OTP Verify Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
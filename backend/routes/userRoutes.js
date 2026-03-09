const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const adminAuth = require("../middleware/adminAuth");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* ================= MULTER CONFIG ================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ================= REGISTER ================= */

router.post("/register", upload.single("profilePhoto"), async (req, res) => {
  try {
    const { name, email, mobile, password, address } = req.body;

    if (!name || !email || !password || !mobile || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      address,
      profilePhoto: req.file ? req.file.filename : null,
      isVerified: true,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET USER ================= */

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.userId !== req.params.id)
      return res.status(403).json({ message: "Unauthorized" });

    const user = await User.findById(req.params.id).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= UPDATE PROFILE ================= */

router.put(
  "/update/:id",
  authMiddleware,
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      if (req.user.userId !== req.params.id)
        return res.status(403).json({ message: "Unauthorized" });

      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Delete old photo if new uploaded
      if (req.file && user.profilePhoto) {
        const oldPath = path.join(
          __dirname,
          "..",
          "uploads",
          user.profilePhoto
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }

        user.profilePhoto = req.file.filename;
      }

      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.mobile = req.body.mobile || user.mobile;
      user.address = req.body.address || user.address;

      await user.save();

      res.json({ message: "Profile updated successfully" });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* ================= DELETE USER (ADMIN) ================= */

router.delete("/user/:id", adminAuth, async (req, res) => {
  try {
    if (req.user.userId === req.params.id)
      return res.status(400).json({ message: "Admin cannot delete himself" });

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
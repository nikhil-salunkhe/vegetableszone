const express = require("express");
const router = express.Router();
const Vegetable = require("../models/Vegetable");

// ================= GET ALL AVAILABLE VEGETABLES =================
router.get("/", async (req, res) => {
  try {
    const vegetables = await Vegetable.find({
      isAvailable: true,
    });

    res.json(vegetables);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

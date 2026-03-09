const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");
const adminAuth = require("../middleware/adminAuth");


// =======================
// ADD SUPPLIER
// =======================
router.post("/supplier", adminAuth, async (req, res) => {
  try {
    const { name, phone, address, vegetablesSupplied } = req.body;

    const supplier = new Supplier({
      name,
      phone,
      address,
      vegetablesSupplied,
    });

    await supplier.save();

    res.json({ message: "Supplier added", supplier });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =======================
// GET ALL SUPPLIERS
// =======================
router.get("/suppliers", adminAuth, async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =======================
// DELETE SUPPLIER
// =======================
router.delete("/supplier/:id", adminAuth, async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: "Supplier deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
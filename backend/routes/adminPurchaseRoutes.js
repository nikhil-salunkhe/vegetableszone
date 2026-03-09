const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");
const Supplier = require("../models/Supplier");
const Vegetable = require("../models/Vegetable");
const adminAuth = require("../middleware/adminAuth");


// PURCHASE VEGETABLE
router.post("/purchase", adminAuth, async (req, res) => {

  try {

    const { supplierId, vegetableId, quantity, pricePerKg } = req.body;

    const totalAmount = quantity * pricePerKg;

    const purchase = new Purchase({
      supplier: supplierId,
      vegetable: vegetableId,
      quantity,
      pricePerKg,
      totalAmount,
    });

    await purchase.save();

    // INCREASE STOCK
    const veg = await Vegetable.findById(vegetableId);

    veg.stock += Number(quantity);

    await veg.save();

    res.json({
      message: "Purchase successful & stock updated",
      purchase,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

});


// GET PURCHASE HISTORY
router.get("/purchases", adminAuth, async (req, res) => {

  const purchases = await Purchase.find()
    .populate("supplier", "name")
    .populate("vegetable", "name");

  res.json(purchases);

});
// UPDATE PAYMENT STATUS
router.put("/purchase/:id/payment", adminAuth, async (req, res) => {
    try {
      const { paymentStatus } = req.body;
  
      const purchase = await Purchase.findByIdAndUpdate(
        req.params.id,
        { paymentStatus },
        { new: true }
      );
  
      res.json(purchase);
  
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;
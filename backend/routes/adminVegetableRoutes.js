const express = require("express");
const router = express.Router();
const multer = require("multer");
const adminAuth = require("../middleware/adminAuth");
const Vegetable = require("../models/Vegetable");
const path = require("path");
const fs = require("fs");


// =============================
// ✅ MULTER CONFIGURATION
// =============================

// Create uploads folder if not exists
const uploadPath = "uploads/";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });


// =============================
// ✅ ADD VEGETABLE (WITH IMAGE)
// =============================
router.post(
  "/vegetable",
  adminAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, price, stock, category } = req.body;

      const veg = new Vegetable({
        name,
        price,
        stock,
        category,
        image: req.file ? req.file.filename : "",
        isAvailable: stock > 0,
      });

      await veg.save();

      res.status(201).json({
        message: "Vegetable added successfully",
        veg,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);


// =============================
// ✅ GET ALL VEGETABLES
// =============================
router.get("/", adminAuth, async (req, res) => {
  try {
    const vegetables = await Vegetable.find().sort({ _id: -1 });
    res.json(vegetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =============================
// ✅ UPDATE VEGETABLE
// =============================
router.put(
  "/vegetable/:id",
  adminAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const veg = await Vegetable.findById(req.params.id);

      if (!veg) {
        return res.status(404).json({ message: "Vegetable not found" });
      }

      // ===============================
      // ✅ IMAGE UPDATE
      // ===============================
      if (req.file) {
        if (veg.image) {
          const oldImagePath = uploadPath + veg.image;
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        veg.image = req.file.filename;
      }

      // ===============================
      // ✅ SAFE FIELD UPDATES
      // ===============================

      if (req.body.name !== undefined) {
        veg.name = req.body.name;
      }

      if (req.body.price !== undefined) {
        veg.price = req.body.price;
      }

      if (req.body.stock !== undefined) {
        veg.stock = req.body.stock;
      }

      if (req.body.category !== undefined) {
        veg.category = req.body.category;
      }

      // Update availability
      veg.isAvailable = veg.stock > 0;

      await veg.save();

      res.status(200).json({
        message: "Vegetable updated successfully",
        veg,
      });

    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);



// =============================
// ✅ DELETE VEGETABLE
// =============================
router.delete(
  "/vegetable/:id",
  adminAuth,
  async (req, res) => {
    try {
      const veg = await Vegetable.findById(
        req.params.id
      );

      if (!veg) {
        return res
          .status(404)
          .json({ message: "Vegetable not found" });
      }

      // Delete image from uploads
      if (veg.image) {
        const imagePath =
          uploadPath + veg.image;

        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await veg.deleteOne();

      res.json({ message: "Vegetable deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);


// =============================
// ✅ UPDATE STOCK
// =============================
router.put(
  "/vegetable/:id/stock",
  adminAuth,
  async (req, res) => {
    try {
      const { stock } = req.body;

      const veg = await Vegetable.findById(
        req.params.id
      );

      if (!veg) {
        return res
          .status(404)
          .json({ message: "Vegetable not found" });
      }

      veg.stock = stock;
      veg.isAvailable = stock > 0;

      await veg.save();

      res.json(veg);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;

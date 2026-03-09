const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Vegetable = require("../models/Vegetable");

// ================= ADD TO CART =================
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    if (!userId || !productId || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const vegetable = await Vegetable.findById(productId);
    if (!vegetable) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Determine unit
    const unit =
      vegetable.category === "Fruits" || vegetable.category === "Leafy"
        ? "bunch"
        : "kg";

    const newCartItem = new Cart({
      userId,
      productId: vegetable._id,
      name: vegetable.name,
      price: vegetable.price,
      image: vegetable.image,
      quantity,
      category: vegetable.category, // store category
      unit,                        // store unit
    });

    await newCartItem.save();
    res.status(200).json({ message: "Added to cart", item: newCartItem });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

// ================= GET CART BY USER =================
router.get("/:userId", async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.params.userId }).populate("productId");
    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Fetch cart error:", error);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// ================= UPDATE QUANTITY =================
router.put("/update/:id", async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const updatedItem = await Cart.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Quantity updated", cartItem: updatedItem });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({ message: "Update failed" });
  }
});

// ================= DELETE ITEM =================
router.delete("/remove/:id", async (req, res) => {
  try {
    const deletedItem = await Cart.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.json({ message: "Item removed", cartItem: deletedItem });
  } catch (error) {
    console.error("Delete cart item error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
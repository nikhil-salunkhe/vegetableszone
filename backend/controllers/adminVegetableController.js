import Vegetable from "../models/Vegetable.js";

// ✅ Add Vegetable
export const addVegetable = async (req, res) => {
  try {
    const veg = await Vegetable.create(req.body);
    res.status(201).json(veg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Vegetables
export const getVegetables = async (req, res) => {
  const vegetables = await Vegetable.find().sort({ createdAt: -1 });
  res.json(vegetables);
};

// ✅ Update Vegetable
export const updateVegetable = async (req, res) => {
  const veg = await Vegetable.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(veg);
};

// ✅ Delete Vegetable
export const deleteVegetable = async (req, res) => {
  await Vegetable.findByIdAndDelete(req.params.id);
  res.json({ message: "Vegetable deleted" });
};

// ✅ Update Stock Only
export const updateStock = async (req, res) => {
  const { stock } = req.body;

  const veg = await Vegetable.findById(req.params.id);
  veg.stock = stock;
  veg.isAvailable = stock > 0;
  await veg.save();

  res.json(veg);
};

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const cartRoutes = require("./routes/cartRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const vegetableRoutes = require("./routes/vegetableRoutes");
const otpRoutes = require("./routes/otpRoutes"); // <-- Add this


// ✅ NEW
const adminVegetableRoutes = require("./routes/adminVegetableRoutes");
const supplierRoutes = require("./routes/adminSupplierRoutes");
const adminPurchaseRoutes = require("./routes/adminPurchaseRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 FIXED MongoDB URL (your old one was wrong)
mongoose
  .connect(
    "mongodb+srv://nsalunkhe803_db_user:root@cluster0.g65qpc6.mongodb.net/?appName=Cluster0/test"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", vegetableRoutes);
app.use("/api/otp", otpRoutes);


// ✅ NEW ROUTE
app.use("/api/admin", adminVegetableRoutes);
app.use("/api/admin", supplierRoutes);
app.use("/api/admin", adminPurchaseRoutes);
app.use("/uploads", express.static("uploads"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

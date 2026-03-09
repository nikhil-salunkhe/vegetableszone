const express = require("express");
const PDFDocument = require("pdfkit");
const Order = require("../models/Order");

const router = express.Router();

// ================= GENERATE PDF INVOICE =================
router.get("/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("userId");

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Safe createdAt fallback
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString()
      : new Date().toLocaleDateString();

    // Set headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice_${order._id}.pdf`
    );

    const doc = new PDFDocument({ margin: 30 });

    // Pipe PDF to response
    doc.pipe(res);

    // Title
    doc.fontSize(20).text("🛒 Fresh Vegetable Shop Invoice", { align: "center" });
    doc.moveDown();

    // Order info
    doc.fontSize(12).text(`Invoice ID: ${order._id}`);
    doc.text(`Date: ${orderDate}`);
    doc.text(`Customer: ${order.userId?.name || "N/A"}`);
    doc.text(`Email: ${order.userId?.email || "N/A"}`);
    doc.moveDown();

    // Table header
    doc.fontSize(14).text("Items:", { underline: true });
    doc.moveDown(0.5);

    // Table content
    order.items.forEach((item, idx) => {
      doc
        .fontSize(12)
        .text(
          `${idx + 1}. ${item.name} (${item.unit || "unit"}) x ${item.quantity} - ₹${
            item.price * item.quantity
          }`
        );
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Amount: ₹${order.totalAmount}`, { bold: true });
    doc.moveDown(2);

    doc.fontSize(10).text("Thank you for your purchase!", { align: "center" });

    doc.end(); // ✅ End PDF stream properly
  } catch (error) {
    console.error("Invoice error:", error.message);
    res.status(500).send("Failed to generate invoice");
  }
});

module.exports = router;
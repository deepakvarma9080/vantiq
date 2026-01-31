const express = require("express");
const Order = require("./Order");
const router = express.Router();

/* CREATE ORDER (COD + UPI + Razorpay) */
const Product = require("./Product");

const userAuth = require("./auth");
const generateInvoice = require("./generateInvoice");


router.post("/create", userAuth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items missing" });
    }

    // 🔒 1. CHECK & REDUCE STOCK
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `${product.name} is out of stock`
        });
      }

      // 🔥 Reduce stock
      product.quantity -= item.quantity;
      await product.save();
    }

    // 🧾 2. CREATE ORDER
    const order = new Order({
      userId: req.user.id,
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      items,
      totalAmount: req.body.totalAmount,
      paymentMethod: req.body.paymentMethod,
      paymentId: req.body.paymentId || "",
      status: "Pending"
    });

    await order.save();

    res.json({
      message: "Order created successfully",
      order
    });

  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ADMIN – GET ALL ORDERS */
router.get("/all", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});


router.get("/my", userAuth, async (req, res) => {
  const orders = await Order.find({ userId: req.user.id })
    .sort({ createdAt: -1 });

  res.json(orders);
});



/* ADMIN – UPDATE ORDER STATUS */
router.put("/:id/status", async (req, res) => {
  try {
    console.log("STATUS BODY:", req.body); // 🔥 DEBUG
    console.log("ORDER ID:", req.params.id);

    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Status updated", order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



const PDFDocument = require("pdfkit");

/* USER INVOICE */
router.get("/invoice/:id", userAuth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    sendInvoice(res, order);

  } catch (err) {
    res.status(500).json({ message: "Invoice failed" });
  }
});

/* ADMIN INVOICE */
router.get("/:id/invoice", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    sendInvoice(res, order);

  } catch (err) {
    res.status(500).json({ message: "Invoice failed" });
  }
});


function sendInvoice(res, order) {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order._id}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(18).text("VANTIQ Cover Store", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Customer: ${order.name}`);
  doc.text(`Phone: ${order.phone}`);
  doc.text(`Address: ${order.address}`);
  doc.moveDown();

  doc.text("Products:");
  order.items.forEach(item => {
    doc.text(`• ${item.name} × ${item.qty || item.quantity}`);
  });

  doc.moveDown();
  doc.text(`Payment Method: ${order.paymentMethod}`);
  doc.text(`Status: ${order.status}`);
  doc.text(`Total: ₹${order.totalAmount}`);

  doc.end();
}


module.exports = router;



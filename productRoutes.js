const express = require("express");
const multer = require("multer");
const Product = require("../Product");
const adminAuth = require("../adminAuth");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer setup for multiple images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

/* ================================
   ✅ GET ALL PRODUCTS  (PASTE HERE)
================================ */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   ✅ GET PRODUCT BY ID
================================ */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(404).json({ message: "Product not found" });
  }
});

/* ================================
   ✅ ADD PRODUCT (ADMIN)
================================ */
router.post("/", adminAuth, upload.array("images", 5), async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      phone_model,
      price,
      original_price,
      quantity,
      highlights,
      description,
    } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ message: "Name, category, and price are required" });
    }


    const images = req.files.map(f => f.filename);

    const product = new Product({
      name,
      category,
      brand,
      phone_model,
      price,
      original_price,
      quantity,
      highlights,
      description,
      images,
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


/* DELETE PRODUCT */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* UPDATE PRODUCT */
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;


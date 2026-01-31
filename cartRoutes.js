const express = require("express");
const Cart = require("../Cart");
const auth = require("../auth");
const router = express.Router();
const Product = require("../Product");

// ================= GET CART =================
router.get("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(cart);
  } catch (err) {
    console.error("GET CART ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= ADD TO CART =================
router.post("/add", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID missing" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const index = cart.items.findIndex(
      i => i.productId.toString() === productId
    );

    const product = await Product.findById(productId);
    if (!product || product.quantity <= 0) {
      return res.status(400).json({ message: "Out of Stock" });
    }

    if (index > -1) {
      if (cart.items[index].quantity >= product.quantity) {
        return res.status(400).json({ message: "Stock limit reached" });
      }
      cart.items[index].quantity += 1;
    } else {
      cart.items.push({ productId, quantity: 1 });
    }

    await cart.save();
    res.json({ message: "Added to cart" });

  } catch (err) {
    console.error("ADD CART ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// ================= UPDATE QUANTITY =================
router.post("/update", auth, async (req, res) => {
  const { itemId, delta } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(i => i._id.toString() === itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const product = await Product.findById(item.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // 🔒 STOCK LIMIT CHECK
    if (delta > 0 && item.quantity >= product.quantity) {
      return res.status(400).json({
        message: "Stock limit reached"
      });
    }

    item.quantity += delta;

    // remove if quantity becomes 0
    cart.items = cart.items.filter(i => i.quantity > 0);

    await cart.save();
    res.json(cart);

  } catch (err) {
    console.error("UPDATE CART ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= REMOVE ITEM =================
router.post("/remove", auth, async (req, res) => {
  const { itemId } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    // Filter out the item to remove
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;


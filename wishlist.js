const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const auth = require("../middleware/auth"); // JWT middleware

// ===============================
// GET USER WISHLIST
// ===============================
router.get("/", auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate("items");

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        items: []
      });
    }

    res.json(wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// TOGGLE WISHLIST (ADD / REMOVE)
// ===============================
router.post("/toggle", auth, async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        items: [productId]
      });
      return res.json({ message: "Added to wishlist", active: true });
    }

    const index = wishlist.items.indexOf(productId);

    if (index > -1) {
      wishlist.items.splice(index, 1);
      await wishlist.save();
      return res.json({ message: "Removed from wishlist", active: false });
    } else {
      wishlist.items.push(productId);
      await wishlist.save();
      return res.json({ message: "Added to wishlist", active: true });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

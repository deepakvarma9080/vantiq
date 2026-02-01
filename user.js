const express = require("express");
const User = require("./User");
const auth = require("./auth");

const router = express.Router();

/* ================= GET LOGGED IN USER ================= */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,   // ✅ CORRECT FIELD
      email: user.email
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;


const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("./User");

const hashed = bcrypt.hashSync("1234", 10);

const router = express.Router();

/* ================= SIGNUP ================= */
// SIGNUP ROUTE

router.post("/signup", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const emailNormalized = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: emailNormalized });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: fullname,
      email: emailNormalized,
      password: hashedPassword
    });

    await user.save();

    return res.status(201).json({ message: "Account created successfully" });

  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Server error during signup" });
  }
});


/* ================= LOGIN ================= */


router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Invalid password" });

  // ✅ FIXED TOKEN CREATION
  const token = jwt.sign(
    {
      id: user._id,          // 🔥 FIXED (was userId)
      isAdmin: user.isAdmin
    },
    process.env.JWT_SECRET, // 🔥 FIXED (was hardcoded)
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    }
  });
});



/* ================= FORGOT PASSWORD ================= */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "Email not registered" });

    const token = crypto.randomBytes(20).toString("hex");
    user.resetToken = token;
    await user.save();

    // SIMPLE RESET LINK (no email service)
    const resetLink = `http://localhost:5500/reset-password.html?email=${email}&token=${token}`;
    console.log("RESET LINK:", resetLink);

    res.json({ message: "Reset link sent (check console)" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= RESET PASSWORD ================= */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: "Missing data" });
    }

    const user = await User.findOne({ email, resetToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;

    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reset failed" });
  }
});


module.exports = router;



const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const header = req.header("Authorization");
  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ THIS IS THE KEY LINE
    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

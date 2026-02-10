const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./authRoutes");
const productRoutes = require("./productRoutes");
const cartRoutes = require("./cartRoutes");


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("/tmp/uploads"));


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api", authRoutes);
app.use("/api/product", require("./productRoutes"));

app.use("/api/cart", cartRoutes);
app.use("/api/orders", require("./orderRoutes"));
app.use("/api/wishlist", require("./wishlist"));
app.use("/api/user", require("./user"));


const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Vantiq backend is live 🚀"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});










const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  brand: String,
  phone_model: String,
  price: Number,
  original_price: Number,

  quantity: {              // ✅ STOCK
    type: Number,
    default: 0
  },

  highlights: String,
  description: String,
  images: [String],
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Product", productSchema);

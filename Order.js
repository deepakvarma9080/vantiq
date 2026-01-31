const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: String,
  phone: String,
  address: String,

  items: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      name: String,
      quantity: Number,
      price: Number
    }
  ],

  totalAmount: Number,
  paymentMethod: String,
  paymentId: String,

  status: {
    type: String,
    default: "Pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);

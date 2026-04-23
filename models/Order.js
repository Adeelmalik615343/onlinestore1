const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },

  products: [
    {
      name: String,
      price: Number,
      image: String,
      quantity: Number
    }
  ],

  paymentMethod: { 
    type: String, 
    enum: ["Cash on Delivery", "EasyPaisa", "Card"], 
    required: true 
  },

  cardDetails: {
    number: String,
    expiry: String,
    cvc: String
  },

  // Tracking ID
  trackingId: {
    type: String,
    unique: true
  },

  // Order Status
  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered"],
    default: "Pending"
  },

  // 🔥 NEW: LIVE LOCATION FOR MAP
  location: {
    lat: Number,
    lng: Number
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
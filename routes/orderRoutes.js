const express = require("express");
const router = express.Router();

const { 
  getOrders, 
  addOrder, 
  trackOrder, 
  updateOrder,   // 🔥 NEW
  deleteOrder,   // 🔥 NEW
  updateLocation   // 🔥 NEW
} = require("../controllers/orderController");

// Get all orders (admin)
router.get("/", getOrders);

// Add new order (checkout)
router.post("/", addOrder);

// Track order
router.get("/track/:trackingId", trackOrder);

// Update order status
router.put("/:id", updateOrder);

// Delete order
router.delete("/:id", deleteOrder);

// 🔥 NEW: Update live location (for map tracking)
router.post("/location/:trackingId", updateLocation);

module.exports = router;
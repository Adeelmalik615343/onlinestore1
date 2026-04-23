const Order = require("../models/Order");
const transporter = require("../config/email");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const emailEnabled = process.env.EMAIL_ENABLED === "true";

// Generate Tracking ID
function generateTrackingId() {
  return "ORD" + Date.now();
}

// Get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add new order
const addOrder = async (req, res) => {
  try {
    const { name, email, address, products, paymentMethod, cardDetails, latitude, longitude } = req.body;

    if (!name || !email || !address || !products.length || !paymentMethod) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const formattedProducts = products.map(p => ({
      name: p.name,
      price: p.price,
      image: p.image,
      quantity: p.quantity || 1
    }));

    const total = formattedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    // Process payment if Card
    if (paymentMethod === "Card") {
      try {
        const token = await stripe.tokens.create({
          card: {
            number: cardDetails.number.replace(/\s/g, ''),
            exp_month: parseInt(cardDetails.expiry.split('/')[0]),
            exp_year: parseInt(cardDetails.expiry.split('/')[1]),
            cvc: cardDetails.cvc
          }
        });

        const charge = await stripe.charges.create({
          amount: Math.round(total * 100), // in cents
          currency: 'usd',
          source: token.id,
          description: `Order ${generateTrackingId()}`
        });

        // Payment successful
      } catch (error) {
        console.error('Payment failed:', error);
        return res.status(400).json({ success: false, message: "Payment failed: " + error.message });
      }
    }

    const newOrder = new Order({
      name,
      email,
      address,
      products: formattedProducts,
      paymentMethod,
      cardDetails: paymentMethod === "Card" ? { ...cardDetails, number: '****' + cardDetails.number.slice(-4) } : null,

      trackingId: generateTrackingId(),
      status: "Pending"
    });

    // Set location if provided
    if (latitude && longitude) {
      newOrder.location = {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude)
      };
    }

    await newOrder.save();

    // Send email notification
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Order Confirmation - " + newOrder.trackingId,
        html: `
          <h2>Thank you for your order!</h2>
          <p>Hi ${name},</p>
          <p>Your order has been placed successfully.</p>
          <p><strong>Tracking ID:</strong> ${newOrder.trackingId}</p>
          <p><strong>Status:</strong> ${newOrder.status}</p>
          <h3>Order Details:</h3>
          <ul>
            ${formattedProducts.map(p => `<li>${p.name} - $${p.price} x ${p.quantity}</li>`).join('')}
          </ul>
          <p><strong>Total:</strong> $${formattedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0)}</p>
          <p>We will notify you when your order is shipped.</p>
          <br>
          <p>Best regards,<br>My Store Team</p>
        `
      };

      console.log("=== EMAIL NOTIFICATION ===");
      console.log("To:", email);
      console.log("Subject:", mailOptions.subject);
      if (emailEnabled && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully.");
      } else {
        console.log("Email not sent: EMAIL_ENABLED is false or credentials are missing.");
      }
      console.log("=== END EMAIL NOTIFICATION ===");
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
      // Don't fail the order if email fails
    }

    res.json({
      success: true,
      message: "Order placed successfully",
      trackingId: newOrder.trackingId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Track Order
const trackOrder = async (req, res) => {
  try {
    const { trackingId } = req.params;

    const order = await Order.findOne({ trackingId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      ...order._doc
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Order Status
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order status updated", order: updatedOrder });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔥 NEW: Update live location (for rider / testing)
const updateLocation = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { lat, lng } = req.body;

    const order = await Order.findOne({ trackingId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.location = { lat, lng };
    await order.save();

    res.json({ success: true, message: "Location updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getOrders, addOrder, trackOrder, updateOrder, deleteOrder, updateLocation };
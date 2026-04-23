require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Import Routes
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { router: authRoutes } = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const REQUIRED_ENV_VARS = ["MONGO_URI", "JWT_SECRET"];

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  res.status(isDbConnected ? 200 : 503).json({
    status: "OK", 
    db: isDbConnected ? "connected" : "disconnected",
    dbState: mongoose.connection.readyState // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  });
});

// ==================== PAGES ====================

// Track page
app.get("/track", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "track.html"));
});

// Checkout page
app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "checkout.html"));
});

// Admin
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "admin.html"));
});

// User pages
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "user-login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "user-signup.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "user-dashboard.html"));
});

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Products
app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "product.html"));
});

// ==============================================

function validateEnv() {
  const missingVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

  if (missingVars.length) {
    throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
  }
}

async function startServer() {
  try {
    validateEnv();
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();

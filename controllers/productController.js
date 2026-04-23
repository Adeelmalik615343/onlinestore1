const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg","jpeg","png"]
  }
});
const upload = multer({ storage });

// Get all products
const getProducts = async (req, res) => {
  try {
    console.log("Fetching products...");
    console.log("DB readyState:", require("mongoose").connection.readyState);
    if (require("mongoose").connection.readyState !== 1) {
      return res.status(500).json({ success: false, message: "DB not connected" });
    }
    const products = await Product.find();
    console.log("Products found:", products.length);
    res.json(products);
  } catch(err) {
    console.error("Error in getProducts:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    if(!req.file) return res.status(400).json({ success: false, message: "Image is required" });

    const image = req.file.path;

    const newProduct = new Product({ name, description, price, image, category });
    await newProduct.save();

    res.json({ success: true, message: "Product added", product: newProduct });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body;
    let updateData = { name, description, price, category };

    if(req.file) {
      updateData.image = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if(!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product updated", product: updatedProduct });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if(!deletedProduct) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product deleted" });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getProducts, getCategories, addProduct, updateProduct, deleteProduct, upload };
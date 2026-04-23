const express = require("express");
const router = express.Router();
const { getProducts, getCategories, addProduct, updateProduct, deleteProduct, upload } = require("../controllers/productController");

// Get all products
router.get("/", getProducts);

// Get categories
router.get("/categories", getCategories);

// Add product with Cloudinary image upload
router.post("/", upload.single("image"), addProduct);

// Update product
router.put("/:id", upload.single("image"), updateProduct);

// Delete product
router.delete("/:id", deleteProduct);

module.exports = router;
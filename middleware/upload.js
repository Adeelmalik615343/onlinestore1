// middleware/upload.js
const multer = require("multer");

// Memory storage (required for Cloudinary upload)
const storage = multer.memoryStorage();

// Create multer instance
const upload = multer({ storage });

// Export the multer instance
module.exports = upload;
require("dotenv").config();
const mongoose = require("mongoose");

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully");
    console.log("Ready state:", mongoose.connection.readyState);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    const products = await db.collection("products").find({}).toArray();
    console.log("Products count:", products.length);
    await mongoose.connection.close();
  } catch (err) {
    console.error("Connection error:", err);
  }
}

testConnection();
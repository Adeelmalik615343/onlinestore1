require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const Order = require("./models/Order");

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check existing data
    const products = await Product.find();
    const orders = await Order.find();
    console.log(`Existing products: ${products.length}`);
    console.log(`Existing orders: ${orders.length}`);

    if (products.length === 0) {
      // Add sample products
      const sampleProducts = [
        {
          name: "Sample Product 1",
          description: "This is a sample product",
          price: 10.99,
          image: "https://via.placeholder.com/150",
          category: "Sample"
        },
        {
          name: "Sample Product 2",
          description: "Another sample product",
          price: 20.99,
          image: "https://via.placeholder.com/150",
          category: "Sample"
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log("Sample products added");
    }

    if (orders.length === 0) {
      // Add sample order
      const sampleOrder = {
        name: "John Doe",
        email: "john@example.com",
        address: "123 Main St",
        products: [
          {
            name: "Sample Product 1",
            price: 10.99,
            image: "https://via.placeholder.com/150",
            quantity: 1
          }
        ],
        paymentMethod: "Card",
        cardDetails: { number: "****1234" },
        trackingId: "ORD123456",
        status: "Pending"
      };

      await Order.create(sampleOrder);
      console.log("Sample order added");
    }

    console.log("Seeding complete");
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

seedData();
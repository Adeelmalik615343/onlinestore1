const mongoose = require('mongoose');
const User = require('./models/User');

require('dotenv').config();

async function testSignup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    await user.save();
    console.log('User saved successfully');
    console.log('Hashed password:', user.password);

    // Test compare
    const isMatch = await user.comparePassword('password123');
    console.log('Password match:', isMatch);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testSignup();
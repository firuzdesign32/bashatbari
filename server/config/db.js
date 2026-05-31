const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.log('⚠️  MONGODB_URI not specified. Falling back to local JSON database storage.');
    return false;
  }

  try {
    // Set connection timeout to 3 seconds for quick fallback
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB database successfully.');
    return true;
  } catch (error) {
    console.log('⚠️  Failed to connect to MongoDB. Reason:', error.message);
    console.log('⚠️  Falling back to local JSON database storage.');
    isConnected = false;
    return false;
  }
}

function getIsConnected() {
  return isConnected;
}

module.exports = {
  connectDB,
  getIsConnected
};

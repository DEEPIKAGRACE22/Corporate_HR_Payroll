const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/corporate_hr';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (err) {
    console.warn(`[MongoDB] Warning: Could not connect to MongoDB at ${uri}.`);
    console.warn(`[MongoDB] Error: ${err.message}`);
    console.warn(`[MongoDB] Running in fallback mode or check your MONGODB_URI in .env.`);
    return false;
  }
};

module.exports = connectDB;

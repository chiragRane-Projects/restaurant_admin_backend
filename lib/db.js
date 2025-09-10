const mongoose = require("mongoose");

const DATABASE_URL = process.env.MONGODB_URL;

async function connectDB() {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); 
  }
}

module.exports = connectDB;

const mongoose = require("mongoose");

if (process.env.NODE_ENV !== "production") require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async function() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully...");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // stop the app if DB connection fails
  }
};

module.exports = connectDB;
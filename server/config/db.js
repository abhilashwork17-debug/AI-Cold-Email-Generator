const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || process.env.MONGO_URI
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error(`⚠️ Server running without active MongoDB. Please verify MongoDB cluster status in Atlas.`);
  }
};

module.exports = connectDB;
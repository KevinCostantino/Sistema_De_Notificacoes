const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Remove deprecated options, using only necessary ones
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Configure mongoose to handle UTF-8 properly
    mongoose.set('sanitizeFilter', true);
    mongoose.set('strictQuery', false);
    
    // Set UTF-8 as default for string schema types
    mongoose.Schema.Types.String.set('trim', true);

    if (process.env.NODE_ENV !== 'test') {
      console.log(`📊 MongoDB Connected: ${conn.connection.host}`);
    }

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📴 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
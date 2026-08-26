import dns from 'dns';
import mongoose from 'mongoose';

// Set public DNS servers to resolve MongoDB SRV records reliably, bypassing potential ISP DNS limitations.
dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * Connect to MongoDB Atlas.
 * Reads MONGODB_URI from environment variables.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

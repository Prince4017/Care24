import mongoose from 'mongoose';
import dns from 'dns';

// Some ISPs/routers block the DNS SRV lookups that mongodb+srv:// needs.
// Forcing Node to use Google's DNS avoids that.
dns.setServers(['8.8.8.8', '8.8.4.4']);

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

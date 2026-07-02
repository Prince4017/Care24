import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from './models/User.js';

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

const email = process.argv[2];

if (!email) {
  console.error('Usage: npm run make-admin -- your@email.com');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { returnDocument: 'after' });
    if (!user) {
      console.error(`No user found with email ${email}. Register that account first, then re-run this.`);
    } else {
      console.log(`${user.name} (${user.email}) is now an admin.`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
}

run();

import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User.js';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'test@test.com';
    const name = 'Billa Pradhan';
    const password = '123456';
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.findOneAndUpdate(
      { email },
      {
        name,
        email,
        passwordHash,
        role: 'admin'
      },
      { upsert: true, new: true }
    );

    console.log(`Admin account successfully configured:`, user);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
})();


import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.collection('users');
    
    // First, set everyone to 'user'
    await db.updateMany({}, { $set: { role: 'user' } });
    
    // Next, make nayandg8@gmail.com an 'admin'
    const adminResult = await db.updateOne(
      { email: 'nayandg8@gmail.com' }, 
      { $set: { role: 'admin' } }
    );
    
    console.log(`Reset all roles. Granted admin access to nayandg8@gmail.com (Matched: ${adminResult.matchedCount}).`);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
})();

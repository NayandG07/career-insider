import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
const keys = await mongoose.connection.db.collection('apikeys').find().toArray();
console.log('API Keys count:', keys.length);
keys.forEach(k => console.log(' -', k.provider, '| active:', k.isActive, '| key preview:', k.encryptedKey?.substring(0,30)));
await mongoose.disconnect();

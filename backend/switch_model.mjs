import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection.db;
const result = await db.collection('aiconfigs').updateMany(
  {},
  { $set: { primaryModel: 'gemini-3.5-flash', primaryProvider: 'gemini' } }
);
console.log(`Updated ${result.modifiedCount} aiconfigs to gemini-3.5-flash`);

const configs = await db.collection('aiconfigs').find({}).toArray();
for (const c of configs) {
  console.log(`  ${c.task} -> ${c.primaryProvider}/${c.primaryModel}`);
}

await mongoose.disconnect();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

const tasks = ['skill_analyze', 'roadmap_gen', 'company_match', 'mentor_chat', 'resume_parse'];
for (const task of tasks) {
  await db.collection('aiconfigs').updateOne(
    { task },
    { $set: { primaryModel: 'gemini-3.6-flash' } }
  );
  console.log('Updated:', task, '→ gemini-3.6-flash');
}

await mongoose.disconnect();
console.log('Done.');

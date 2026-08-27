import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

// Make sure all 5 task configs exist with correct task names and gemini-3.6-flash
const tasks = [
  { task: 'skill_analyze',   label: 'Skill Analysis',      primaryModel: 'gemini-3.6-flash' },
  { task: 'roadmap_gen',     label: 'Roadmap Generation',  primaryModel: 'gemini-3.6-flash' },
  { task: 'company_match',   label: 'Company Matching',    primaryModel: 'gemini-3.6-flash' },
  { task: 'mentor_chat',     label: 'AI Mentor Chat',      primaryModel: 'gemini-3.6-flash' },
  { task: 'resume_parse',    label: 'Resume Parsing',      primaryModel: 'gemini-3.6-flash' },
];

for (const t of tasks) {
  const result = await db.collection('aiconfigs').updateOne(
    { task: t.task },
    { $set: { task: t.task, label: t.label, primaryProvider: 'gemini', primaryModel: t.primaryModel, fallbackChain: ['openai', 'huggingface'], isActive: true } },
    { upsert: true }
  );
  console.log(`✅ ${t.task}: ${result.upsertedCount ? 'inserted' : 'updated'}`);
}

await mongoose.disconnect();
console.log('Done.');

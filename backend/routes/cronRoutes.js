import { Router } from 'express';
import { runAllSyncs } from '../services/syncOrchestrator.js';

const router = Router();

// Webhook endpoint for cron-job.org
router.post('/sync-all', async (req, res) => {
  const cronSecret = req.headers['x-cron-secret'];
  
  // Validate the secret key
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    console.warn('❌ Unauthorized cron sync attempt.');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('⏰ [Webhook] Starting scheduled sync for all users...');
  
  // Send immediate 202 Accepted so cron-job.org doesn't timeout waiting for all syncs to finish
  res.status(202).json({ message: 'Sync process started.' });

  try {
    await runAllSyncs();
    console.log('⏰ [Webhook] Sync complete.');
  } catch (err) {
    console.error('⏰ [Webhook] Fatal sync error:', err.message);
  }
});

export default router;

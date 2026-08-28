import { Router } from 'express';
import { runAllSyncs } from '../services/syncOrchestrator.js';
import logger from '../utils/logger.js';

const router = Router();

// Webhook endpoint for cron-job.org (supports GET, POST, HEAD)
router.all('/sync-all', async (req, res) => {
  // Support multiple header formats and query parameter for flexibility
  const cronSecret = 
    req.headers['x-cron-secret'] || 
    req.headers['cron_secret'] || 
    req.headers['cron-secret'] || 
    req.query.secret;
  
  // Validate the secret key
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    logger.warn('CRON', 'Unauthorized cron sync attempt rejected.');
    return res.status(401).json({ error: 'Unauthorized: invalid or missing cron secret.' });
  }

  logger.info('CRON', `[Webhook ${req.method}] Trigger received. Initiating telemetry sync sweep...`);
  
  // Send immediate 202 Accepted so external caller doesn't timeout
  res.status(202).json({ status: 'accepted', message: 'Sync process initiated successfully.' });

  // Run the sync orchestrator asynchronously in the background
  try {
    await runAllSyncs();
    logger.success('CRON', '[Webhook] Scheduled background sync finished.');
  } catch (err) {
    logger.error('CRON', '[Webhook] Fatal error during sync:', err);
  }
});

export default router;

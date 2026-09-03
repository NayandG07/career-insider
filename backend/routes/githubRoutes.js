import { Router } from 'express';
import { 
  getRepositories, 
  importRepositories, 
  removeImportedRepository, 
  disconnectGithub,
  getContributionsByYear,
} from '../controllers/githubController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/contributions', auth, getContributionsByYear);
router.get('/repositories', auth, getRepositories);
router.post('/import', auth, importRepositories);
router.delete('/repositories/:githubRepositoryId', auth, removeImportedRepository);
router.post('/disconnect', auth, disconnectGithub);

export default router;

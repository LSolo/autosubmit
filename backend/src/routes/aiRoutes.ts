import { Router } from 'express';
import { AIController } from '../controllers/aiController';

const router = Router();
const aiController = new AIController();

router.post('/generate-metadata', (req, res) => aiController.generateMetadata(req, res));
router.post('/translate-metadata', (req, res) => aiController.translateMetadata(req, res));
router.post('/release-notes', (req, res) => aiController.generateReleaseNotes(req, res));

export default router;

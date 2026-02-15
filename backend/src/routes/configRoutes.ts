import { Router } from 'express';
import { configService } from '../services/configService';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const config = await configService.getConfig();
    // Mask API key for security when sending to frontend? 
    // For a local desktop app, sending it back is usually fine/necessary for the UI to show it.
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch config' });
  }
});

router.post('/', async (req, res) => {
  try {
    const config = await configService.saveConfig(req.body);
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save config' });
  }
});

export default router;

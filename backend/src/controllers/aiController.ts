import { Request, Response } from 'express';
import { AIService } from '../services/aiService';

const aiService = new AIService();

export class AIController {
  
  async generateMetadata(req: Request, res: Response): Promise<void> {
    try {
      const { appName, features, keywords, language } = req.body;
      
      if (!appName || !features) {
        res.status(400).json({ error: 'appName and features are required' });
        return;
      }

      const metadata = await aiService.generateMetadata(appName, features, keywords || [], language);
      res.json({ success: true, metadata });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  async translateMetadata(req: Request, res: Response): Promise<void> {
    try {
      const { metadata, languages } = req.body;
      
      if (!metadata || !languages || !Array.isArray(languages)) {
        res.status(400).json({ error: 'metadata object and languages array are required' });
        return;
      }

      const translations = await aiService.translateMetadata(metadata, languages);
      res.json({ success: true, translations });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  async generateReleaseNotes(req: Request, res: Response): Promise<void> {
    try {
      const { input, tone } = req.body;
      
      if (!input) {
        res.status(400).json({ error: 'input text is required' });
        return;
      }

      const releaseNotes = await aiService.generateReleaseNotes(input, tone);
      res.json({ success: true, releaseNotes });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
}

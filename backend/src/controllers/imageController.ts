import { Request, Response } from 'express';
import { ImageService } from '../services/imageService';
import path from 'path';
import fs from 'fs-extra';

const imageService = new ImageService();

export class ImageController {
  
  async processIcons(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file uploaded' });
        return;
      }

      const platform = req.body.platform || 'both';
      const outputDir = path.join(__dirname, '../../uploads/processed', Date.now().toString());
      
      const files = await imageService.processIcons(req.file.path, outputDir, platform);

      // In a real app, we might zip these and return the zip file, or upload to S3.
      // For now, we return the paths.
      res.json({ success: true, files, outputDir });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    } finally {
        // Cleanup uploaded file if needed, but we might want to keep it for a bit
        // fs.remove(req.file.path); 
    }
  }

  async frameScreenshot(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No screenshot uploaded' });
        return;
      }

      const { platform = 'ios', backgroundColor = '#ffffff', caption = '', textColor = '#000000' } = req.body;
      const outputDir = path.join(__dirname, '../../uploads/framed', Date.now().toString());
      
      const framedPath = await imageService.frameScreenshot(req.file.path, outputDir, {
        platform,
        backgroundColor,
        caption,
        textColor
      });

      // Convert absolute path to relative URL
      const uploadsRoot = path.join(__dirname, '../../');
      const relativePath = path.relative(uploadsRoot, framedPath);
      const url = `http://localhost:3000/${relativePath}`; // In prod, use env var for host

      res.json({ success: true, framedPath, url });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
}

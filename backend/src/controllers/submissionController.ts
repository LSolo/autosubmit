import { Request, Response } from 'express';
import { SubmissionService } from '../services/submissionService';
import fs from 'fs-extra';

const submissionService = new SubmissionService();

export class SubmissionController {

  async submitAndroid(req: Request, res: Response): Promise<void> {
    try {
      const { packageName, track, changes, serviceAccountJson } = req.body;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'AAB file is required' });
        return;
      }

      if (!packageName || !serviceAccountJson) {
         res.status(400).json({ error: 'packageName and serviceAccountJson are required' });
         return;
      }

      const credentials = JSON.parse(serviceAccountJson);

      const result = await submissionService.submitToGooglePlay(
        packageName,
        track || 'internal',
        file.path,
        credentials,
        changes
      );

      res.json({ success: true, result });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    } finally {
      if (req.file) {
        // fs.remove(req.file.path); // Keep for debugging or cleanup later
      }
    }
  }

  async submitIOS(req: Request, res: Response): Promise<void> {
    try {
      const { issuerId, keyId, privateKey } = req.body;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: 'IPA file is required' });
        return;
      }

      if (!issuerId || !keyId || !privateKey) {
        res.status(400).json({ error: 'Missing required iOS credentials (issuerId, keyId, privateKey)' });
        return;
      }

      const result = await submissionService.submitToAppStore(
        file.path,
        { issuerId, keyId, privateKey }
      );

      res.json({ success: true, result });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
    } finally {
      if (req.file) {
        // fs.remove(req.file.path); 
      }
    }
  }
}

import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import fs from 'fs-extra';
import { getIO } from '../socket';

import { spawn } from 'child_process';
import util from 'util';
import path from 'path';
import os from 'os';

interface GooglePlayCredentials {
  client_email: string;
  private_key: string;
}

interface AppStoreCredentials {
  issuerId: string;
  keyId: string;
  privateKey: string;
}

export class SubmissionService {

  private log(message: string) {
    console.log(`[Submission] ${message}`);
    try {
      getIO().emit('log', { timestamp: new Date().toISOString(), message });
    } catch (e) {
      // Socket might not be initialized in tests or partial runs
    }
  }
  
  // Google Play Submission
  async submitToGooglePlay(
    packageName: string,
    track: string,
    aabFilePath: string,
    credentials: GooglePlayCredentials,
    changes?: string
  ): Promise<any> {
    this.log(`Starting Google Play submission for ${packageName} to track: ${track}`);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    const androidPublisher = google.androidpublisher({
      version: 'v3',
      auth,
    });

    try {
      // 1. Create a new edit
      this.log('Creating new edit session...');
      const edit = await androidPublisher.edits.insert({
        packageName,
      });
      const editId = edit.data.id;

      if (!editId) throw new Error('Failed to create edit session');
      this.log(`Edit session created: ${editId}`);

      // 2. Upload AAB
      this.log('Uploading App Bundle (AAB)...');
      const res = await androidPublisher.edits.bundles.upload({
        editId,
        packageName,
        media: {
          mimeType: 'application/octet-stream',
          body: fs.createReadStream(aabFilePath),
        },
      });

      const versionCode = res.data.versionCode;
      this.log(`Upload successful. Version Code: ${versionCode}`);
      
      // 3. Update Track
      this.log(`Updating track '${track}'...`);
      await androidPublisher.edits.tracks.update({
        editId,
        packageName,
        track,
        requestBody: {
          releases: [{
            versionCodes: [versionCode!.toString()],
            status: 'completed',
            releaseNotes: changes ? [{ language: 'en-US', text: changes }] : undefined
          }]
        }
      });

      // 4. Commit Edit
      this.log('Committing edit...');
      await androidPublisher.edits.commit({
        editId,
        packageName,
      });
      
      this.log('Google Play submission completed successfully.');

      return { success: true, versionCode, track };
    } catch (error: any) {
      this.log(`Google Play Submission Error: ${error.message}`);
      console.error('Google Play Submission Error:', error);
      throw error;
    }
  }

  // App Store Connect Submission (Binary Upload via altool)
  async submitToAppStore(
    ipaFilePath: string,
    credentials: AppStoreCredentials
  ): Promise<any> {
    
    // 1. Setup Private Key for altool
    // altool expects keys in ~/.appstoreconnect/private_keys/ or ~/.private_keys/
    // Filename must be AuthKey_<KeyID>.p8
    const homeDir = os.homedir();
    const keyDir = path.join(homeDir, '.appstoreconnect', 'private_keys');
    const keyFile = path.join(keyDir, `AuthKey_${credentials.keyId}.p8`);

    this.log('Preparing iOS credentials...');

    try {
      await fs.ensureDir(keyDir);
      await fs.writeFile(keyFile, credentials.privateKey);
      this.log(`Auth key written to ${keyFile}`);

      // 2. Execute Upload Command
      // xcrun altool --upload-app --type ios --file <file> --apiKey <key_id> --apiIssuer <issuer_id>
      const args = [
        'altool',
        '--upload-app',
        '--type', 'ios',
        '--file', ipaFilePath,
        '--apiKey', credentials.keyId,
        '--apiIssuer', credentials.issuerId
      ];
      
      this.log('Executing xcrun altool...');
      
      // Use spawn to stream logs
      await new Promise<void>((resolve, reject) => {
        const child = spawn('xcrun', args);

        child.stdout.on('data', (data) => {
          const lines = data.toString().split('\n');
          lines.forEach((line: string) => {
            if(line.trim()) this.log(`[altool] ${line.trim()}`);
          });
        });

        child.stderr.on('data', (data) => {
           const lines = data.toString().split('\n');
           lines.forEach((line: string) => {
             if(line.trim()) this.log(`[altool] ${line.trim()}`);
           });
        });

        child.on('close', (code) => {
          if (code === 0) {
            this.log('iOS upload process finished successfully.');
            resolve();
          } else {
            this.log(`iOS upload process failed with code ${code}`);
            reject(new Error(`altool exited with code ${code}`));
          }
        });
      });

      return { success: true };

    } catch (error: any) {
      this.log(`App Store Submission Error: ${error.message || error}`);
      console.error('App Store Submission Error:', error);
      throw new Error(`iOS Upload Failed: ${error.message || error}`);
    }
    // We intentionally do not delete the key file immediately to avoid race conditions if multiple uploads happen,
    // and it's standard to keep these keys on the build machine.
  }
}

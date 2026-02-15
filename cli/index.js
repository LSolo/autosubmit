#!/usr/bin/env node

const { Command } = require('commander');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
require('dotenv').config();

const program = new Command();
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

program
  .name('autosubmit')
  .description('CLI for Autosubmit Mobile App Automation')
  .version('1.0.0');

// Image Processing Command
program
  .command('process-images')
  .description('Process and resize images for Android and iOS')
  .requiredOption('-i, --input <path>', 'Input image path')
  .option('-p, --platform <platform>', 'Target platform (android, ios, both)', 'both')
  .action(async (options) => {
    try {
      console.log(chalk.blue('Processing images...'));
      const form = new FormData();
      form.append('image', fs.createReadStream(options.input));
      form.append('platform', options.platform);

      const response = await axios.post(`${API_URL}/images/icons`, form, {
        headers: { ...form.getHeaders() }
      });

      console.log(chalk.green('Success!'));
      console.log('Output Directory:', response.data.outputDir);
      console.log('Files generated:', response.data.files.length);
    } catch (error) {
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
    }
  });

// Metadata Generation Command
program
  .command('generate-metadata')
  .description('Generate ASO metadata using AI')
  .requiredOption('-n, --name <name>', 'App Name')
  .requiredOption('-f, --features <features>', 'Comma separated features')
  .option('-k, --keywords <keywords>', 'Comma separated keywords')
  .option('-l, --language <lang>', 'Target language', 'en')
  .action(async (options) => {
    try {
      console.log(chalk.blue('Generating metadata...'));
      const response = await axios.post(`${API_URL}/ai/generate-metadata`, {
        appName: options.name,
        features: options.features.split(','),
        keywords: options.keywords ? options.keywords.split(',') : [],
        language: options.language
      });

      console.log(chalk.green('Metadata Generated:'));
      console.log(JSON.stringify(response.data.metadata, null, 2));
    } catch (error) {
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
    }
  });

// Submission Command
program
  .command('submit-android')
  .description('Submit Android App Bundle to Google Play')
  .requiredOption('-p, --package <package>', 'Package Name')
  .requiredOption('-f, --file <path>', 'Path to .aab file')
  .requiredOption('-k, --key <path>', 'Path to service-account.json')
  .option('-t, --track <track>', 'Track (internal, alpha, beta, production)', 'internal')
  .option('-c, --changes <changes>', 'Release notes')
  .action(async (options) => {
    try {
      console.log(chalk.blue('Submitting to Google Play...'));
      
      const keyContent = fs.readFileSync(options.key, 'utf8');
      
      const form = new FormData();
      form.append('buildFile', fs.createReadStream(options.file));
      form.append('packageName', options.package);
      form.append('track', options.track);
      if (options.changes) form.append('changes', options.changes);
      form.append('serviceAccountJson', keyContent);

      const response = await axios.post(`${API_URL}/submit/android`, form, {
        headers: { ...form.getHeaders() },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      console.log(chalk.green('Submission Successful!'));
      console.log(response.data.result);
    } catch (error) {
      console.error(chalk.red('Error:'), error.response?.data?.error || error.message);
    }
  });

program.parse();

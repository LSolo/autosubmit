# Autosubmit - Mobile App Automation Tool

A cross-platform automation app that streamlines the process of submitting mobile apps to both the **Android (Google Play Store)** and **iOS (Apple App Store)** markets.

## Features

- **Automatic App Uploading:** Submit .aab and metadata to Google Play and App Store Connect.
- **Image Resizing:** Automatically generate all required icon sizes and screenshot formats.
- **AI Metadata:** Generate optimized titles, descriptions, and keywords using AI.
- **Dual Interface:** Use the Web Dashboard for manual control or the CLI for CI/CD pipelines.

## Project Structure

- `backend/`: Node.js/Express server handling the core logic.
- `frontend/`: React/Vite dashboard for user interaction.
- `cli/`: Command-line interface for automation scripts.

## Prerequisites

- Node.js (v18+)
- Google Play Service Account JSON (for Android submission)
- App Store Connect API Key (for iOS submission)
- OpenAI API Key (for metadata generation)

## Desktop Application (Standalone)

The application has been built as a standalone macOS app:

- **Location**: `frontend/dist_electron/mac/AutoSubmit.app`
- **Installation**: Drag this file to your `/Applications` folder.

### Features
- **Bundled Backend**: The app automatically starts its own local server on port 3000. No need to run `npm run dev` separately!
- **Zero Config**: Works out of the box (requires Node.js installed on the system).

### Troubleshooting
- **Logs**: If the app fails to start, check the console logs. The backend logs are output to the Electron console.
- **Ports**: Ensure port 3000 is free before starting the app.

## Setup & Running

### Quick Start (Recommended)

Run the entire stack (Backend + Frontend) with a single command:

```bash
# Install dependencies for all packages
npm install

# Start development server (Web Dashboard + Backend)
npm run dev

# Start Desktop App (Electron + Backend)
npm run desktop
```

### Manual Setup

#### 1. Backend

```bash
cd backend
npm install
# Create a .env file based on your needs (see backend/src/index.ts)
# export OPENAI_API_KEY=your_key
npm run dev
```

The server runs on `http://localhost:3000`.

#### 2. Frontend (Dashboard)

```bash
cd frontend
npm install
npm run dev          # Web version
npm run electron:dev # Desktop version
```

The dashboard runs on `http://localhost:5173`.

#### 3. CLI

```bash
cd cli
npm install
npm link # make 'autosubmit' command available globally
```

Usage:
```bash
autosubmit --help
autosubmit process-images -i path/to/icon.png
autosubmit generate-metadata -n "MyApp" -f "Fast, Secure"
```

## Configuration

Ensure you have your API keys ready.
- **Android:** Place your service account JSON file in a secure location or paste the content in the dashboard.
- **iOS:** Have your Issuer ID, Key ID, and Private Key ready.

## CI/CD Integration

You can use the CLI tool in GitHub Actions or Jenkins:

```yaml
- name: Submit to Play Store
  run: |
    node cli/index.js submit-android \
      --package com.example.app \
      --file build/app-release.aab \
      --key secrets/service-account.json \
      --track production
```

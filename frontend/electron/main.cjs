const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const fs = require('fs');

let backendProcess = null;

function startBackend() {
  const isDev = !app.isPackaged;
  if (isDev) {
    console.log('Dev mode: Backend should be running separately via concurrently.');
    return;
  }

  const backendPath = path.join(process.resourcesPath, 'backend', 'dist', 'index.js');
  const backendCwd = path.join(process.resourcesPath, 'backend');

  console.log('Backend Path:', backendPath);

  if (fs.existsSync(backendPath)) {
    backendProcess = fork(backendPath, [], {
      cwd: backendCwd,
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        USER_DATA_PATH: app.getPath('userData')
      }
    });

    console.log('Backend process started with PID:', backendProcess.pid);

    backendProcess.on('error', (err) => {
      console.error('Failed to start backend:', err);
    });
    
    backendProcess.on('exit', (code, signal) => {
        console.log(`Backend process exited with code ${code} and signal ${signal}`);
    });

  } else {
    console.error('Backend executable not found at:', backendPath);
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, 
    },
  });

  const isDev = !app.isPackaged;
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  win.loadURL(startUrl);

  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (backendProcess) {
    console.log('Killing backend process...');
    backendProcess.kill();
  }
});


app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

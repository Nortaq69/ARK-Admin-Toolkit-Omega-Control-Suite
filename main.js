const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Import security components
const HWIDManager = require('./components/security/hwid.js');
const AntiTamper = require('./components/security/anti-tamper.js');
const DevToolsLockout = require('./components/security/dev-tools-lockout.js');

let mainWindow;
let hwidManager;
let antiTamper;
let devToolsLockout;

async function initializeSecurity() {
    console.log('🔐 Initializing PlayNexus security systems...');
    
    try {
        // Initialize HWID system
        hwidManager = new HWIDManager();
        const hwidValid = await hwidManager.init();
        
        if (!hwidValid) {
            console.error('❌ HWID validation failed');
            dialog.showErrorBox('Security Error', 'Hardware validation failed. This application is locked to a single device.');
            app.quit();
            return false;
        }

        // Initialize anti-tamper system
        antiTamper = new AntiTamper();
        const integrityValid = await antiTamper.init();
        
        if (!integrityValid) {
            console.error('❌ File integrity check failed');
            dialog.showErrorBox('Security Error', 'File integrity verification failed. The application may have been tampered with.');
            app.quit();
            return false;
        }

        console.log('✅ Security systems initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Security initialization failed:', error);
        dialog.showErrorBox('Security Error', 'Failed to initialize security systems.');
        app.quit();
        return false;
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/branding/icon.png'),
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#0a0a0a',
    title: 'PlayNexus Admin Toolkit - Omega Control Suite'
  });

  // Add error handling for file loading
  mainWindow.loadFile('index.html').catch(err => {
    console.error('Failed to load index.html:', err);
    dialog.showErrorBox('Loading Error', 'Failed to load the application. Please check if index.html exists.');
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Add error handling for web contents
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
    dialog.showErrorBox('Loading Error', `Failed to load page: ${errorDescription}`);
  });

  // Initialize dev tools lockout after window is created
  devToolsLockout = new DevToolsLockout();
  devToolsLockout.init(mainWindow);
}

app.whenReady().then(async () => {
    // Initialize security systems first
    const securityValid = await initializeSecurity();
    if (!securityValid) {
        return;
    }
    
    createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
    // Cleanup security systems
    if (devToolsLockout) {
        devToolsLockout.cleanup();
    }
});

// IPC handlers for file operations
ipcMain.handle('save-file', async (event, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save PlayNexus Admin Data',
    defaultPath: 'playnexus-admin-data.json',
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!canceled && filePath) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true, path: filePath };
  }
  return { success: false };
});

ipcMain.handle('load-file', async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Load PlayNexus Admin Data',
    properties: ['openFile'],
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!canceled && filePaths.length > 0) {
    const data = fs.readFileSync(filePaths[0], 'utf8');
    return { success: true, data: JSON.parse(data), path: filePaths[0] };
  }
  return { success: false };
});

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

// Security-related IPC handlers
ipcMain.handle('get-hwid', async (event) => {
    if (hwidManager) {
        return { hwid: hwidManager.getHWID() };
    }
    return { hwid: null };
});

ipcMain.handle('validate-security', async (event) => {
    const hwidValid = hwidManager ? hwidManager.isValidHWID() : false;
    const integrityValid = antiTamper ? antiTamper.isValid() : false;
    
    return {
        hwidValid,
        integrityValid,
        overallValid: hwidValid && integrityValid
    };
}); 
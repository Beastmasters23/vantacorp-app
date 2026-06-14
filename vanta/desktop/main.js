const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const BlackoutStealth = require('./stealth');

// Initialize Stealth Mode
const stealth = new BlackoutStealth("VANTA_SOVEREIGN_KEY_2026");
BlackoutStealth.maskProcess();

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false, // Frameless for stealth aesthetic
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
    
    // Hide from taskbar if OSAD/Pegasus detected
    if (BlackoutStealth.checkHooks()) {
        win.setSkipTaskbar(true);
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC Bridge for Sovereign Ledger & AGI Chat
ipcMain.on('get-ledger', (event) => {
    // Encrypted fetch from local SQLite
    event.reply('ledger-data', { balance: "$9,889.22", status: "STABLE" });
});

ipcMain.on('vanta-signal', (event, message) => {
    console.log(`[OMNI-LINK] Received: ${message}`);
    // Route through Maritime Relay via Lyra's bridge
});
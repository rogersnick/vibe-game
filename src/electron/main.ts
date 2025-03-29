import {app, BrowserWindow} from 'electron';
import * as path from 'path';

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // In development, load from webpack dev server
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:9000');
        mainWindow.webContents.openDevTools();
    } else {
        // In production, load the built files
        mainWindow.loadFile(path.join(__dirname, '../index.html'));
    }
}

app.whenReady().then(createWindow);

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
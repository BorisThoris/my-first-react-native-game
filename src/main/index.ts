import path from 'node:path';
import { app, BrowserWindow } from 'electron';
import type { DisplayMode } from '../shared/contracts';
import { registerIpcHandlers } from './ipc';
import { PersistenceService } from './persistence';
import { createSteamAdapter } from './steam';

const createMainWindow = (displayMode: DisplayMode): BrowserWindow => {
    const window = new BrowserWindow({
        width: 1600,
        height: 960,
        minWidth: 1280,
        minHeight: 720,
        show: false,
        fullscreen: displayMode === 'fullscreen',
        backgroundColor: '#090d18',
        autoHideMenuBar: true,
        title: 'Memory Dungeon',
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });

    window.once('ready-to-show', () => {
        window.show();
    });

    const devServerUrl = process.env.VITE_DEV_SERVER_URL;

    if (devServerUrl) {
        void window.loadURL(devServerUrl);
        window.webContents.openDevTools({ mode: 'detach' });
    } else {
        void window.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
    }

    return window;
};

const bootstrap = async (): Promise<void> => {
    const persistence = new PersistenceService();
    const steamAdapter = createSteamAdapter();
    const mainWindow = createMainWindow(persistence.getSettings().displayMode);

    registerIpcHandlers(mainWindow, persistence, steamAdapter);
};

app.whenReady().then(() => {
    void bootstrap();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            void bootstrap();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

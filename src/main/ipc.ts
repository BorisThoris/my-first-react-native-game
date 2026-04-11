import { app, ipcMain } from 'electron';
import type { BrowserWindow } from 'electron';
import type { AchievementId, DisplayMode, SaveData, Settings } from '../shared/contracts';
import type { PersistenceService } from './persistence';
import type { SteamAdapter } from './steam';

const applyDisplayMode = (window: BrowserWindow, mode: DisplayMode): void => {
    try {
        window.setFullScreen(mode === 'fullscreen');
    } catch (error) {
        console.error('[ipc] setFullScreen failed', mode, error);
        throw error;
    }
};

export const registerIpcHandlers = (
    getMainWindow: () => BrowserWindow | null,
    persistence: PersistenceService,
    steamAdapter: SteamAdapter
): void => {
    ipcMain.handle('desktop:get-settings', () => {
        try {
            return persistence.getSettings();
        } catch (error) {
            console.error('[ipc] desktop:get-settings failed', error);
            throw error;
        }
    });
    ipcMain.handle('desktop:get-save-data', () => {
        try {
            return persistence.getSaveData();
        } catch (error) {
            console.error('[ipc] desktop:get-save-data failed', error);
            throw error;
        }
    });
    ipcMain.handle('desktop:is-steam-connected', () => {
        try {
            return steamAdapter.isConnected();
        } catch (error) {
            console.error('[ipc] desktop:is-steam-connected failed', error);
            throw error;
        }
    });
    ipcMain.handle('desktop:set-display-mode', (_event, mode: DisplayMode) => {
        try {
            const window = getMainWindow();
            if (!window || window.isDestroyed()) {
                console.warn('[ipc] desktop:set-display-mode skipped: no main window');
                return;
            }
            applyDisplayMode(window, mode);
        } catch (error) {
            console.error('[ipc] desktop:set-display-mode failed', error);
            throw error;
        }
    });
    ipcMain.handle('desktop:save-settings', (_event, settings: Settings) => {
        try {
            const saveData = persistence.saveSettings(settings);
            const window = getMainWindow();
            if (window && !window.isDestroyed()) {
                applyDisplayMode(window, saveData.settings.displayMode);
            }
            return saveData.settings;
        } catch (error) {
            console.error('[ipc] desktop:save-settings failed', error);
            throw error;
        }
    });
    ipcMain.handle('desktop:save-game', (_event, saveData: SaveData) => {
        try {
            return persistence.saveGame(saveData);
        } catch (error) {
            console.error('[ipc] desktop:save-game failed', error);
            throw error;
        }
    });
    ipcMain.handle('desktop:unlock-achievement', (_event, achievementId: AchievementId) => {
        try {
            persistence.unlockAchievement(achievementId);
            return steamAdapter.unlockAchievement(achievementId);
        } catch (error) {
            console.error('[ipc] desktop:unlock-achievement failed', achievementId, error);
            throw error;
        }
    });
    ipcMain.handle('desktop:quit-app', () => {
        try {
            app.quit();
        } catch (error) {
            console.error('[ipc] desktop:quit-app failed', error);
            throw error;
        }
    });
};

import { ipcMain } from 'electron';
import type { BrowserWindow } from 'electron';
import type { AchievementId, DisplayMode, SaveData, Settings } from '../shared/contracts';
import type { PersistenceService } from './persistence';
import type { SteamAdapter } from './steam';

const applyDisplayMode = (window: BrowserWindow, mode: DisplayMode): void => {
    window.setFullScreen(mode === 'fullscreen');
};

export const registerIpcHandlers = (
    window: BrowserWindow,
    persistence: PersistenceService,
    steamAdapter: SteamAdapter
): void => {
    ipcMain.handle('desktop:get-settings', () => persistence.getSettings());
    ipcMain.handle('desktop:get-save-data', () => persistence.getSaveData());
    ipcMain.handle('desktop:is-steam-connected', () => steamAdapter.isConnected());
    ipcMain.handle('desktop:set-display-mode', (_event, mode: DisplayMode) => {
        applyDisplayMode(window, mode);
    });
    ipcMain.handle('desktop:save-settings', (_event, settings: Settings) => {
        const saveData = persistence.saveSettings(settings);
        applyDisplayMode(window, saveData.settings.displayMode);
        return saveData.settings;
    });
    ipcMain.handle('desktop:save-game', (_event, saveData: SaveData) => persistence.saveGame(saveData));
    ipcMain.handle('desktop:unlock-achievement', (_event, achievementId: AchievementId) => {
        persistence.unlockAchievement(achievementId);
        return steamAdapter.unlockAchievement(achievementId);
    });
};

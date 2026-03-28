import { contextBridge, ipcRenderer } from 'electron';
import type { DesktopApi } from '../shared/contracts';

const desktopApi: DesktopApi = {
    getSettings: () => ipcRenderer.invoke('desktop:get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('desktop:save-settings', settings),
    getSaveData: () => ipcRenderer.invoke('desktop:get-save-data'),
    saveGame: (data) => ipcRenderer.invoke('desktop:save-game', data),
    unlockAchievement: (achievementId) => ipcRenderer.invoke('desktop:unlock-achievement', achievementId),
    isSteamConnected: () => ipcRenderer.invoke('desktop:is-steam-connected'),
    setDisplayMode: (mode) => ipcRenderer.invoke('desktop:set-display-mode', mode)
};

contextBridge.exposeInMainWorld('desktop', desktopApi);

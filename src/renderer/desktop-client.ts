import type { DesktopApi, DisplayMode, SaveData, Settings } from '../shared/contracts';
import { createDefaultSaveData, normalizeSaveData } from '../shared/save-data';

const STORAGE_KEY = 'memory-dungeon-save-data';

const readLocalSave = (): SaveData => {
    if (typeof window === 'undefined' || !window.localStorage) {
        return createDefaultSaveData();
    }

    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
        return createDefaultSaveData();
    }

    try {
        return normalizeSaveData(JSON.parse(rawValue) as SaveData);
    } catch {
        return createDefaultSaveData();
    }
};

const writeLocalSave = (saveData: SaveData): SaveData => {
    const normalized = normalizeSaveData(saveData);

    if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }

    return normalized;
};

const fallbackClient: DesktopApi = {
    async getSettings(): Promise<Settings> {
        return readLocalSave().settings;
    },
    async saveSettings(settings: Settings): Promise<Settings> {
        const saveData = readLocalSave();
        return writeLocalSave({ ...saveData, settings }).settings;
    },
    async getSaveData(): Promise<SaveData> {
        return readLocalSave();
    },
    async saveGame(data: SaveData): Promise<SaveData> {
        return writeLocalSave(data);
    },
    async unlockAchievement(): Promise<boolean> {
        return false;
    },
    async isSteamConnected(): Promise<boolean> {
        return false;
    },
    async setDisplayMode(mode: DisplayMode): Promise<void> {
        const saveData = readLocalSave();
        writeLocalSave({
            ...saveData,
            settings: {
                ...saveData.settings,
                displayMode: mode
            }
        });
    },
    async quitApp(): Promise<void> {
        /* Electron uses preload IPC; web/Vitest uses this no-op unless window.desktop is mocked. */
    }
};

export const desktopClient: DesktopApi = window.desktop ?? fallbackClient;

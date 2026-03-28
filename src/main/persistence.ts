import Store from 'electron-store';
import type { AchievementId, SaveData, Settings } from '../shared/contracts';
import { normalizeSaveData } from '../shared/save-data';

interface StoreShape {
    saveData: SaveData;
}

export class PersistenceService {
    private readonly store = new Store<StoreShape>({
        name: 'memory-dungeon-save',
        defaults: {
            saveData: normalizeSaveData()
        }
    });

    getSaveData(): SaveData {
        return normalizeSaveData(this.store.get('saveData'));
    }

    getSettings(): Settings {
        return this.getSaveData().settings;
    }

    saveSettings(settings: Settings): SaveData {
        const nextSave = normalizeSaveData({
            ...this.getSaveData(),
            settings
        });

        this.store.set('saveData', nextSave);
        return nextSave;
    }

    saveGame(saveData: SaveData): SaveData {
        const nextSave = normalizeSaveData(saveData);
        this.store.set('saveData', nextSave);
        return nextSave;
    }

    unlockAchievement(achievementId: AchievementId): SaveData {
        const saveData = this.getSaveData();
        const nextSave = normalizeSaveData({
            ...saveData,
            achievements: {
                ...saveData.achievements,
                [achievementId]: true
            }
        });

        this.store.set('saveData', nextSave);
        return nextSave;
    }
}

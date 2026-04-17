import type { SaveData, Settings } from '../../shared/contracts';
import { normalizeSaveData } from '../../shared/save-data';
import { desktopClient } from '../desktop-client';

let consecutiveWriteFailures = 0;

type WriteFailDetail = { consecutive: number; op: 'game' | 'settings' };

let onWriteFail: ((detail: WriteFailDetail) => void) | null = null;

/** Wired once from `useAppStore` so we can surface disk errors without circular imports. */
export const registerPersistenceWriteFailureHandler = (fn: ((detail: WriteFailDetail) => void) | null): void => {
    onWriteFail = fn;
};

const SHORT_NOTICE =
    'Could not write save data. Progress may not persist after closing the game until this is fixed.';
const REPEATED_NOTICE =
    'Save keeps failing. Check disk space and file permissions, or close other programs that might lock the save file.';

export const persistSaveData = async (saveData: SaveData): Promise<SaveData> => {
    try {
        const out = normalizeSaveData(await desktopClient.saveGame(saveData));
        consecutiveWriteFailures = 0;
        return out;
    } catch (error) {
        consecutiveWriteFailures += 1;
        console.error('[persist] saveGame failed', error);
        onWriteFail?.({
            consecutive: consecutiveWriteFailures,
            op: 'game'
        });
        throw error;
    }
};

export const persistSaveSettings = async (settings: Settings): Promise<Settings> => {
    try {
        const out = await desktopClient.saveSettings(settings);
        consecutiveWriteFailures = 0;
        return out;
    } catch (error) {
        consecutiveWriteFailures += 1;
        console.error('[persist] saveSettings failed', error);
        onWriteFail?.({
            consecutive: consecutiveWriteFailures,
            op: 'settings'
        });
        throw error;
    }
};

export const persistenceNoticeForConsecutiveFailures = (consecutive: number): string =>
    consecutive >= 2 ? REPEATED_NOTICE : SHORT_NOTICE;

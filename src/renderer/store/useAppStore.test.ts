import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { createDefaultSaveData } from '../../shared/save-data';
import { useAppStore } from './useAppStore';

const resetStore = (): void => {
    const saveData = createDefaultSaveData();

    useAppStore.setState({
        hydrated: true,
        hydrating: false,
        steamConnected: false,
        view: 'menu',
        settingsReturnView: 'menu',
        saveData,
        settings: saveData.settings,
        run: null,
        newlyUnlockedAchievements: [],
        boardPinMode: false,
        destroyPairArmed: false,
        peekModeArmed: false
    });
};

describe('useAppStore timers', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.useFakeTimers();
        resetStore();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('freezes a pending board resolution while settings are open', async () => {
        useAppStore.getState().startRun();

        const memorizeDuration = useAppStore.getState().run?.timerState.memorizeRemainingMs ?? 0;
        await vi.advanceTimersByTimeAsync(memorizeDuration + 1);

        const run = useAppStore.getState().run;
        expect(run?.status).toBe('playing');

        const board = run?.board;
        expect(board).not.toBeNull();

        const firstTile = board?.tiles[0];
        const mismatchTile = board?.tiles.find((tile) => tile.pairKey !== firstTile?.pairKey);

        expect(firstTile).toBeDefined();
        expect(mismatchTile).toBeDefined();

        useAppStore.getState().pressTile(firstTile!.id);
        useAppStore.getState().pressTile(mismatchTile!.id);

        expect(useAppStore.getState().run?.status).toBe('resolving');

        useAppStore.getState().openSettings('playing');
        expect(useAppStore.getState().view).toBe('settings');
        expect(useAppStore.getState().run?.status).toBe('paused');

        await vi.advanceTimersByTimeAsync(1200);

        expect(useAppStore.getState().run?.stats.tries).toBe(0);
        expect(useAppStore.getState().run?.lives).toBe(4);

        useAppStore.getState().closeSettings();
        expect(useAppStore.getState().view).toBe('playing');
        expect(useAppStore.getState().run?.status).toBe('resolving');

        await vi.advanceTimersByTimeAsync(1400);

        expect(useAppStore.getState().run?.status).toBe('playing');
        expect(useAppStore.getState().run?.stats.tries).toBe(1);
        expect(useAppStore.getState().run?.lives).toBe(4);
    });

    it('resolves matches immediately so the next pair can be started right away', async () => {
        useAppStore.getState().startRun();

        const memorizeDuration = useAppStore.getState().run?.timerState.memorizeRemainingMs ?? 0;
        await vi.advanceTimersByTimeAsync(memorizeDuration + 1);

        const run = useAppStore.getState().run;
        expect(run?.status).toBe('playing');

        const board = run?.board;
        expect(board).not.toBeNull();

        const firstTile = board?.tiles[0];
        const matchingTile = board?.tiles.find(
            (tile) => tile.id !== firstTile?.id && tile.pairKey === firstTile?.pairKey
        );
        const nextPairTile = board?.tiles.find((tile) => tile.pairKey !== firstTile?.pairKey);

        expect(firstTile).toBeDefined();
        expect(matchingTile).toBeDefined();
        expect(nextPairTile).toBeDefined();

        useAppStore.getState().pressTile(firstTile!.id);
        useAppStore.getState().pressTile(matchingTile!.id);

        const matchedRun = useAppStore.getState().run;
        expect(matchedRun?.status).toBe('playing');
        expect(matchedRun?.board).not.toBeNull();
        const matchedBoard = matchedRun?.board;

        if (!matchedBoard) {
            throw new Error('Expected board to exist after immediate match resolution.');
        }

        expect(matchedBoard.flippedTileIds).toHaveLength(0);
        expect(matchedBoard.tiles.find((tile) => tile.id === firstTile!.id)?.state).toBe('matched');
        expect(matchedBoard.tiles.find((tile) => tile.id === matchingTile!.id)?.state).toBe('matched');

        useAppStore.getState().pressTile(nextPairTile!.id);
        const runAfterNextPress = useAppStore.getState().run;
        expect(runAfterNextPress?.board).not.toBeNull();
        expect(runAfterNextPress?.board?.flippedTileIds).toContain(nextPairTile!.id);
    });
});

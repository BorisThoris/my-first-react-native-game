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
        subscreenReturnView: 'menu',
        saveData,
        settings: saveData.settings,
        run: null,
        newlyUnlockedAchievements: [],
        achievementBridgeNotice: null,
        persistenceWriteNotice: null,
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

    it('ends gauntlet when the deadline passes without a tile press', async () => {
        useAppStore.getState().startGauntletRun();
        const started = useAppStore.getState().run;
        expect(started?.gameMode).toBe('gauntlet');
        useAppStore.setState({
            run: { ...started!, gauntletDeadlineMs: Date.now() - 50 }
        });
        await vi.advanceTimersByTimeAsync(400);
        expect(useAppStore.getState().run?.status).toBe('gameOver');
        expect(useAppStore.getState().view).toBe('gameOver');
    });

    it('SIDE-013: inventory overlay and run settings modal use the same frozen run snapshot after memorize', async () => {
        useAppStore.getState().startRun();
        const memorizeDuration = useAppStore.getState().run?.timerState.memorizeRemainingMs ?? 0;
        await vi.advanceTimersByTimeAsync(memorizeDuration + 1);
        expect(useAppStore.getState().run?.status).toBe('playing');

        useAppStore.getState().openInventoryFromPlaying();
        const frozenForInventory = useAppStore.getState().run;
        expect(useAppStore.getState().view).toBe('inventory');
        expect(frozenForInventory?.status).toBe('paused');
        expect(frozenForInventory?.timerState.pausedFromStatus).toBe('playing');

        useAppStore.getState().closeSubscreen();
        expect(useAppStore.getState().view).toBe('playing');
        expect(useAppStore.getState().run?.status).toBe('playing');

        useAppStore.getState().openSettings('playing');
        const frozenForSettings = useAppStore.getState().run;
        expect(useAppStore.getState().view).toBe('settings');
        expect(frozenForSettings?.status).toBe('paused');
        expect(frozenForSettings?.timerState.pausedFromStatus).toBe('playing');
        expect(frozenForSettings?.timerState).toEqual(frozenForInventory?.timerState);
    });

    it('SIDE-014: closing in-run inventory when run was cleared routes to menu instead of a blank playing shell', () => {
        useAppStore.getState().startRun();
        useAppStore.getState().openInventoryFromPlaying();
        expect(useAppStore.getState().view).toBe('inventory');
        useAppStore.setState({ run: null });
        useAppStore.getState().closeSubscreen();
        expect(useAppStore.getState().view).toBe('menu');
        expect(useAppStore.getState().run).toBeNull();
        expect(useAppStore.getState().subscreenReturnView).toBe('menu');
    });

    it('SIDE-014: closing run settings when run was cleared routes to menu', () => {
        useAppStore.getState().startRun();
        useAppStore.getState().openSettings('playing');
        expect(useAppStore.getState().view).toBe('settings');
        useAppStore.setState({ run: null });
        useAppStore.getState().closeSettings();
        expect(useAppStore.getState().view).toBe('menu');
        expect(useAppStore.getState().run).toBeNull();
        expect(useAppStore.getState().settingsReturnView).toBe('menu');
    });
});

describe('useAppStore scholar contract', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.useFakeTimers();
        resetStore();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('startScholarContractRun leaves shuffle and region shuffle as no-ops from store', async () => {
        useAppStore.getState().startScholarContractRun();
        const started = useAppStore.getState().run;
        expect(started?.activeContract).toEqual({
            noShuffle: true,
            noDestroy: true,
            maxMismatches: null,
            bonusRelicDraftPick: true
        });

        const memorizeDuration = started?.timerState.memorizeRemainingMs ?? 0;
        await vi.advanceTimersByTimeAsync(memorizeDuration + 1);

        const run = useAppStore.getState().run;
        expect(run?.status).toBe('playing');

        const nonceBefore = run!.shuffleNonce;
        const tileIdsBefore = run!.board!.tiles.map((t) => t.id);

        useAppStore.getState().shuffleBoard();
        let after = useAppStore.getState().run;
        expect(after?.shuffleNonce).toBe(nonceBefore);
        expect(after?.board!.tiles.map((t) => t.id)).toEqual(tileIdsBefore);

        useAppStore.getState().shuffleRegionRow(0);
        after = useAppStore.getState().run;
        expect(after?.shuffleNonce).toBe(nonceBefore);
        expect(after?.board!.tiles.map((t) => t.id)).toEqual(tileIdsBefore);
    });

    it('scholar contract blocks destroy when armed with banked charges', async () => {
        useAppStore.getState().startScholarContractRun();
        const memorizeDuration = useAppStore.getState().run?.timerState.memorizeRemainingMs ?? 0;
        await vi.advanceTimersByTimeAsync(memorizeDuration + 1);

        const playing = useAppStore.getState().run!;
        useAppStore.setState({
            run: { ...playing, destroyPairCharges: 1 }
        });
        useAppStore.getState().toggleDestroyPairArmed();
        expect(useAppStore.getState().destroyPairArmed).toBe(true);

        const hidden = useAppStore.getState().run!.board!.tiles.find((t) => t.state === 'hidden')!;
        const boardKeyBefore = JSON.stringify(
            useAppStore.getState().run!.board!.tiles.map((t) => ({ id: t.id, state: t.state }))
        );

        useAppStore.getState().pressTile(hidden.id);

        const after = useAppStore.getState().run!;
        expect(JSON.stringify(after.board!.tiles.map((t) => ({ id: t.id, state: t.state })))).toBe(boardKeyBefore);
        expect(after.destroyPairCharges).toBe(1);
        expect(useAppStore.getState().destroyPairArmed).toBe(true);
    });

    it('restartRun keeps scholar activeContract on the new run', async () => {
        useAppStore.getState().startScholarContractRun();
        const memorizeDuration = useAppStore.getState().run?.timerState.memorizeRemainingMs ?? 0;
        await vi.advanceTimersByTimeAsync(memorizeDuration + 1);

        expect(useAppStore.getState().run?.activeContract).toEqual({
            noShuffle: true,
            noDestroy: true,
            maxMismatches: null,
            bonusRelicDraftPick: true
        });

        useAppStore.getState().restartRun();

        expect(useAppStore.getState().run?.activeContract).toEqual({
            noShuffle: true,
            noDestroy: true,
            maxMismatches: null,
            bonusRelicDraftPick: true
        });
    });
});

describe('useAppStore restartRun menu modes', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.useFakeTimers();
        resetStore();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('restartRun after Wild Run keeps wild menu run and joker mutator bundle', async () => {
        useAppStore.getState().startWildRun();
        const started = useAppStore.getState().run;
        expect(started?.wildMenuRun).toBe(true);
        expect(started?.wildMatchesRemaining).toBeGreaterThanOrEqual(1);

        const memorizeDuration = started?.timerState.memorizeRemainingMs ?? 0;
        await vi.advanceTimersByTimeAsync(memorizeDuration + 1);
        expect(useAppStore.getState().run?.status).toBe('playing');

        useAppStore.getState().restartRun();

        const next = useAppStore.getState().run;
        expect(next?.wildMenuRun).toBe(true);
        expect(next?.wildMatchesRemaining).toBeGreaterThanOrEqual(1);
        expect(next?.activeMutators).toEqual(['sticky_fingers', 'short_memorize', 'findables_floor']);
    });

    it('restartRun after Pin vow keeps maxPinsTotalRun contract', async () => {
        useAppStore.getState().startPinVowRun();
        const started = useAppStore.getState().run;
        expect(started?.activeContract).toEqual({
            noShuffle: false,
            noDestroy: false,
            maxMismatches: null,
            maxPinsTotalRun: 10
        });

        const memorizeDuration = started?.timerState.memorizeRemainingMs ?? 0;
        await vi.advanceTimersByTimeAsync(memorizeDuration + 1);
        expect(useAppStore.getState().run?.status).toBe('playing');

        useAppStore.getState().restartRun();

        expect(useAppStore.getState().run?.activeContract).toEqual({
            noShuffle: false,
            noDestroy: false,
            maxMismatches: null,
            maxPinsTotalRun: 10
        });
    });
});

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { buildBoard, countFindablePairs, createNewRun, createRunShopOffers } from '../../shared/game';
import { createDefaultSaveData } from '../../shared/save-data';
import { BOARD_FLOATER_POP_CLEAR } from './matchScorePop';
import { useAppStore } from './useAppStore';

const gameSfxMocks = vi.hoisted(() => ({
    playDestroyPairSfx: vi.fn(),
    playFlipSfx: vi.fn(),
    playFloorClearSfx: vi.fn(),
    playGambitCommitSfx: vi.fn(),
    playPeekPowerSfx: vi.fn(),
    playPowerArmSfx: vi.fn(),
    playRelicPickSfx: vi.fn(),
    playResolveSfx: vi.fn(),
    playStrayPowerSfx: vi.fn(),
    playWagerArmSfx: vi.fn(),
    resumeAudioContext: vi.fn(),
    sfxGainFromSettings: (masterVolume: number, sfxVolume: number) =>
        Math.max(0, Math.min(1, masterVolume)) * Math.max(0, Math.min(1, sfxVolume))
}));

const uiSfxMocks = vi.hoisted(() => ({
    playPauseOpenSfx: vi.fn(),
    playPauseResumeSfx: vi.fn(),
    playRunStartSfx: vi.fn(),
    resumeUiSfxContext: vi.fn()
}));

vi.mock('../audio/gameSfx', () => gameSfxMocks);
vi.mock('../audio/uiSfx', () => uiSfxMocks);

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
        peekModeArmed: false,
        ...BOARD_FLOATER_POP_CLEAR
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
        vi.clearAllMocks();
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

    it('does not set matchScorePop on mismatch resolve; mismatches increment and mismatchScorePop payload is stored', async () => {
        useAppStore.getState().startRun();

        const memorizeDuration = useAppStore.getState().run?.timerState.memorizeRemainingMs ?? 0;
        await vi.advanceTimersByTimeAsync(memorizeDuration + 1);

        const board = useAppStore.getState().run?.board;
        expect(board).not.toBeNull();

        const firstTile = board?.tiles[0];
        const mismatchTile = board?.tiles.find((tile) => tile.pairKey !== firstTile?.pairKey);

        expect(firstTile).toBeDefined();
        expect(mismatchTile).toBeDefined();

        useAppStore.getState().pressTile(firstTile!.id);
        useAppStore.getState().pressTile(mismatchTile!.id);

        expect(useAppStore.getState().run?.status).toBe('resolving');

        await vi.advanceTimersByTimeAsync(1400);

        expect(useAppStore.getState().run?.status).toBe('playing');
        expect(useAppStore.getState().run?.stats.mismatches).toBe(1);
        expect(useAppStore.getState().matchScorePop).toBeNull();
        expect(useAppStore.getState().mismatchScorePop).not.toBeNull();
        expect(useAppStore.getState().mismatchScorePop?.tileIdA).toBe(firstTile!.id);
        expect(useAppStore.getState().mismatchScorePop?.tileIdB).toBe(mismatchTile!.id);
    });

    it('gambit triple-no-match sets mismatchScorePop with tileIdC in flip order', async () => {
        useAppStore.getState().startRun();

        const memorizeDuration = useAppStore.getState().run?.timerState.memorizeRemainingMs ?? 0;
        await vi.advanceTimersByTimeAsync(memorizeDuration + 1);

        const runAfterMem = useAppStore.getState().run!;
        const threePairBoard = buildBoard(2, {
            runSeed: runAfterMem.runSeed,
            runRulesVersion: runAfterMem.runRulesVersion,
            activeMutators: runAfterMem.activeMutators
        });
        useAppStore.setState({
            run: {
                ...runAfterMem,
                board: threePairBoard,
                findablesTotalThisFloor: countFindablePairs(threePairBoard.tiles)
            }
        });

        const board = useAppStore.getState().run?.board;
        expect(board).not.toBeNull();

        const hidden = board!.tiles.filter((tile) => tile.state === 'hidden');
        const first = hidden[0]!;
        const second = hidden.find((tile) => tile.pairKey !== first.pairKey)!;
        const third = hidden.find(
            (tile) => tile.pairKey !== first.pairKey && tile.pairKey !== second.pairKey
        )!;

        expect(third).toBeDefined();

        useAppStore.getState().pressTile(first.id);
        useAppStore.getState().pressTile(second.id);

        expect(useAppStore.getState().run?.status).toBe('resolving');

        useAppStore.getState().pressTile(third.id);
        expect(useAppStore.getState().run?.board?.flippedTileIds).toEqual([first.id, second.id, third.id]);

        await vi.advanceTimersByTimeAsync(2500);

        expect(useAppStore.getState().run?.status).toBe('playing');
        expect(useAppStore.getState().matchScorePop).toBeNull();

        const miss = useAppStore.getState().mismatchScorePop;
        expect(miss?.tileIdA).toBe(first.id);
        expect(miss?.tileIdB).toBe(second.id);
        expect(miss?.tileIdC).toBe(third.id);
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

    it('routes the floor-clear shop as its own in-run destination without changing shop mechanics', () => {
        const baseRun = createNewRun(0, { echoFeedbackEnabled: false, practiceMode: true, runSeed: 44 });
        const levelCompleteRun = {
            ...baseRun,
            status: 'levelComplete' as const,
            shopGold: 5,
            relicOffer: null,
            timerState: {
                memorizeRemainingMs: null,
                resolveRemainingMs: null,
                debugRevealRemainingMs: null,
                pausedFromStatus: null
            },
            lastLevelResult: {
                level: 1,
                scoreGained: 100,
                rating: 'S' as const,
                livesRemaining: baseRun.lives,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'none' as const,
                clearLifeGained: 0
            }
        };
        useAppStore.setState({
            view: 'playing',
            run: {
                ...levelCompleteRun,
                shopOffers: createRunShopOffers(levelCompleteRun)
            }
        });

        useAppStore.getState().openShopFromLevelComplete();
        expect(useAppStore.getState().view).toBe('shop');

        const peekOffer = useAppStore.getState().run!.shopOffers.find((offer) => offer.itemId === 'peek_charge')!;
        useAppStore.getState().purchaseShopOffer(peekOffer.id);
        expect(useAppStore.getState().run?.shopGold).toBe(5 - peekOffer.cost);
        expect(useAppStore.getState().run?.shopOffers.find((offer) => offer.id === peekOffer.id)?.purchased).toBe(true);

        useAppStore.getState().closeShopToFloorSummary();
        expect(useAppStore.getState().view).toBe('playing');
        expect(useAppStore.getState().run?.status).toBe('levelComplete');

        useAppStore.getState().openShopFromLevelComplete();
        useAppStore.getState().continueFromShop();
        expect(useAppStore.getState().view).toBe('playing');
        expect(useAppStore.getState().run?.status).toBe('memorize');
    });

    it('selects a floor route through side room before shop and stamps the next board after continuing', () => {
        const baseRun = createNewRun(0, { echoFeedbackEnabled: false, runSeed: 45 });
        const levelCompleteRun = {
            ...baseRun,
            status: 'levelComplete' as const,
            shopGold: 5,
            relicOffer: null,
            timerState: {
                memorizeRemainingMs: null,
                resolveRemainingMs: null,
                debugRevealRemainingMs: null,
                pausedFromStatus: null
            },
            lastLevelResult: {
                level: 1,
                scoreGained: 100,
                rating: 'S' as const,
                livesRemaining: baseRun.lives,
                perfect: true,
                mistakes: 0,
                clearLifeReason: 'none' as const,
                clearLifeGained: 0,
                routeChoices: [
                    {
                        id: '17:45:2:greed',
                        routeType: 'greed' as const,
                        label: 'Greedy route',
                        detail: 'Higher pressure route hook for future shop, elite, or bonus rewards.'
                    }
                ]
            }
        };
        useAppStore.setState({
            view: 'playing',
            run: {
                ...levelCompleteRun,
                shopOffers: createRunShopOffers(levelCompleteRun)
            }
        });

        useAppStore.getState().chooseRouteAndContinue('17:45:2:greed');
        expect(useAppStore.getState().view).toBe('sideRoom');
        expect(useAppStore.getState().run?.pendingRouteCardPlan).toMatchObject({ routeType: 'greed' });
        expect(useAppStore.getState().run?.sideRoom).toMatchObject({ routeType: 'greed' });

        useAppStore.getState().skipSideRoom();
        expect(useAppStore.getState().view).toBe('shop');

        useAppStore.getState().continueFromShop();
        expect(useAppStore.getState().view).toBe('playing');
        expect(useAppStore.getState().run?.status).toBe('memorize');
        expect(useAppStore.getState().run?.pendingRouteCardPlan).toBeNull();
        expect(useAppStore.getState().run?.board?.tiles.some((tile) => tile.routeCardKind === 'greed_cache')).toBe(
            true
        );
    });

    it('keeps the shop route unavailable without an active completed floor', () => {
        useAppStore.getState().openShopFromLevelComplete();
        expect(useAppStore.getState().view).toBe('menu');

        useAppStore.setState({ view: 'shop', run: null });
        useAppStore.getState().closeShopToFloorSummary();
        expect(useAppStore.getState().view).toBe('menu');
    });

    it('REG-044: menu meta screens can open settings and return to the intended surface', () => {
        useAppStore.getState().openModeSelect();
        expect(useAppStore.getState().view).toBe('modeSelect');

        useAppStore.getState().openSettings('modeSelect');
        expect(useAppStore.getState().view).toBe('settings');
        expect(useAppStore.getState().settingsReturnView).toBe('modeSelect');

        useAppStore.getState().closeSettings();
        expect(useAppStore.getState().view).toBe('modeSelect');
        expect(useAppStore.getState().run).toBeNull();

        useAppStore.getState().openCollection();
        useAppStore.getState().openSettings('collection');
        expect(useAppStore.getState().settingsReturnView).toBe('collection');

        useAppStore.getState().closeSettings();
        expect(useAppStore.getState().view).toBe('collection');

        useAppStore.getState().goToMenu();
        useAppStore.getState().openProfile();
        expect(useAppStore.getState().view).toBe('profile');
        useAppStore.getState().openSettings('profile');
        expect(useAppStore.getState().settingsReturnView).toBe('profile');
        useAppStore.getState().closeSettings();
        expect(useAppStore.getState().view).toBe('profile');
    });

    it('REG-044: impossible nested settings return targets normalize to menu', () => {
        const invalidSettingsReturn = 'settings' as unknown as Parameters<typeof useAppStore.getState>['length'];
        useAppStore.getState().openSettings(invalidSettingsReturn as never);
        expect(useAppStore.getState().settingsReturnView).toBe('menu');
        useAppStore.getState().closeSettings();
        expect(useAppStore.getState().view).toBe('menu');
    });

    it('plays pause and resume cues from store transitions', async () => {
        useAppStore.getState().startRun();
        const memorizeDuration = useAppStore.getState().run?.timerState.memorizeRemainingMs ?? 0;
        await vi.advanceTimersByTimeAsync(memorizeDuration + 1);

        useAppStore.getState().pause();
        expect(uiSfxMocks.resumeUiSfxContext).toHaveBeenCalled();
        expect(uiSfxMocks.playPauseOpenSfx).toHaveBeenCalledTimes(1);

        useAppStore.getState().resume();
        expect(uiSfxMocks.playPauseResumeSfx).toHaveBeenCalledTimes(1);
    });

    it('plays relic-pick cue when a relic choice is accepted', async () => {
        useAppStore.getState().startRun();
        const run = useAppStore.getState().run!;
        useAppStore.setState({
            run: {
                ...run,
                relicOffer: {
                    tier: 1,
                    options: ['extra_shuffle_charge'],
                    picksRemaining: 1,
                    pickRound: 0
                }
            }
        });

        useAppStore.getState().pickRelic('extra_shuffle_charge');
        expect(gameSfxMocks.resumeAudioContext).toHaveBeenCalled();
        expect(gameSfxMocks.playRelicPickSfx).toHaveBeenCalledTimes(1);
    });

    it('plays wager-arm cue when risk wager is accepted', () => {
        const run = useAppStore.getState().run;
        useAppStore.getState().startRun();
        const current = useAppStore.getState().run!;
        useAppStore.setState({
            run: {
                ...current,
                status: 'levelComplete',
                featuredObjectiveStreak: 2,
                lastLevelResult: {
                    level: 1,
                    scoreGained: 120,
                    rating: 'S++',
                    livesRemaining: 5,
                    perfect: true,
                    mistakes: 0,
                    clearLifeReason: 'perfect',
                    clearLifeGained: 1,
                    featuredObjectiveId: 'flip_par',
                    featuredObjectiveCompleted: true,
                    relicFavorGained: 1,
                    featuredObjectiveStreak: 2
                }
            }
        });

        useAppStore.getState().acceptEndlessRiskWager();
        expect(gameSfxMocks.resumeAudioContext).toHaveBeenCalled();
        expect(gameSfxMocks.playWagerArmSfx).toHaveBeenCalledTimes(1);
        expect(run).not.toBe(useAppStore.getState().run);
    });

    it('REG-088: first classic run can clear, continue, end locally, and persist first-win progress', async () => {
        useAppStore.getState().startRun();
        expect(useAppStore.getState().view).toBe('playing');

        const memorizeDuration = useAppStore.getState().run?.timerState.memorizeRemainingMs ?? 0;
        await vi.advanceTimersByTimeAsync(memorizeDuration + 1);
        expect(useAppStore.getState().run?.status).toBe('playing');

        for (let floor = 1; floor <= 2; floor += 1) {
            let run = useAppStore.getState().run;
            expect(run?.board?.level).toBe(floor);

            const pairGroups = new Map<string, string[]>();
            for (const tile of run!.board!.tiles) {
                if (tile.pairKey === '__decoy__' || tile.pairKey === '__wild__') {
                    continue;
                }
                const ids = pairGroups.get(tile.pairKey) ?? [];
                ids.push(tile.id);
                pairGroups.set(tile.pairKey, ids);
            }

            for (const ids of [...pairGroups.values()].filter((group) => group.length === 2)) {
                useAppStore.getState().pressTile(ids[0]!);
                useAppStore.getState().pressTile(ids[1]!);
            }

            run = useAppStore.getState().run;
            expect(run?.status).toBe('levelComplete');
            expect(run?.lastLevelResult?.perfect).toBe(true);

            if (floor === 1) {
                useAppStore.getState().continueToNextLevel();
                const nextMemorizeMs = useAppStore.getState().run?.timerState.memorizeRemainingMs ?? 0;
                await vi.advanceTimersByTimeAsync(nextMemorizeMs + 1);
                expect(useAppStore.getState().run?.status).toBe('playing');
            }
        }

        const state = useAppStore.getState();
        expect(state.view).toBe('playing');
        expect(state.run?.status).toBe('levelComplete');
        expect(state.saveData.bestScore).toBeGreaterThan(0);
        expect(state.saveData.achievements.ACH_FIRST_CLEAR).toBe(true);
        expect(state.newlyUnlockedAchievements).toEqual([]);
        expect(state.run?.stats.highestLevel).toBe(2);
        expect(state.run?.stats.levelsCleared).toBe(2);
        expect(state.run?.achievementsEnabled).toBe(true);

        useAppStore.getState().endRun();
        expect(useAppStore.getState().view).toBe('menu');
        expect(useAppStore.getState().run).toBeNull();
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

import type { GameplayHudBarProps } from '../components/GameplayHudBar';
import type { RunState } from '../../shared/contracts';
import { createGauntletRun, createNewRun, finishMemorizePhase } from '../../shared/game-core';

export type GameplayHudBarFixtureId = 'daily' | 'gauntlet' | 'scholar' | 'multiMutator';

const intoPlaying = (run: RunState, hud: Omit<GameplayHudBarProps, 'run'>): GameplayHudBarProps => ({
    ...hud,
    run: finishMemorizePhase(run)
});

/** Daily strip + score parasite module + a second mutator chip (letters). */
const dailyRunBase = finishMemorizePhase(
    createNewRun(42_000, {
        practiceMode: true,
        gameMode: 'daily',
        dailyDateKeyUtc: '20260414',
        activeMutators: ['score_parasite', 'category_letters'],
        runSeed: 0xd011
    })
);

const hudFixturePropsDaily: GameplayHudBarProps = {
    run: { ...dailyRunBase, parasiteFloors: 2, parasiteWardRemaining: 1 },
    cameraViewportMode: false,
    gauntletRemainingMs: null,
    politeHudAnnouncement: 'Daily challenge 20260414 — floor 3, score twelve thousand four hundred.'
};

/** Gauntlet mode label, timer rail, and gauntlet context chip. */
const hudFixturePropsGauntlet: GameplayHudBarProps = intoPlaying(createGauntletRun(9000), {
    cameraViewportMode: false,
    gauntletRemainingMs: 245_000,
    politeHudAnnouncement: 'Gauntlet — four minutes five seconds left, floor 2.'
});

/** Scholar contract chip + contract stat pill (shuffle disabled). */
const hudFixturePropsScholar: GameplayHudBarProps = intoPlaying(
    createNewRun(1200, {
        practiceMode: true,
        runSeed: 0x5c501a2,
        activeContract: { noShuffle: true, noDestroy: false, maxMismatches: null }
    }),
    {
        cameraViewportMode: false,
        gauntletRemainingMs: null,
        politeHudAnnouncement: 'Scholar contract — board shuffle disabled.'
    }
);

/**
 * Several mutator chips (glyph + label), findables stat rail, N-back anchor subline, shuffle tax context chip.
 */
const multiMutatorBase = finishMemorizePhase(
    createNewRun(88_888, {
        practiceMode: true,
        runSeed: 0xba771e,
        activeMutators: ['short_memorize', 'n_back_anchor', 'findables_floor', 'sticky_fingers', 'wide_recall'],
        shuffleScoreTaxActive: true
    })
);

const hudFixturePropsMultiMutator: GameplayHudBarProps = {
    run: {
        ...multiMutatorBase,
        nBackAnchorPairKey: 'anchor-deadb33f',
        findablesClaimedThisFloor: 2,
        findablesTotalThisFloor: 2,
        stats: {
            ...multiMutatorBase.stats,
            totalScore: 88_888,
            comboShards: 2,
            guardTokens: 1
        }
    },
    cameraViewportMode: false,
    gauntletRemainingMs: null,
    politeHudAnnouncement: 'Five mutators active — pickups two of two claimed this floor.'
};

export const gameplayHudBarFixturePropsById: Record<GameplayHudBarFixtureId, GameplayHudBarProps> = {
    daily: hudFixturePropsDaily,
    gauntlet: hudFixturePropsGauntlet,
    scholar: hudFixturePropsScholar,
    multiMutator: hudFixturePropsMultiMutator
};

export const GAMEPLAY_HUD_FIXTURE_IDS: GameplayHudBarFixtureId[] = ['daily', 'gauntlet', 'scholar', 'multiMutator'];

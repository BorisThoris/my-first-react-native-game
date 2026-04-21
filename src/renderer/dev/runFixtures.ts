/**
 * Dev sandbox fixtures (`?devSandbox=1&screen=playing&fixture=…`).
 *
 * | Fixture id     | runSeed / notes                                      | Expected surface                                      |
 * | -------------- | ---------------------------------------------------- | ----------------------------------------------------- |
 * | arcade         | `0xace`                                              | Post-memorize practice run, playing                   |
 * | memorize       | `0xdec0de`                                           | New run still in memorize phase                       |
 * | daily          | `buildSandboxDailyRun` (live daily table)            | Post-memorize daily                                   |
 * | dailyParasite  | `0xcafe`, `dailyDateKeyUtc: 20260404`, score_parasite | Post-memorize daily + parasite mutator                |
 * | gauntlet       | gauntlet factory                                     | Post-memorize gauntlet                                |
 * | resolvingMismatch | `0xace`, first two non-matching tiles flipped     | Post-memorize arcade, mismatch resolving              |
 * | gambitTripleMissSetup | fixed 2×3 board, three pairs; two mismatched flips + long stall — pick row1 col3 for gambit triple miss |
 * | paused         | `0xbeefe`                                            | Paused arcade run                                     |
 * | gameOver       | `0xdead`                                             | Game over summary (`lives: 0`)                        |
 *
 * **Repro bundle for QA:** copy app version from Settings / About, the query string above, and any non-default
 * settings from `patchRunFromUserSettings` when filing bugs.
 */
import type { RunState, Tile } from '../../shared/contracts';
import {
    buildBoard,
    countFindablePairs,
    createDailyRun,
    createGauntletRun,
    createNewRun,
    createRunSummary,
    finishMemorizePhase,
    flipTile,
    pauseRun
} from '../../shared/game';

/** Row-major 2×3 — pair keys `gk0`,`gk1`,`gk2`; `flipFirstMismatchPair` flips (1,1)+(1,2); gambit triple miss picks (1,3). */
const gambitTripleMissTiles: Tile[] = [
    { id: 'gambit-a0', pairKey: 'gk0', symbol: 'α', label: 'α', state: 'hidden' },
    { id: 'gambit-b0', pairKey: 'gk1', symbol: 'β', label: 'β', state: 'hidden' },
    { id: 'gambit-c0', pairKey: 'gk2', symbol: 'γ', label: 'γ', state: 'hidden' },
    { id: 'gambit-a1', pairKey: 'gk0', symbol: 'α', label: 'α', state: 'hidden' },
    { id: 'gambit-b1', pairKey: 'gk1', symbol: 'β', label: 'β', state: 'hidden' },
    { id: 'gambit-c1', pairKey: 'gk2', symbol: 'γ', label: 'γ', state: 'hidden' }
];

const DEFAULT_FIXTURE = 'arcade';

/** Daily run using live daily mutator table (not practice). */
const buildSandboxDailyRun = (bestScore: number): RunState => createDailyRun(bestScore);

/** Canned runs for `?devSandbox=1&screen=playing&fixture=…` (and gameOver). */
const SANDBOX_FIXTURE_IDS = [
    'arcade',
    'memorize',
    'daily',
    'dailyParasite',
    'gauntlet',
    'resolvingMismatch',
    'gambitTripleMissSetup',
    'paused',
    'gameOver'
] as const;

type SandboxFixtureId = (typeof SANDBOX_FIXTURE_IDS)[number];

const isFixtureId = (id: string | null): id is SandboxFixtureId =>
    id !== null && (SANDBOX_FIXTURE_IDS as readonly string[]).includes(id);

const flipFirstMismatchPair = (run: RunState): RunState => {
    const board = run.board;
    if (!board) {
        return run;
    }

    const pairGroups = new Map<string, string[]>();
    for (const tile of board.tiles) {
        const ids = pairGroups.get(tile.pairKey);
        if (ids) {
            ids.push(tile.id);
        } else {
            pairGroups.set(tile.pairKey, [tile.id]);
        }
    }

    const orderedGroups = [...pairGroups.values()].filter((group) => group.length === 2);
    if (orderedGroups.length < 2) {
        return run;
    }

    return flipTile(flipTile(run, orderedGroups[0]![0]!), orderedGroups[1]![0]!);
};

/**
 * Build a non-persisted run for dev sandbox. Caller should apply `patchRunFromUserSettings`.
 */
export const buildSandboxRun = (fixtureId: string | null, bestScore: number): RunState => {
    const id = isFixtureId(fixtureId) ? fixtureId : DEFAULT_FIXTURE;

    switch (id) {
        case 'memorize': {
            return createNewRun(bestScore, { practiceMode: true, runSeed: 0xdec0de });
        }
        case 'dailyParasite': {
            return finishMemorizePhase(
                createNewRun(bestScore, {
                    practiceMode: true,
                    gameMode: 'daily',
                    dailyDateKeyUtc: '20260404',
                    activeMutators: ['score_parasite'],
                    runSeed: 0xcafe
                })
            );
        }
        case 'daily': {
            return finishMemorizePhase(buildSandboxDailyRun(bestScore));
        }
        case 'gauntlet': {
            return finishMemorizePhase(createGauntletRun(bestScore));
        }
        case 'resolvingMismatch': {
            return flipFirstMismatchPair(
                finishMemorizePhase(createNewRun(bestScore, { practiceMode: true, runSeed: 0xace }))
            );
        }
        case 'gambitTripleMissSetup': {
            let run = finishMemorizePhase(createNewRun(bestScore, { practiceMode: true, runSeed: 0xbee5 }));
            const board = buildBoard(2, {
                fixedTiles: gambitTripleMissTiles,
                runSeed: run.runSeed,
                runRulesVersion: run.runRulesVersion
            });
            run = {
                ...run,
                board,
                findablesTotalThisFloor: countFindablePairs(board.tiles)
            };
            let next = flipFirstMismatchPair(run);
            const stallMs = 120_000;
            next = {
                ...next,
                timerState: {
                    ...next.timerState,
                    resolveRemainingMs: stallMs
                }
            };
            return next;
        }
        case 'paused': {
            const playing = finishMemorizePhase(createNewRun(bestScore, { practiceMode: true, runSeed: 0xbeefe }));
            return pauseRun(playing);
        }
        case 'gameOver': {
            let run = createNewRun(bestScore, { practiceMode: true, runSeed: 0xdead });
            run = finishMemorizePhase(run);
            run = { ...run, status: 'gameOver', lives: 0 };
            return createRunSummary(run, []);
        }
        case 'arcade':
        default: {
            return finishMemorizePhase(createNewRun(bestScore, { practiceMode: true, runSeed: 0xace }));
        }
    }
};

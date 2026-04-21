/**
 * Shuffle / deal motion helpers for the **WebGL** tile board (`TileBoard` → `TileBoardScene`).
 * `TileBoard` uses `computeShuffleMotionBudgetMs`; the scene uses `computeStaggeredShuffleDealZ` during the shuffle window.
 * This module is the single timing source for that path — there is no separate DOM FLIP pipeline for the same effect.
 */
import { TILE_SPACING } from './tileShatter';

export const FLIP_DURATION_MS = 600;
export const STAGGER_MS = 32;

/** Upper bound for 3D ease-out: matches worst-case staggered shuffle motion on this board. */
export function computeShuffleMotionBudgetMs(tileCount: number): number {
    const n = Math.max(1, tileCount);
    if (n <= 1) {
        return FLIP_DURATION_MS + 200;
    }
    return (n - 1) * STAGGER_MS + FLIP_DURATION_MS + 160;
}

/**
 * FX-013: brief per-tile Z lift during the shuffle window, staggered like reading-order index.
 * Returns world-units offset; 0 when outside the window or when `reduceMotion` would skip motion.
 */
export function computeStaggeredShuffleDealZ(
    nowMs: number,
    deadlineMs: number,
    budgetMs: number,
    boardOrderIndex: number,
    tileCount: number
): number {
    if (budgetMs <= 0 || deadlineMs <= 0 || tileCount <= 0) {
        return 0;
    }

    const startMs = deadlineMs - budgetMs;

    if (nowMs < startMs || nowMs >= deadlineMs) {
        return 0;
    }

    const elapsed = nowMs - startMs;
    const n = Math.max(1, tileCount);
    const clampedIndex = Math.min(Math.max(0, boardOrderIndex), Math.max(0, n - 1));
    const tileStart = clampedIndex * STAGGER_MS;
    const localT = Math.max(0, elapsed - tileStart);
    const u = Math.min(1, localT / FLIP_DURATION_MS);
    const envelope = Math.sin(u * Math.PI);

    return envelope * 0.028;
}

/** Same timing envelope as shuffle — used when a new board identity appears (deal-in). */
export function computeBoardEntranceMotionBudgetMs(tileCount: number): number {
    return computeShuffleMotionBudgetMs(tileCount);
}

/** Spiral spread per tile index (full rotations around the deck). */
const ENTRANCE_TWIST_TURNS = 1.65;
/** Extra radians the whole formation rotates over the motion budget (“tornado” spin). */
const ENTRANCE_SPIN_OVER_BUDGET_RAD = Math.PI * 2.85;

/**
 * Per-tile XY offset toward layout rest (spiral / tornado in from off-screen).
 * Returns remainder added to nominal layout targets; fades to zero by end of window.
 */
export function computeBoardEntranceRemainderXY(
    nowMs: number,
    deadlineMs: number,
    budgetMs: number,
    boardOrderIndex: number,
    tileCount: number,
    rows: number,
    columns: number
): { rx: number; ry: number } {
    if (budgetMs <= 0 || deadlineMs <= 0 || tileCount <= 0) {
        return { rx: 0, ry: 0 };
    }

    const startMs = deadlineMs - budgetMs;

    if (nowMs < startMs || nowMs >= deadlineMs) {
        return { rx: 0, ry: 0 };
    }

    const elapsed = nowMs - startMs;
    const n = Math.max(1, tileCount);
    const clampedIndex = Math.min(Math.max(0, boardOrderIndex), Math.max(0, n - 1));
    const tileStart = clampedIndex * STAGGER_MS;
    const localT = Math.max(0, elapsed - tileStart);
    const u = Math.min(1, localT / FLIP_DURATION_MS);
    const eased = u * u * (3 - 2 * u);
    const remain = 1 - eased;

    const rRows = Math.max(1, rows);
    const rCols = Math.max(1, columns);
    const gridSpan = Math.max((rCols - 1) * TILE_SPACING, (rRows - 1) * TILE_SPACING);
    const rMax = 5.9 + gridSpan * 0.85;
    const R = remain * rMax;

    const globalU = Math.min(1, elapsed / budgetMs);
    const globalSmooth = globalU * globalU * (3 - 2 * globalU);
    const theta0 =
        n <= 1 ? 0 : (clampedIndex / Math.max(1, n - 1)) * Math.PI * 2 * ENTRANCE_TWIST_TURNS;
    const theta = theta0 + ENTRANCE_SPIN_OVER_BUDGET_RAD * globalSmooth;

    return {
        rx: R * Math.cos(theta),
        ry: R * Math.sin(theta)
    };
}

/**
 * Shuffle / deal motion helpers for the **WebGL** tile board (`TileBoard` → `TileBoardScene`).
 * `TileBoard` uses `computeShuffleMotionBudgetMs`; the scene uses `computeStaggeredShuffleDealZ` during the shuffle window.
 * This module is the single timing source for that path — there is no separate DOM FLIP pipeline for the same effect.
 */
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

/**
 * Single gate for pointer/gyro-driven tile-field parallax (see `usePlatformTiltField` + `TileBoardScene`).
 * When false, field tilt contribution must be zero — matches OS `prefers-reduced-motion`, in-app reduce motion,
 * and platform tilt suspension.
 */
export const shouldApplyTileFieldParallax = (options: {
    /** In-app accessibility toggle */
    reduceMotion: boolean;
    /** True when `prefers-reduced-motion: reduce` or in-app motion reduction (`useParallaxMotionSuppressed`). */
    motionParallaxSuppressed: boolean;
}): boolean => !options.reduceMotion && !options.motionParallaxSuppressed;

/** Normalized distance from board center in grid space; amp 1 at center, >1 toward edges. */
export const getTileFieldAmplification = (index: number, columns: number, rows: number): number => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const cx = (columns - 1) / 2;
    const cy = (rows - 1) / 2;
    const nx = columns <= 1 ? 0 : (column - cx) / Math.max(cx, 0.5);
    const ny = rows <= 1 ? 0 : (row - cy) / Math.max(cy, 0.5);
    const dist = Math.hypot(nx, ny) / Math.SQRT2;

    return 1 + 0.14 * Math.min(dist, 1);
};

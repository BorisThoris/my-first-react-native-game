/**
 * Safe rectangle (in overlay canvas pixels) for central tarot-style illustration art.
 * Tuned to sit inside the ornate `front.svg` frame; rank/symbol typography stays below.
 */
export type IllustrationPixelRect = { x: number; y: number; width: number; height: number };

/** Fractional inset from overlay canvas edges (matches tall portrait card overlay). */
const CARD_ILLUSTRATION_INSET = {
    left: 0.13,
    top: 0.11,
    right: 0.13,
    bottom: 0.31
} as const;

export const computeIllustrationPixelRect = (canvasWidth: number, canvasHeight: number): IllustrationPixelRect => {
    const x = canvasWidth * CARD_ILLUSTRATION_INSET.left;
    const y = canvasHeight * CARD_ILLUSTRATION_INSET.top;
    const width = canvasWidth * (1 - CARD_ILLUSTRATION_INSET.left - CARD_ILLUSTRATION_INSET.right);
    const height = canvasHeight * (1 - CARD_ILLUSTRATION_INSET.top - CARD_ILLUSTRATION_INSET.bottom);
    return { x, y, width: Math.max(1, width), height: Math.max(1, height) };
};

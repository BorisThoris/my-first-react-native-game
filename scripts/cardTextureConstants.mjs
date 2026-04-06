/**
 * Card texture geometry — keep in sync with `CARD_PLANE_WIDTH` / `CARD_PLANE_HEIGHT`
 * in `src/renderer/components/tileShatter.ts`.
 *
 * WebGL + DOM use **contain** for static card PNGs (full art, letterbox if aspect differs).
 * Shipped files at {@link idealCardTexturePixels} match the quad exactly → no bars.
 */

export const CARD_PLANE_WIDTH = 0.74;
export const CARD_PLANE_HEIGHT = 1.08;
export const CARD_PLANE_ASPECT = CARD_PLANE_WIDTH / CARD_PLANE_HEIGHT;

/**
 * GPT Image (`gpt-image-1`, Images API) only allows 1024×1024, 1024×1536, 1536×1024.
 * Portrait closest to {@link CARD_PLANE_ASPECT} (~0.685) is 1024×1536 (~0.667).
 */
export const OPENAI_GPT_IMAGE_CARD_PLANE_SIZE = '1024x1536';

/**
 * Target pixel size for shipped card PNGs (height × aspect). Engine scales down; extra pixels help sharpness.
 * @param {number} [longEdge=2048] — height in pixels (portrait card)
 */
export function idealCardTexturePixels(longEdge = 2048) {
    const height = Math.round(longEdge);
    const width = Math.max(2, Math.round(height * CARD_PLANE_ASPECT));
    return { width, height, label: `${width}x${height}` };
}

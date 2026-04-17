/**
 * Product feature gates. Import from UI when copy or controls must reflect shipped capability.
 * Cloud / cross-device sync is not implemented; keep false until a real backend exists.
 */
export const FEATURE_CLOUD_SAVE = false;

/** When true and graphics quality is high, card rank/symbol may use opentype.js vector paths after font preload. */
export const FEATURE_CARD_OPENTYPE_GLYPHS = true;

/**
 * When true, face-up card overlays (non-programmatic-motif tiles) composite two layers from a 30-slot raster library
 * instead of a single procedural illustration pass. DEV override: `localStorage.cardRasterDeck = '1'`.
 */
export const FEATURE_CARD_RASTER_DECK = false;

/**
 * Product feature gates. Import from UI when copy or controls must reflect shipped capability.
 * Cloud / cross-device sync is not implemented; keep false until a real backend exists.
 */
export const FEATURE_CLOUD_SAVE = false;

/** When true and graphics quality is high, card rank/symbol may use opentype.js vector paths after font preload. */
export const FEATURE_CARD_OPENTYPE_GLYPHS = true;

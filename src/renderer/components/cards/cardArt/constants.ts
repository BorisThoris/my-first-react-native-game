/** Authoring space for `src/renderer/assets/textures/cards/back.svg`. */
export const CARD_BACK_VIEWBOX = { w: 850, h: 1317 } as const;

/** Authoring space for `src/renderer/assets/textures/cards/front.svg`. */
export const CARD_FRONT_VIEWBOX = { w: 816, h: 1290 } as const;

/**
 * Pivot for {@link CardCrystalMark} / {@link CardSigilOrbit} in **back.svg user space** (850×1317).
 * `back.svg` is an auto-traced mesh without semantic groups — tune this (and CSS `transform-origin`
 * percentages in `cardMotifMotion.module.css`: `x/w*100`, `y/h*100`) when the printed medallion shifts.
 */
export const CARD_BACK_EMBLEM_CENTER = { x: 425, y: 532 } as const;

/** Placeholder pivot for future face overlays (816×1290). */
export const CARD_FRONT_EMBLEM_CENTER = { x: 408, y: 530 } as const;

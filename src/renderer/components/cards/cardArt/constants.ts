/** Authoring space for `authored-card-back.svg` (legacy `back.svg` remains on disk for trace reference). */
export const CARD_BACK_VIEWBOX = { w: 740, h: 1080 } as const;

/** Authoring space for `authored-card-front.svg`. */
export const CARD_FRONT_VIEWBOX = { w: 740, h: 1080 } as const;

/**
 * Pivot for {@link CardCrystalMark} / {@link CardSigilOrbit} in **card back** user space (740×1080).
 * Tune CSS `transform-origin` in `cardMotifMotion.module.css`: `x/w*100`, `y/h*100`.
 */
export const CARD_BACK_EMBLEM_CENTER = { x: 370, y: 540 } as const;

/** Center well for face overlays (740×1080). */
export const CARD_FRONT_EMBLEM_CENTER = { x: 370, y: 520 } as const;

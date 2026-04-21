/** Single source for match-score floater animation / dismiss timing (ms). */
export const MATCH_SCORE_FLOAT_MS_FULL = 780;
export const MATCH_SCORE_FLOAT_MS_REDUCED = 500;

/** Extra cushion if `animationend` never fires (devtools, odd engines). */
export const MATCH_SCORE_FLOAT_FALLBACK_MARGIN_MS = 120;

export function matchScoreFloatDurationMs(reducedMotion: boolean): number {
    return reducedMotion ? MATCH_SCORE_FLOAT_MS_REDUCED : MATCH_SCORE_FLOAT_MS_FULL;
}

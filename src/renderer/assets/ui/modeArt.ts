import modeClassicUrl from './backgrounds/bg-mode-classic-v1.png';
import modeDailyUrl from './backgrounds/bg-mode-daily-v1.png';
import modeEndlessUrl from './backgrounds/bg-mode-endless-v1.png';
import modePlaceholderUrl from './backgrounds/bg-mode-placeholder-v1.png';

/** Per-mode poster rasters for Choose Your Path (TASK-018). */
export const MODE_CARD_ART = {
    classic: modeClassicUrl,
    daily: modeDailyUrl,
    endless: modeEndlessUrl,
    gauntlet: modePlaceholderUrl,
    puzzle: modePlaceholderUrl,
    mirror_puzzle: modePlaceholderUrl,
    wild: modePlaceholderUrl,
    practice: modePlaceholderUrl,
    scholar: modePlaceholderUrl,
    pin_vow: modePlaceholderUrl,
    meditation: modePlaceholderUrl
} as const;

export type ModePosterKey = keyof typeof MODE_CARD_ART;

/** Resolve a catalog `posterKey` string to a bundled image URL (unknown keys fall back to placeholder). */
export function resolveModePosterUrl(posterKey: string): string {
    if (posterKey in MODE_CARD_ART) {
        return MODE_CARD_ART[posterKey as ModePosterKey];
    }
    return modePlaceholderUrl;
}

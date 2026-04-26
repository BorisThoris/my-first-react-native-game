import modeClassicUrl from './backgrounds/bg-mode-classic-v1.png';
import modeDailyUrl from './backgrounds/bg-mode-daily-v1.png';
import modeEndlessUrl from './backgrounds/bg-mode-endless-v1.png';
import modePlaceholderUrl from './backgrounds/bg-mode-placeholder-v1.png';

export const MODE_POSTER_FALLBACK_KEY = 'fallback' as const;

export const MODE_POSTER_FALLBACK_COPY = {
    title: 'Fallback poster',
    description: 'Intentional shared emblem treatment for modes without bespoke production art yet.'
} as const;

/** Per-mode poster rasters for Choose Your Path (TASK-018). */
export const MODE_CARD_ART = {
    classic: modeClassicUrl,
    daily: modeDailyUrl,
    endless: modeEndlessUrl,
    fallback: modePlaceholderUrl,
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

export const isModePosterFallback = (posterKey: string): boolean =>
    !(posterKey in MODE_CARD_ART) || MODE_CARD_ART[posterKey as ModePosterKey] === modePlaceholderUrl;

export const modePosterHasCustomArt = (posterKey: string): boolean => !isModePosterFallback(posterKey);

export interface ModePosterArtRow {
    key: ModePosterKey;
    assetUrl: string;
    status: 'custom' | 'fallback';
    fallbackKey: typeof MODE_POSTER_FALLBACK_KEY | null;
}

export const getModePosterArtRows = (): ModePosterArtRow[] =>
    (Object.keys(MODE_CARD_ART) as ModePosterKey[]).map((key) => ({
        assetUrl: MODE_CARD_ART[key],
        key,
        status: isModePosterFallback(key) ? 'fallback' : 'custom',
        fallbackKey: isModePosterFallback(key) && key !== MODE_POSTER_FALLBACK_KEY ? MODE_POSTER_FALLBACK_KEY : null
    }));

/** Resolve a catalog `posterKey` string to a bundled image URL (unknown keys fall back to placeholder). */
export function resolveModePosterUrl(posterKey: string): string {
    if (posterKey in MODE_CARD_ART) {
        return MODE_CARD_ART[posterKey as ModePosterKey];
    }
    return modePlaceholderUrl;
}

import modeClassicUrl from './backgrounds/bg-mode-classic-v1.png';
import modeDailyUrl from './backgrounds/bg-mode-daily-v1.png';
import modeEndlessUrl from './backgrounds/bg-mode-endless-v1.png';

/** Per-mode poster rasters for Choose Your Path (TASK-018). */
export const MODE_CARD_ART = {
    classic: modeClassicUrl,
    daily: modeDailyUrl,
    endless: modeEndlessUrl
} as const;

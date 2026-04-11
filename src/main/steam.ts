import * as steamworks from 'steamworks.js';
import type { AchievementId } from '../shared/contracts';

export interface SteamAdapter {
    isConnected(): boolean;
    unlockAchievement(achievementId: AchievementId): boolean;
}

/**
 * Steamworks `achievement.activate` expects the **API Name** from the Steamworks Partner site
 * (Stats & Achievements). These are currently identical to `AchievementId`; if Partner names differ,
 * update this map only — keep `AchievementId` / save data unchanged.
 */
const STEAM_ACHIEVEMENT_API_NAME = {
    ACH_FIRST_CLEAR: 'ACH_FIRST_CLEAR',
    ACH_LAST_LIFE: 'ACH_LAST_LIFE',
    ACH_LEVEL_FIVE: 'ACH_LEVEL_FIVE',
    ACH_PERFECT_CLEAR: 'ACH_PERFECT_CLEAR',
    ACH_SCORE_THOUSAND: 'ACH_SCORE_THOUSAND'
} as const satisfies Record<AchievementId, string>;

const createMockSteamAdapter = (): SteamAdapter => ({
    isConnected: () => false,
    unlockAchievement: () => false
});

export const createSteamAdapter = (): SteamAdapter => {
    try {
        const rawAppId = process.env.STEAM_APP_ID;
        const appId = rawAppId ? Number.parseInt(rawAppId, 10) : undefined;
        const client = Number.isFinite(appId) ? steamworks.init(appId) : steamworks.init();

        if (typeof steamworks.electronEnableSteamOverlay === 'function') {
            steamworks.electronEnableSteamOverlay();
        }

        return {
            isConnected: () => true,
            unlockAchievement: (achievementId) => {
                try {
                    const apiName = STEAM_ACHIEVEMENT_API_NAME[achievementId];
                    return client.achievement.activate(apiName);
                } catch (error) {
                    console.warn('[steam] achievement unlock failed', achievementId, error);
                    return false;
                }
            }
        };
    } catch (error) {
        console.warn('[steam] steamworks unavailable, using mock adapter', error);
        return createMockSteamAdapter();
    }
};

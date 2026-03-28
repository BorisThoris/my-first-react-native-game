import * as steamworks from 'steamworks.js';
import type { AchievementId } from '../shared/contracts';

export interface SteamAdapter {
    isConnected(): boolean;
    unlockAchievement(achievementId: AchievementId): boolean;
}

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
                    return client.achievement.activate(achievementId);
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

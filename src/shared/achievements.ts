import type { AchievementId, RunState, SaveData } from './contracts';

export interface AchievementDefinition {
    id: AchievementId;
    title: string;
    description: string;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
    {
        id: 'ACH_FIRST_CLEAR',
        title: 'First Lantern',
        description: 'Complete your first level.'
    },
    {
        id: 'ACH_LEVEL_FIVE',
        title: 'Deep Delver',
        description: 'Reach level five in a single run.'
    },
    {
        id: 'ACH_SCORE_THOUSAND',
        title: 'Gold Mind',
        description: 'Score 1000 total points in one run.'
    },
    {
        id: 'ACH_PERFECT_CLEAR',
        title: 'Perfect Memory',
        description: 'Clear a level with an S++ rating.'
    },
    {
        id: 'ACH_LAST_LIFE',
        title: 'One Heart Wonder',
        description: 'Finish a level with exactly one life remaining.'
    }
];

export const evaluateAchievementUnlocks = (run: RunState, saveData: SaveData): AchievementId[] => {
    if (!run.achievementsEnabled) {
        return [];
    }

    const unlocked: AchievementId[] = [];

    if (run.stats.levelsCleared >= 1 && !saveData.achievements.ACH_FIRST_CLEAR) {
        unlocked.push('ACH_FIRST_CLEAR');
    }

    if (run.stats.highestLevel >= 5 && !saveData.achievements.ACH_LEVEL_FIVE) {
        unlocked.push('ACH_LEVEL_FIVE');
    }

    if (run.stats.totalScore >= 1000 && !saveData.achievements.ACH_SCORE_THOUSAND) {
        unlocked.push('ACH_SCORE_THOUSAND');
    }

    if (
        run.lastLevelResult?.perfect &&
        !saveData.achievements.ACH_PERFECT_CLEAR &&
        !run.powersUsedThisRun
    ) {
        unlocked.push('ACH_PERFECT_CLEAR');
    }

    if (run.lastLevelResult?.livesRemaining === 1 && !saveData.achievements.ACH_LAST_LIFE) {
        unlocked.push('ACH_LAST_LIFE');
    }

    return unlocked;
};

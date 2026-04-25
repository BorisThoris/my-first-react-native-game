import {
    INITIAL_LIVES,
    MAX_LIVES,
    MEMORIZE_BASE_MS,
    MEMORIZE_DECAY_EVERY_N_LEVELS,
    MEMORIZE_MIN_MS,
    MEMORIZE_STEP_MS
} from './contracts';

export type DifficultyProfileId = 'shipped_fair';
export type DifficultyProfileAvailability = 'active_default' | 'future_placeholder';
export type DifficultyProfileRowStatus = 'shipped' | 'deferred';

export interface DifficultyProfileRuleSummary {
    id: DifficultyProfileId;
    label: string;
    availability: DifficultyProfileAvailability;
    achievementEligible: true;
    dailyComparable: true;
    memorizeCurve: {
        baseMs: number;
        stepMs: number;
        minMs: number;
        decayEveryNLevels: number;
    };
    lives: {
        initial: number;
        max: number;
    };
    forgiveness: {
        firstMismatchFreePerFloor: true;
        cleanClearLifeThresholdMistakes: number;
        guardTokensFromStreak: true;
        comboShardsConvertToLife: true;
    };
    playerCopy: string;
}

export const SHIPPED_FAIR_DIFFICULTY_PROFILE: DifficultyProfileRuleSummary = {
    id: 'shipped_fair',
    label: 'Standard',
    availability: 'active_default',
    achievementEligible: true,
    dailyComparable: true,
    memorizeCurve: {
        baseMs: MEMORIZE_BASE_MS,
        stepMs: MEMORIZE_STEP_MS,
        minMs: MEMORIZE_MIN_MS,
        decayEveryNLevels: MEMORIZE_DECAY_EVERY_N_LEVELS
    },
    lives: {
        initial: INITIAL_LIVES,
        max: MAX_LIVES
    },
    forgiveness: {
        firstMismatchFreePerFloor: true,
        cleanClearLifeThresholdMistakes: 1,
        guardTokensFromStreak: true,
        comboShardsConvertToLife: true
    },
    playerCopy:
        'Default: one free mismatch per floor, clean clears can restore a life, and streaks build guards/shards. No selectable difficulty profile changes rules yet.'
} as const;

export const listDifficultyProfiles = (): DifficultyProfileRuleSummary[] => [
    SHIPPED_FAIR_DIFFICULTY_PROFILE
];

export const getDefaultDifficultyProfile = (): DifficultyProfileRuleSummary => SHIPPED_FAIR_DIFFICULTY_PROFILE;

export interface DifficultyProfileRow {
    id: 'classic_fair' | 'practice_soft' | 'purist_hard';
    label: string;
    status: DifficultyProfileRowStatus;
    dailyComparable: boolean;
    constants: {
        initialLives: number;
        maxLives: number;
        memorizeBaseMs: number;
        memorizeStepMs: number;
        memorizeMinMs: number;
    };
    rules: string;
}

const currentConstants = {
    initialLives: INITIAL_LIVES,
    maxLives: MAX_LIVES,
    memorizeBaseMs: MEMORIZE_BASE_MS,
    memorizeStepMs: MEMORIZE_STEP_MS,
    memorizeMinMs: MEMORIZE_MIN_MS
};

export const getCurrentDifficultyProfile = (): DifficultyProfileRow => ({
    id: 'classic_fair',
    label: 'Classic fair',
    status: 'shipped',
    dailyComparable: true,
    constants: currentConstants,
    rules: 'first mismatch each floor is life-free; clean clears can restore a life; streaks grant guards and shards'
});

export const getDifficultyProfileRows = (): DifficultyProfileRow[] => [
    getCurrentDifficultyProfile(),
    {
        id: 'practice_soft',
        label: 'Practice soft',
        status: 'deferred',
        dailyComparable: false,
        constants: currentConstants,
        rules: 'future accessibility profile; deferred until settings/save schema owns rule variants'
    },
    {
        id: 'purist_hard',
        label: 'Purist hard',
        status: 'deferred',
        dailyComparable: false,
        constants: currentConstants,
        rules: 'future challenge profile; deferred so achievements/dailies remain comparable'
    }
];


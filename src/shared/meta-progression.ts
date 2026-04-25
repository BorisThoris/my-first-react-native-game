import type { SaveData } from './contracts';
import { COSMETIC_CATALOG, cosmeticIsOwned, cosmeticUnlockTag, type CosmeticId } from './cosmetics';

export type MetaProgressionTrack = 'permanent_upgrade' | 'cosmetic';
export type MetaProgressionStatus = 'owned' | 'available' | 'locked';
export type LegacyMetaProgressionStatus = 'unlocked' | 'in_progress' | 'locked' | 'owned';
export type MetaCurrencyId = 'honor_marks';
export type MetaUpgradeModeRule = 'disabled_in_daily' | 'visible_in_classic' | 'cosmetic_only';

export interface MetaProgressionRow {
    id: string;
    track: MetaProgressionTrack;
    title: string;
    description: string;
    status: MetaProgressionStatus;
    progress: { current: number; target: number };
    reward: string;
    currencyId: MetaCurrencyId;
    cost: number;
    gameplayAffecting: boolean;
    localOnly: true;
    unlockTag?: string;
    gate: string;
    source: string;
    modeRule: MetaUpgradeModeRule;
}

export interface PermanentUpgradeRow {
    id: 'relic_shrine_extra_pick' | 'ascendant_title_track' | 'daily_cosmetic_track';
    title: string;
    status: LegacyMetaProgressionStatus;
    offlineOnly: true;
    payToSkip: false;
    progress: { current: number; target: number };
    reward: string;
}

export interface CosmeticTrackRow {
    trackId: 'starter' | 'daily' | 'mastery' | 'relic';
    cosmeticId: CosmeticId;
    label: string;
    status: LegacyMetaProgressionStatus;
    owned: number;
    progress: { current: number; target: number };
    gameplayAffecting: false;
}

export interface MetaProgressionSummary {
    honorMarks: number;
    owned: number;
    available: number;
    locked: number;
    gameplayUpgradesOwned: number;
    cosmeticOwned: number;
}

export interface MetaProgressionBoard {
    level: number;
    levelProgress: { current: number; target: number };
    nextReward: MetaProgressionRow | null;
    longTermGoal: MetaProgressionRow | null;
    rows: MetaProgressionRow[];
    summary: MetaProgressionSummary;
}

const totalRelicPicks = (save: SaveData): number =>
    Object.values(save.playerStats?.relicPickCounts ?? {}).reduce((sum, count) => sum + (count ?? 0), 0);

export const getMetaHonorMarks = (save: SaveData): number => {
    const achievements = Object.values(save.achievements).filter(Boolean).length;
    const dailies = Math.min(7, save.playerStats?.dailiesCompleted ?? 0);
    const noPowers = Math.min(5, save.playerStats?.bestFloorNoPowers ?? 0);
    const relics = Math.min(10, totalRelicPicks(save));
    return achievements * 2 + dailies + noPowers + Math.floor(relics / 2);
};

const statusForProgress = (current: number, target: number, owned: boolean): MetaProgressionStatus => {
    if (owned) {
        return 'owned';
    }
    return current >= target ? 'available' : 'locked';
};

export const getPermanentUpgradeRows = (save: SaveData): MetaProgressionRow[] => {
    const dailies = save.playerStats?.dailiesCompleted ?? 0;
    const bestNoPowers = save.playerStats?.bestFloorNoPowers ?? 0;
    return [
        {
            id: 'upgrade_relic_shrine_extra_pick',
            track: 'permanent_upgrade',
            title: 'Week of Archives',
            description: 'Permanent local upgrade: +1 relic selection at each milestone shrine.',
            status: statusForProgress(dailies, 7, save.playerStats?.relicShrineExtraPickUnlocked === true),
            progress: { current: Math.min(dailies, 7), target: 7 },
            reward: '+1 relic pick per milestone',
            currencyId: 'honor_marks',
            cost: 7,
            gameplayAffecting: true,
            localOnly: true,
            gate: 'Clear seven Daily Challenge floors. No online account required.',
            source: 'Daily archive completions',
            modeRule: 'disabled_in_daily'
        },
        {
            id: 'upgrade_scholar_prep_slot',
            track: 'permanent_upgrade',
            title: 'Scholar Prep Slot',
            description: 'Future permanent upgrade slot; documented but not purchasable in v1.',
            status: statusForProgress(bestNoPowers, 8, false),
            progress: { current: Math.min(bestNoPowers, 8), target: 8 },
            reward: 'Future pre-run assist slot',
            currencyId: 'honor_marks',
            cost: 12,
            gameplayAffecting: true,
            localOnly: true,
            gate: 'Deferred: requires REG-016 feature flag and balance pass before enabling.',
            source: 'No-powers mastery',
            modeRule: 'visible_in_classic'
        }
    ];
};

export const getMetaCosmeticTrackRows = (save: SaveData): MetaProgressionRow[] =>
    (Object.values(COSMETIC_CATALOG) as Array<(typeof COSMETIC_CATALOG)[CosmeticId]>)
        .filter((cosmetic) => cosmetic.defaultOwned !== true)
        .map((cosmetic) => ({
            id: `cosmetic_track_${cosmetic.id}`,
            track: 'cosmetic',
            title: cosmetic.label,
            description: cosmetic.description,
            status: cosmeticIsOwned(save, cosmetic.id) ? 'owned' : 'locked',
            progress: { current: cosmeticIsOwned(save, cosmetic.id) ? 1 : 0, target: 1 },
            reward: cosmetic.slot,
            currencyId: 'honor_marks',
            cost: 0,
            gameplayAffecting: false,
            localOnly: true,
            unlockTag: cosmeticUnlockTag(cosmetic.id),
            gate: cosmetic.unlockSource,
            source: cosmetic.unlockSource,
            modeRule: 'cosmetic_only'
        }));

export const getMetaProgressionRows = (save: SaveData): MetaProgressionRow[] => [
    ...getPermanentUpgradeRows(save),
    ...getMetaCosmeticTrackRows(save)
];

export const getMetaProgressionSummary = (
    save: SaveData
): { honorMarks: number; owned: number; available: number; locked: number; gameplayUpgradesOwned: number; cosmeticOwned: number } => {
    const rows = getMetaProgressionRows(save);
    return {
        honorMarks: getMetaHonorMarks(save),
        owned: rows.filter((row) => row.status === 'owned').length,
        available: rows.filter((row) => row.status === 'available').length,
        locked: rows.filter((row) => row.status === 'locked').length,
        gameplayUpgradesOwned: rows.filter((row) => row.track === 'permanent_upgrade' && row.status === 'owned').length,
        cosmeticOwned: rows.filter((row) => row.track === 'cosmetic' && row.status === 'owned').length
    };
};

export const getMetaProgressionBoard = (save: SaveData): MetaProgressionBoard => {
    const rows = getMetaProgressionRows(save);
    const summary = getMetaProgressionSummary(save);
    const honorMarks = summary.honorMarks;
    const nextReward =
        rows.find((row) => row.status === 'available') ??
        rows.find((row) => row.status === 'locked' && row.progress.current > 0) ??
        rows.find((row) => row.status === 'locked') ??
        null;
    const longTermGoal =
        rows.find((row) => row.id === 'upgrade_scholar_prep_slot') ??
        rows.find((row) => row.status !== 'owned') ??
        null;

    return {
        level: Math.max(1, Math.floor(honorMarks / 5) + 1),
        levelProgress: { current: honorMarks % 5, target: 5 },
        nextReward,
        longTermGoal,
        rows,
        summary
    };
};

const legacyStatus = (owned: boolean, current: number, target: number): LegacyMetaProgressionStatus =>
    owned ? 'owned' : current > 0 || current >= target ? 'in_progress' : 'locked';

export const buildPermanentUpgradeRows = (save: SaveData): PermanentUpgradeRow[] => {
    const dailies = save.playerStats?.dailiesCompleted ?? 0;
    const noPowers = save.playerStats?.bestFloorNoPowers ?? 0;
    return [
        {
            id: 'relic_shrine_extra_pick',
            title: 'Week of Archives',
            status: save.playerStats?.relicShrineExtraPickUnlocked || dailies >= 7 ? 'unlocked' : dailies > 0 ? 'in_progress' : 'locked',
            offlineOnly: true,
            payToSkip: false,
            progress: { current: Math.min(dailies, 7), target: 7 },
            reward: '+1 relic selection at milestones'
        },
        {
            id: 'ascendant_title_track',
            title: 'Ascendant title track',
            status: noPowers >= 5 ? 'unlocked' : noPowers > 0 ? 'in_progress' : 'locked',
            offlineOnly: true,
            payToSkip: false,
            progress: { current: Math.min(noPowers, 5), target: 5 },
            reward: 'Ascendant title cosmetics'
        },
        {
            id: 'daily_cosmetic_track',
            title: 'Daily cosmetic track',
            status: dailies >= 3 ? 'unlocked' : dailies > 0 ? 'in_progress' : 'locked',
            offlineOnly: true,
            payToSkip: false,
            progress: { current: Math.min(dailies, 3), target: 3 },
            reward: 'Daily crest cosmetics'
        }
    ];
};

export const getCosmeticTrackRows = (save: SaveData): CosmeticTrackRow[] => [
    {
        trackId: 'starter',
        cosmeticId: 'title_seeker',
        label: COSMETIC_CATALOG.title_seeker.label,
        status: 'owned',
        owned: 1,
        progress: { current: 1, target: 1 },
        gameplayAffecting: false
    },
    {
        trackId: 'daily',
        cosmeticId: 'crest_daily_bronze',
        label: COSMETIC_CATALOG.crest_daily_bronze.label,
        status: legacyStatus(cosmeticIsOwned(save, 'crest_daily_bronze'), save.playerStats?.dailiesCompleted ?? 0, 3),
        owned: cosmeticIsOwned(save, 'crest_daily_bronze') ? 1 : 0,
        progress: { current: Math.min(save.playerStats?.dailiesCompleted ?? 0, 3), target: 3 },
        gameplayAffecting: false
    },
    {
        trackId: 'mastery',
        cosmeticId: 'title_ascendant_v',
        label: COSMETIC_CATALOG.title_ascendant_v.label,
        status: legacyStatus(cosmeticIsOwned(save, 'title_ascendant_v'), save.playerStats?.bestFloorNoPowers ?? 0, 5),
        owned: cosmeticIsOwned(save, 'title_ascendant_v') ? 1 : 0,
        progress: { current: Math.min(save.playerStats?.bestFloorNoPowers ?? 0, 5), target: 5 },
        gameplayAffecting: false
    },
    {
        trackId: 'relic',
        cosmeticId: 'card_back_relic_gold',
        label: COSMETIC_CATALOG.card_back_relic_gold.label,
        status: legacyStatus(cosmeticIsOwned(save, 'card_back_relic_gold'), totalRelicPicks(save), 10),
        owned: cosmeticIsOwned(save, 'card_back_relic_gold') ? 1 : 0,
        progress: { current: Math.min(totalRelicPicks(save), 10), target: 10 },
        gameplayAffecting: false
    }
];

export const metaProgressionSummary = (save: SaveData): {
    upgradesUnlocked: number;
    cosmeticTrackOwned: number;
} => ({
    upgradesUnlocked: buildPermanentUpgradeRows(save).filter((row) => row.status === 'unlocked').length,
    cosmeticTrackOwned: getCosmeticTrackRows(save).length
});

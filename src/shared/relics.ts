/**
 * Relic **pool and milestone selection** (`RELIC_POOL`, `rollRelicOptions`, `needsRelicPick`).
 * Draft uses **rarity + weights** (`RELIC_DRAFT`) and in-repo {@link pickWeightedWithoutReplacement}.
 * Per-relic gameplay lives in `game.ts` (`applyRelicImmediate`, memorize duration, shuffle/destroy economy, parasite ward, etc.).
 *
 * Balance cross-check: `docs/BALANCE_NOTES.md` (Relic roster) — update when adding IDs or changing memorize /
 * charge numbers; `relicBalanceDoc.test.ts` guards key doc strings.
 */
import { hashStringToSeed } from './rng';
import type { RelicId, RunState } from './contracts';
import { pickWeightedWithoutReplacement } from './weightedPick';

/** First floor (after clear) that can trigger a relic offer. */
export const RELIC_FIRST_MILESTONE_FLOOR = 3;
/** Offer again every N floors: 3, 6, 9, 12, … */
export const RELIC_MILESTONE_STEP = 3;
/** Cap total relic picks per run (Endless scaling safety). */
export const MAX_RELIC_PICKS_PER_RUN = 12;

/** Draft rarity — affects base weight and how fast odds rise with {@link relicMilestoneIndexForFloor}. */
export type RelicDraftRarity = 'common' | 'uncommon' | 'rare';

export interface RelicDraftRow {
    rarity: RelicDraftRarity;
    /** Base weight before tier scaling (tune relative odds at tier 0). */
    weight: number;
}

/**
 * Single source for draft odds. Add new `RelicId` here and in `game.ts` / encyclopedia.
 * Weights are relative within a draft; tier scaling favors higher rarities in later drafts.
 */
export const RELIC_DRAFT: Record<RelicId, RelicDraftRow> = {
    extra_shuffle_charge: { rarity: 'common', weight: 100 },
    first_shuffle_free_per_floor: { rarity: 'common', weight: 88 },
    memorize_bonus_ms: { rarity: 'common', weight: 92 },
    memorize_under_short_memorize: { rarity: 'uncommon', weight: 52 },
    region_shuffle_free_first: { rarity: 'common', weight: 85 },
    destroy_bank_plus_one: { rarity: 'uncommon', weight: 55 },
    combo_shard_plus_step: { rarity: 'uncommon', weight: 48 },
    parasite_ward_once: { rarity: 'rare', weight: 28 },
    peek_charge_plus_one: { rarity: 'uncommon', weight: 50 },
    stray_charge_plus_one: { rarity: 'rare', weight: 26 },
    pin_cap_plus_one: { rarity: 'rare', weight: 24 },
    guard_token_plus_one: { rarity: 'rare', weight: 30 },
    shrine_echo: { rarity: 'uncommon', weight: 36 }
};

/** Stable iteration order for docs / balance checks. */
export const RELIC_POOL: RelicId[] = (Object.keys(RELIC_DRAFT) as RelicId[]).sort((a, b) => a.localeCompare(b));

const tierWeightScale = (rarity: RelicDraftRarity, tierIndex: number): number => {
    const t = Math.max(0, tierIndex);
    switch (rarity) {
        case 'common':
            return 1;
        case 'uncommon':
            return 1 + t * 0.14;
        case 'rare':
            return 1 + t * 0.32;
        default:
            return 1;
    }
};

/** Effective draft weight for one relic at a milestone tier (higher tier → relatively stronger rares). */
export const effectiveRelicDraftWeight = (id: RelicId, tierIndex: number): number => {
    const row = RELIC_DRAFT[id];
    return row.weight * tierWeightScale(row.rarity, tierIndex);
};

export const getRelicDraftRow = (id: RelicId): RelicDraftRow => RELIC_DRAFT[id];

export const relicDraftRarityLabel = (rarity: RelicDraftRarity): string => {
    switch (rarity) {
        case 'common':
            return 'Common';
        case 'uncommon':
            return 'Uncommon';
        case 'rare':
            return 'Rare';
        default:
            return rarity;
    }
};

/** @deprecated Older comfort/power split; draft uses {@link RELIC_DRAFT} rarities. */
export const RELIC_POOL_COMFORT: RelicId[] = RELIC_POOL.filter((id) => RELIC_DRAFT[id].rarity === 'common');

/** @deprecated Older comfort/power split; draft uses {@link RELIC_DRAFT} rarities. */
export const RELIC_POOL_POWER: RelicId[] = RELIC_POOL.filter((id) => RELIC_DRAFT[id].rarity !== 'common');

/**
 * Milestone index for a cleared floor (0 = first offer at floor 3), or null if not a milestone floor.
 */
export const relicMilestoneIndexForFloor = (clearedLevel: number): number | null => {
    if (clearedLevel < RELIC_FIRST_MILESTONE_FLOOR) {
        return null;
    }
    const delta = clearedLevel - RELIC_FIRST_MILESTONE_FLOOR;
    if (delta % RELIC_MILESTONE_STEP !== 0) {
        return null;
    }
    return delta / RELIC_MILESTONE_STEP;
};

/** @deprecated Use RELIC_FIRST_MILESTONE_FLOOR + RELIC_MILESTONE_STEP; kept for docs/tests sampling first three offers. */
export const RELIC_MILESTONE_FLOORS = [
    RELIC_FIRST_MILESTONE_FLOOR,
    RELIC_FIRST_MILESTONE_FLOOR + RELIC_MILESTONE_STEP,
    RELIC_FIRST_MILESTONE_FLOOR + RELIC_MILESTONE_STEP * 2
] as const;

const makeRng = (seed: number): (() => number) => {
    let s = seed >>> 0;
    return () => {
        s += 0x6d2b79f5;
        let x = s;
        x = Math.imul(x ^ (x >>> 15), x | 1);
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
};

export const needsRelicPick = (run: RunState): boolean => {
    if (run.gameMode === 'puzzle') {
        return false;
    }
    if (run.relicTiersClaimed >= MAX_RELIC_PICKS_PER_RUN) {
        return false;
    }
    if (run.status !== 'levelComplete' || !run.lastLevelResult) {
        return false;
    }
    const cleared = run.lastLevelResult.level;
    const idx = relicMilestoneIndexForFloor(cleared);
    if (idx === null) {
        return false;
    }
    return run.relicTiersClaimed <= idx && !run.relicOffer;
};

const DRAFT_OPTION_COUNT = 3;

/**
 * @param clearedFloor — level just cleared; included in RNG seed for stable options per floor.
 * @param pickRound — increments within one milestone visit when the player takes multiple relics (reroll trio).
 */
export const rollRelicOptions = (
    run: RunState,
    tierIndex: number,
    clearedFloor: number,
    pickRound: number = 0
): RelicId[] => {
    const available = RELIC_POOL.filter((r) => !run.relicIds.includes(r));
    if (available.length <= DRAFT_OPTION_COUNT) {
        return available.slice(0, DRAFT_OPTION_COUNT);
    }

    const seed = hashStringToSeed(`relic:${run.runSeed}:${tierIndex}:${clearedFloor}:${pickRound}`);
    const rng = makeRng(seed);

    const weighted = available.map((id) => ({
        value: id,
        weight: effectiveRelicDraftWeight(id, tierIndex)
    }));

    return pickWeightedWithoutReplacement(rng, weighted, DRAFT_OPTION_COUNT);
};

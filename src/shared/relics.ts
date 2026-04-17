/**
 * Relic **pool and milestone selection** (`RELIC_POOL`, `rollRelicOptions`, `needsRelicPick`).
 * Per-relic gameplay lives in `game.ts` (`applyRelicImmediate`, memorize duration, shuffle/destroy economy, parasite ward, etc.).
 *
 * Balance cross-check: `docs/BALANCE_NOTES.md` (Relic roster) — update when adding IDs or changing memorize /
 * charge numbers; `relicBalanceDoc.test.ts` guards key doc strings.
 */
import { hashStringToSeed } from './rng';
import type { RelicId, RunState } from './contracts';

export const RELIC_POOL: RelicId[] = [
    'extra_shuffle_charge',
    'first_shuffle_free_per_floor',
    'memorize_bonus_ms',
    'destroy_bank_plus_one',
    'combo_shard_plus_step',
    'memorize_under_short_memorize',
    'parasite_ward_once',
    'region_shuffle_free_first'
];

export const RELIC_MILESTONE_FLOORS = [3, 6, 9] as const;

export const needsRelicPick = (run: RunState): boolean => {
    if (run.status !== 'levelComplete' || !run.lastLevelResult) {
        return false;
    }
    const cleared = run.lastLevelResult.level;
    const idx = RELIC_MILESTONE_FLOORS.indexOf(cleared as (typeof RELIC_MILESTONE_FLOORS)[number]);
    if (idx < 0) {
        return false;
    }
    return run.relicTiersClaimed <= idx && !run.relicOffer;
};

export const rollRelicOptions = (run: RunState, tierIndex: number): RelicId[] => {
    const pool = RELIC_POOL.filter((r) => !run.relicIds.includes(r));
    if (pool.length <= 3) {
        return pool.slice(0, 3);
    }
    const seed = hashStringToSeed(`relic:${run.runSeed}:${tierIndex}`);
    const rng = ((): (() => number) => {
        let s = seed >>> 0;
        return () => {
            s += 0x6d2b79f5;
            let x = s;
            x = Math.imul(x ^ (x >>> 15), x | 1);
            x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
            return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
        };
    })();
    const copy = [...pool];
    const picked: RelicId[] = [];
    for (let i = 0; i < 3 && copy.length > 0; i += 1) {
        const j = Math.floor(rng() * copy.length);
        picked.push(copy[j]!);
        copy.splice(j, 1);
    }
    return picked;
};

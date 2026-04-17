import type { FloorTag, GameMode, MutatorId } from './contracts';
import { createMulberry32, hashStringToSeed } from './rng';

/**
 * Rules version that introduced per-floor endless mutators (keep in sync with contracts bump).
 *
 * **Bump checklist (do all before merging):**
 * 1. Increment this constant; note `GAME_RULES_VERSION` / save compatibility if players see different floors.
 * 2. Extend `floor-mutator-schedule.test.ts` for new cycle entries (ref: docs/refinement-tasks REF-003).
 * 3. Cross-link: [GAMEPLAY_POLISH_AND_GAPS.md](../../docs/gameplay/GAMEPLAY_POLISH_AND_GAPS.md), internal wiki
 *    [SOURCE_MAP.md](../../docs/internal-wiki/SOURCE_MAP.md) if schedule behavior is summarized there.
 * 4. Player-facing changelog: mention whether endless uses the scripted floor schedule (`usesEndlessFloorSchedule`).
 */
export const FLOOR_SCHEDULE_RULES_VERSION = 2;

/**
 * One entry per step in the endless cycle (level 1 = index 0).
 * `wide_recall`, `silhouette_twist`, and `distraction_channel` pair with renderer styling and flat per-match penalties in `game.ts` (rules v6+).
 */
const ENDLESS_FLOOR_CYCLE: { mutators: MutatorId[]; floorTag: FloorTag }[] = [
    { mutators: ['wide_recall'], floorTag: 'normal' },
    { mutators: ['short_memorize'], floorTag: 'normal' },
    { mutators: [], floorTag: 'breather' },
    { mutators: ['silhouette_twist'], floorTag: 'normal' },
    { mutators: ['n_back_anchor'], floorTag: 'normal' },
    { mutators: [], floorTag: 'breather' },
    { mutators: ['glass_floor', 'sticky_fingers'], floorTag: 'boss' },
    { mutators: ['category_letters'], floorTag: 'normal' },
    { mutators: ['short_memorize', 'wide_recall'], floorTag: 'boss' },
    { mutators: [], floorTag: 'breather' },
    { mutators: ['score_parasite'], floorTag: 'normal' },
    { mutators: ['sticky_fingers'], floorTag: 'normal' }
];

/**
 * Deterministic mutators + pacing tag for endless (rules v2+).
 * Other modes: returns empty mutators; caller keeps run mutators.
 */
export const pickFloorScheduleEntry = (
    runSeed: number,
    rulesVersion: number,
    level: number,
    gameMode: GameMode
): { mutators: MutatorId[]; floorTag: FloorTag } => {
    if (gameMode !== 'endless' || rulesVersion < FLOOR_SCHEDULE_RULES_VERSION) {
        return { mutators: [], floorTag: 'normal' };
    }
    const idx = Math.max(0, level - 1) % ENDLESS_FLOOR_CYCLE.length;
    const base = ENDLESS_FLOOR_CYCLE[idx]!;
    const rng = createMulberry32(hashStringToSeed(`floorSchedule:${rulesVersion}:${runSeed}:${level}`));
    /** Optional micro-variation: swap in distraction_channel on ~1/4 boss floors (seeded). */
    if (base.floorTag === 'boss' && rng() < 0.25) {
        const m = [...base.mutators];
        if (!m.includes('distraction_channel') && m.length < 3) {
            return { mutators: [...m, 'distraction_channel'], floorTag: 'boss' };
        }
    }
    return { mutators: [...base.mutators], floorTag: base.floorTag };
};

export const usesEndlessFloorSchedule = (gameMode: GameMode, rulesVersion: number): boolean =>
    gameMode === 'endless' && rulesVersion >= FLOOR_SCHEDULE_RULES_VERSION;

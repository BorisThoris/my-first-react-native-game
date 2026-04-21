import type {
    FeaturedObjectiveId,
    FloorArchetypeId,
    FloorTag,
    GameMode,
    MutatorId
} from './contracts';
import { createMulberry32, hashStringToSeed } from './rng';

/**
 * Rules version that introduced authored endless chapters with featured objectives.
 *
 * **Bump checklist (do all before merging):**
 * 1. Increment this constant; note `GAME_RULES_VERSION` / save compatibility if players see different floors.
 * 2. Extend `floor-mutator-schedule.test.ts` for new cycle entries (ref: docs/refinement-tasks REF-003).
 * 3. Cross-link: [GAMEPLAY_POLISH_AND_GAPS.md](../../docs/gameplay/GAMEPLAY_POLISH_AND_GAPS.md), internal wiki
 *    [SOURCE_MAP.md](../../docs/internal-wiki/SOURCE_MAP.md) if schedule behavior is summarized there.
 * 4. Player-facing changelog: mention whether endless uses the scripted floor schedule (`usesEndlessFloorSchedule`).
 */
export const FLOOR_SCHEDULE_RULES_VERSION = 3;

export interface FloorArchetypeDefinition {
    title: string;
    hint: string;
}

export const FLOOR_ARCHETYPE_CATALOG: Record<FloorArchetypeId, FloorArchetypeDefinition> = {
    survey_hall: {
        title: 'Survey Hall',
        hint: 'Read the board fast and stay on flip par.'
    },
    speed_trial: {
        title: 'Speed Trial',
        hint: 'The study window is short. Clear with confidence.'
    },
    treasure_gallery: {
        title: 'Treasure Gallery',
        hint: 'Pickup pairs are dense here. Clean play keeps Scholar style alive.'
    },
    shadow_read: {
        title: 'Shadow Read',
        hint: 'Silhouettes hide detail. Leave the cursed pair for last.'
    },
    anchor_chain: {
        title: 'Anchor Chain',
        hint: 'Track the anchor cadence and preserve the cursed-last line.'
    },
    trap_hall: {
        title: 'Trap Hall',
        hint: 'A glass decoy stalks the board. Keep it out of every miss.'
    },
    script_room: {
        title: 'Script Room',
        hint: 'Letters replace the usual read. Finish within par.'
    },
    rush_recall: {
        title: 'Rush Recall',
        hint: 'Short study and wide recall collide. Boss floors reward sharp clears.'
    },
    parasite_tithe: {
        title: 'Parasite Tithe',
        hint: 'The parasite taxes slow descents. Play clean and bank favor.'
    },
    spotlight_hunt: {
        title: 'Spotlight Hunt',
        hint: 'Ward and bounty drift after every turn. Save the cursed pair for last.'
    },
    breather: {
        title: 'Breather',
        hint: 'A calmer floor to steady the board and bank favor.'
    }
};

export const FEATURED_OBJECTIVE_LABELS: Record<FeaturedObjectiveId, string> = {
    scholar_style: 'Scholar style',
    glass_witness: 'Glass witness',
    cursed_last: 'Cursed last',
    flip_par: 'Flip par'
};

export interface FloorScheduleEntry {
    mutators: MutatorId[];
    floorTag: FloorTag;
    floorArchetypeId: FloorArchetypeId | null;
    featuredObjectiveId: FeaturedObjectiveId | null;
    title: string | null;
    hint: string | null;
}

const EMPTY_FLOOR_SCHEDULE_ENTRY: FloorScheduleEntry = {
    mutators: [],
    floorTag: 'normal',
    floorArchetypeId: null,
    featuredObjectiveId: null,
    title: null,
    hint: null
};

const makeEntry = (
    floorArchetypeId: FloorArchetypeId,
    featuredObjectiveId: FeaturedObjectiveId,
    mutators: MutatorId[],
    floorTag: FloorTag
): FloorScheduleEntry => {
    const archetype = FLOOR_ARCHETYPE_CATALOG[floorArchetypeId];
    return {
        mutators,
        floorTag,
        floorArchetypeId,
        featuredObjectiveId,
        title: archetype.title,
        hint: archetype.hint
    };
};

/**
 * One authored chapter per step in the endless cycle (level 1 = index 0).
 * `wide_recall`, `silhouette_twist`, and `distraction_channel` pair with renderer styling and flat per-match penalties in `game.ts`.
 */
const ENDLESS_FLOOR_CYCLE: FloorScheduleEntry[] = [
    makeEntry('survey_hall', 'flip_par', ['wide_recall'], 'normal'),
    makeEntry('speed_trial', 'flip_par', ['short_memorize'], 'normal'),
    makeEntry('treasure_gallery', 'scholar_style', ['findables_floor'], 'breather'),
    makeEntry('shadow_read', 'cursed_last', ['silhouette_twist'], 'normal'),
    makeEntry('anchor_chain', 'cursed_last', ['n_back_anchor'], 'normal'),
    makeEntry('breather', 'scholar_style', [], 'breather'),
    makeEntry('trap_hall', 'glass_witness', ['glass_floor', 'sticky_fingers'], 'boss'),
    makeEntry('script_room', 'flip_par', ['category_letters'], 'normal'),
    makeEntry('rush_recall', 'flip_par', ['short_memorize', 'wide_recall'], 'boss'),
    makeEntry('treasure_gallery', 'scholar_style', ['findables_floor'], 'breather'),
    makeEntry('parasite_tithe', 'scholar_style', ['score_parasite'], 'normal'),
    makeEntry('spotlight_hunt', 'cursed_last', ['shifting_spotlight'], 'normal')
];

export const getFloorArchetypeDefinition = (
    id: FloorArchetypeId | null
): FloorArchetypeDefinition | null => (id ? FLOOR_ARCHETYPE_CATALOG[id] : null);

export const getFeaturedObjectiveLabel = (id: FeaturedObjectiveId | null): string | null =>
    id ? FEATURED_OBJECTIVE_LABELS[id] : null;

/**
 * Deterministic mutators + pacing tag for endless (rules v3+).
 * Other modes: returns empty mutators; caller keeps run mutators.
 */
export const pickFloorScheduleEntry = (
    runSeed: number,
    rulesVersion: number,
    level: number,
    gameMode: GameMode
): FloorScheduleEntry => {
    if (gameMode !== 'endless' || rulesVersion < FLOOR_SCHEDULE_RULES_VERSION) {
        return EMPTY_FLOOR_SCHEDULE_ENTRY;
    }
    const idx = Math.max(0, level - 1) % ENDLESS_FLOOR_CYCLE.length;
    const base = ENDLESS_FLOOR_CYCLE[idx]!;
    const rng = createMulberry32(hashStringToSeed(`floorSchedule:${rulesVersion}:${runSeed}:${level}`));
    /** Optional micro-variation: swap in distraction_channel on ~1/4 boss floors (seeded). */
    if (base.floorTag === 'boss' && rng() < 0.25) {
        const mutators = [...base.mutators];
        if (!mutators.includes('distraction_channel') && mutators.length < 3) {
            return { ...base, mutators: [...mutators, 'distraction_channel'] };
        }
    }
    return { ...base, mutators: [...base.mutators] };
};

export const usesEndlessFloorSchedule = (gameMode: GameMode, rulesVersion: number): boolean =>
    gameMode === 'endless' && rulesVersion >= FLOOR_SCHEDULE_RULES_VERSION;

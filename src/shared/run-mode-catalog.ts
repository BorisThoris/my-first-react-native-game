/**
 * Product-facing run mode catalog for Choose Your Path (ordered, stable ids).
 * Kept separate from `GameMode` in contracts — entries may share an underlying mode with flags.
 */

export type RunModeGroup = 'core' | 'time_attack' | 'puzzle' | 'training';

export type RunModeAvailability = 'available' | 'locked' | 'disabled';

/** Discriminated actions — no store imports; renderer maps these to `useAppStore` methods. */
export type PuzzleRunModeId = 'starter_pairs' | 'mirror_craft' | 'glyph_cross';

export type RunModeAction =
    | { type: 'startRun' }
    | { type: 'startDailyRun' }
    | { type: 'locked' }
    | {
          type: 'gauntlet';
          presets: ReadonlyArray<{ label: string; durationMs: number }>;
      }
    | { type: 'puzzle'; puzzleId: PuzzleRunModeId }
    | { type: 'startWildRun' }
    | { type: 'startPracticeRun' }
    | { type: 'startScholarContractRun' }
    | { type: 'startPinVowRun' }
    | { type: 'meditationSetup' };

export interface RunModeDefinition {
    id: string;
    title: string;
    shortDescription: string;
    /** Extra availability/rules detail for locked or staged modes. */
    availabilityDetail?: string;
    group: RunModeGroup;
    availability: RunModeAvailability;
    /** Key into mode poster map (`modeArt.ts`). */
    posterKey: string;
    /** Optional stable selector for automation. */
    testId?: string;
    action: RunModeAction;
}

/** Eyebrow / section order on Choose Your Path. */
export const RUN_MODE_GROUP_ORDER: readonly RunModeGroup[] = [
    'core',
    'time_attack',
    'puzzle',
    'training'
] as const;

export const RUN_MODE_GROUP_LABEL: Record<RunModeGroup, string> = {
    core: 'Core modes',
    time_attack: 'Time attack',
    puzzle: 'Puzzle',
    training: 'Training & contracts'
};

export const RUN_MODE_CATALOG: readonly RunModeDefinition[] = [
    {
        id: 'classic',
        title: 'Classic Run',
        shortDescription: 'Shippable endless-style descent: procedural floors, route choices, shop gold, relic milestones, and escalating pair counts.',
        availabilityDetail:
            'This is the live long-run ruleset for v1. It uses the internal endless simulation but is branded Classic until the future ultra-long Endless variant ships.',
        group: 'core',
        availability: 'available',
        posterKey: 'classic',
        action: { type: 'startRun' }
    },
    {
        id: 'daily',
        title: 'Daily Challenge',
        shortDescription: 'Shared daily mutators and seed. Resets at UTC midnight.',
        group: 'core',
        availability: 'available',
        posterKey: 'daily',
        action: { type: 'startDailyRun' }
    },
    {
        id: 'endless',
        title: 'Endless Mode',
        shortDescription: 'Upcoming ultra-long variant. Locked intentionally while long-form balance, rewards, and fatigue rules are tuned.',
        availabilityDetail:
            'Staged for a later balance pass: Classic already provides procedural long-run play; this card is not an unlock requirement or broken button.',
        group: 'core',
        availability: 'locked',
        posterKey: 'endless',
        testId: 'choose-path-low-cta',
        action: { type: 'locked' }
    },
    {
        id: 'gauntlet',
        title: 'Gauntlet',
        shortDescription: 'Race the clock in a timed descent. Pick a duration to begin.',
        group: 'time_attack',
        availability: 'available',
        posterKey: 'gauntlet',
        action: {
            type: 'gauntlet',
            presets: [
                { label: '5m', durationMs: 5 * 60 * 1000 },
                { label: '10m', durationMs: 10 * 60 * 1000 },
                { label: '15m', durationMs: 15 * 60 * 1000 }
            ]
        }
    },
    {
        id: 'puzzle_starter',
        title: 'Puzzle',
        shortDescription: 'Curated tile layout; focus on solving the board.',
        group: 'puzzle',
        availability: 'available',
        posterKey: 'puzzle',
        action: { type: 'puzzle', puzzleId: 'starter_pairs' }
    },
    {
        id: 'puzzle_mirror',
        title: 'Mirror Puzzle',
        shortDescription: 'Intermediate mirror craft layout.',
        group: 'puzzle',
        availability: 'available',
        posterKey: 'mirror_puzzle',
        action: { type: 'puzzle', puzzleId: 'mirror_craft' }
    },
    {
        id: 'puzzle_glyph_cross',
        title: 'Glyph Cross',
        shortDescription: 'Advanced 4×2 glyph pattern puzzle.',
        group: 'puzzle',
        availability: 'available',
        posterKey: 'puzzle',
        action: { type: 'puzzle', puzzleId: 'glyph_cross' }
    },
    {
        id: 'wild',
        title: 'Wild Run',
        shortDescription: 'Wild mutators and pacing for unpredictable descents.',
        group: 'training',
        availability: 'available',
        posterKey: 'wild',
        action: { type: 'startWildRun' }
    },
    {
        id: 'practice',
        title: 'Practice',
        shortDescription: 'Standard rules with practice pacing; experiment without pressure.',
        group: 'training',
        availability: 'available',
        posterKey: 'practice',
        action: { type: 'startPracticeRun' }
    },
    {
        id: 'scholar',
        title: 'Scholar',
        shortDescription: 'Contract: no shuffle, no destroy — read the board carefully.',
        group: 'training',
        availability: 'available',
        posterKey: 'scholar',
        action: { type: 'startScholarContractRun' }
    },
    {
        id: 'pin_vow',
        title: 'Pin vow',
        shortDescription: 'Limited pins across the run — plan each mark.',
        group: 'training',
        availability: 'available',
        posterKey: 'pin_vow',
        action: { type: 'startPinVowRun' }
    },
    {
        id: 'meditation',
        title: 'Meditation',
        shortDescription: 'Optional mutators for a focused study run, or start calm.',
        group: 'training',
        availability: 'available',
        posterKey: 'meditation',
        action: { type: 'meditationSetup' }
    }
] as const;

export function runModesByGroup(group: RunModeGroup): readonly RunModeDefinition[] {
    return RUN_MODE_CATALOG.filter((def) => def.group === group);
}

/** Featured hero row on Choose Your Path (Classic, Daily, Endless). Order is fixed. */
export const CHOOSE_PATH_HERO_MODE_IDS = ['classic', 'daily', 'endless'] as const;
export type ChoosePathHeroModeId = (typeof CHOOSE_PATH_HERO_MODE_IDS)[number];

const CHOOSE_PATH_HERO_ID_SET = new Set<string>(CHOOSE_PATH_HERO_MODE_IDS);

export function choosePathHeroModes(): readonly RunModeDefinition[] {
    return CHOOSE_PATH_HERO_MODE_IDS.map((id) => {
        const def = RUN_MODE_CATALOG.find((m) => m.id === id);
        if (!def) {
            throw new Error(`choosePathHeroModes: missing catalog entry for id "${id}"`);
        }
        return def;
    });
}

/** All modes below the hero row (Gauntlet, puzzles, training), stable catalog order. */
export function choosePathLibraryModes(): readonly RunModeDefinition[] {
    return RUN_MODE_CATALOG.filter((m) => !CHOOSE_PATH_HERO_ID_SET.has(m.id));
}

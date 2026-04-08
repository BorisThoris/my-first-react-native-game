/**
 * Shared read-only labels for HUD-adjacent UI, collection, inventory, and codex.
 * Gameplay logic stays in game/relics/mutators modules.
 */
import type { GameMode, RelicId } from './contracts';
import { ACHIEVEMENT_BY_ID, type AchievementDefinition } from './achievements';
import { MUTATOR_CATALOG, type MutatorDefinition } from './mutators';

export { ACHIEVEMENT_BY_ID, ACHIEVEMENTS } from './achievements';
export { MUTATOR_CATALOG } from './mutators';

export interface RelicDefinition {
    id: RelicId;
    title: string;
    description: string;
}

export const RELIC_CATALOG: Record<RelicId, RelicDefinition> = {
    extra_shuffle_charge: {
        id: 'extra_shuffle_charge',
        title: 'Extra shuffle charge',
        description: 'Begin the run with one additional shuffle charge.'
    },
    first_shuffle_free_per_floor: {
        id: 'first_shuffle_free_per_floor',
        title: 'First shuffle free per floor',
        description: 'The first shuffle each floor costs no charge (once per floor).'
    },
    memorize_bonus_ms: {
        id: 'memorize_bonus_ms',
        title: 'Longer memorize window',
        description: 'Adds memorize study time before tiles hide.'
    },
    destroy_bank_plus_one: {
        id: 'destroy_bank_plus_one',
        title: 'Destroy bank +1',
        description: 'Increases the destroy-pair charge bank capacity.'
    },
    combo_shard_plus_step: {
        id: 'combo_shard_plus_step',
        title: 'Combo shard head start',
        description: 'Combo shard streak thresholds start slightly closer.'
    },
    memorize_under_short_memorize: {
        id: 'memorize_under_short_memorize',
        title: 'Study cushion',
        description: 'Adds memorize time while Short memorize is active.'
    },
    parasite_ward_once: {
        id: 'parasite_ward_once',
        title: 'Parasite ward',
        description: 'Ignore the next score-parasite life loss once.'
    },
    region_shuffle_free_first: {
        id: 'region_shuffle_free_first',
        title: 'Free row shuffle',
        description: 'The first row shuffle each floor costs no charge.'
    }
};

export interface GameModeCodexEntry {
    id: GameMode;
    title: string;
    description: string;
}

export const GAME_MODE_CODEX: GameModeCodexEntry[] = [
    {
        id: 'endless',
        title: 'Classic Run',
        description:
            'Standard descent: procedural floors, relic offers, and escalating pair counts. (Internal mode id: endless.)'
    },
    {
        id: 'daily',
        title: 'Daily Challenge',
        description: 'One shared UTC seed per day with a rotated daily mutator lineup.'
    },
    {
        id: 'puzzle',
        title: 'Puzzle',
        description: 'Fixed handcrafted boards from the built-in puzzle set.'
    },
    {
        id: 'gauntlet',
        title: 'Gauntlet',
        description: 'Timed pressure run with a run-wide countdown.'
    },
    {
        id: 'meditation',
        title: 'Meditation',
        description: 'Longer memorize windows and calmer pacing for practice-style runs.'
    }
];

/** Product “Endless Mode” card — not yet a live ruleset; distinct from internal classic/endless. */
export const VISUAL_ENDLESS_MODE_LOCKED = {
    title: 'Endless Mode',
    description:
        'A future ruleset for ultra-long descents. Not playable yet—balance and relic cadence are still in design.'
} as const;

export interface CodexCoreTopic {
    id: string;
    title: string;
    description: string;
}

export const CODEX_CORE_TOPICS: CodexCoreTopic[] = [
    {
        id: 'pairs',
        title: 'Pairs and matching',
        description:
            'Flip two hidden tiles; a match clears the pair for score. Wild and contract rules can change what counts as a match.'
    },
    {
        id: 'memorize',
        title: 'Memorize phase',
        description:
            'Each floor begins with tiles face-up briefly, then play continues hidden. Mutators and relics can shorten or extend this window.'
    },
    {
        id: 'lives',
        title: 'Lives and clears',
        description: 'Mismatches cost lives. Clears advance the floor and may trigger relic offers on milestone floors.'
    },
    {
        id: 'powers',
        title: 'Powers and charges',
        description:
            'Shuffle, destroy pair, peek, stray remove, and pins consume charges or floor budgets. Scholar contracts can disable some powers.'
    },
    {
        id: 'relics',
        title: 'Relics',
        description: 'Chosen at floors 3, 6, and 9 when offered. Effects stack for the rest of the run.'
    },
    {
        id: 'mutators',
        title: 'Mutators',
        description: 'Daily and special runs can add mutators that change memorize timing, scoring pressure, or tile sets.'
    }
];

export const getAchievementMeta = (id: keyof typeof ACHIEVEMENT_BY_ID): AchievementDefinition => ACHIEVEMENT_BY_ID[id];

export const getRelicMeta = (id: RelicId): RelicDefinition => RELIC_CATALOG[id];

export const getMutatorMeta = (id: keyof typeof MUTATOR_CATALOG): MutatorDefinition => MUTATOR_CATALOG[id];

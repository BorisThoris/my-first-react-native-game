import type { MutatorId, RunState } from './contracts';

/** Rotated for daily challenge (index from daily mutator hash). */
export const DAILY_MUTATOR_TABLE: MutatorId[] = [
    'short_memorize',
    'sticky_fingers',
    'score_parasite',
    'wide_recall',
    'silhouette_twist',
    'n_back_anchor',
    'category_letters',
    'glass_floor'
];

export interface MutatorDefinition {
    id: MutatorId;
    title: string;
    description: string;
}

export const MUTATOR_CATALOG: Record<MutatorId, MutatorDefinition> = {
    glass_floor: {
        id: 'glass_floor',
        title: 'Glass floor',
        description: 'Board pressure shifts—tiles can behave as fragile decoys under certain clears.'
    },
    sticky_fingers: {
        id: 'sticky_fingers',
        title: 'Sticky fingers',
        description: 'After a match, one board index is briefly blocked for the next opening flip.'
    },
    score_parasite: {
        id: 'score_parasite',
        title: 'Score parasite',
        description: 'Life lost to mutator pressure advances a floor counter that affects scoring tension.'
    },
    category_letters: {
        id: 'category_letters',
        title: 'Letters only',
        description: 'Tile faces draw from the letter/number hybrid set instead of rotating symbol bands.'
    },
    short_memorize: {
        id: 'short_memorize',
        title: 'Short memorize',
        description: 'Less time to study the board before pairs go hidden.'
    },
    wide_recall: {
        id: 'wide_recall',
        title: 'Wide recall',
        description: 'Recall phase spans a wider tile grid footprint.'
    },
    silhouette_twist: {
        id: 'silhouette_twist',
        title: 'Silhouette twist',
        description: 'Face presentation leans on silhouette-style reads for matching.'
    },
    n_back_anchor: {
        id: 'n_back_anchor',
        title: 'N-back anchor',
        description: 'Anchor pair keys and match cadence interact for spaced recall pressure.'
    },
    distraction_channel: {
        id: 'distraction_channel',
        title: 'Distraction channel',
        description: 'Optional transient numeric channel—respects reduced motion when enabled.'
    },
    findables_floor: {
        id: 'findables_floor',
        title: 'Findables floor',
        description:
            'Some pairs carry a bonus pickup (0–2 per floor). Match the pair to claim score; Destroy removes the pickup with no reward.'
    }
};

export const hasMutator = (run: RunState, id: MutatorId): boolean => run.activeMutators.includes(id);

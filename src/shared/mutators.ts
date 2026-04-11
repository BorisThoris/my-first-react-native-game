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
        description:
            'Play phase de-emphasizes symbols vs labels on flipped tiles; each successful match scores slightly less.'
    },
    silhouette_twist: {
        id: 'silhouette_twist',
        title: 'Silhouette twist',
        description: 'Silhouette-style face reads during play; each successful match scores slightly less.'
    },
    n_back_anchor: {
        id: 'n_back_anchor',
        title: 'N-back anchor',
        description: 'Anchor pair keys and match cadence interact for spaced recall pressure.'
    },
    distraction_channel: {
        id: 'distraction_channel',
        title: 'Distraction channel',
        description:
            'Optional cycling digit HUD during play (settings; off by default; hidden when reduced motion). Cosmetic only—each successful match still scores slightly less while the mutator is active.'
    },
    findables_floor: {
        id: 'findables_floor',
        title: 'Findables floor',
        description:
            'Some pairs carry a bonus pickup (0–2 per floor). Match the pair to claim score; Destroy removes the pickup with no reward.'
    },
    shifting_spotlight: {
        id: 'shifting_spotlight',
        title: 'Shifting spotlight',
        description:
            'Each flip sequence (match, miss, gambit, or destroy) moves a Ward pair (lower match score) and a Bounty pair (bonus score) among remaining pairs. Distinct from the cursed “match last” pair.'
    }
};

export const hasMutator = (run: RunState, id: MutatorId): boolean => run.activeMutators.includes(id);

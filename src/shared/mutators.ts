import type { MutatorId, RunState } from './contracts';

/** Rotated for daily challenge (index from daily mutator hash). */
export const DAILY_MUTATOR_TABLE: MutatorId[] = ['short_memorize', 'sticky_fingers', 'score_parasite'];

export const hasMutator = (run: RunState, id: MutatorId): boolean => run.activeMutators.includes(id);

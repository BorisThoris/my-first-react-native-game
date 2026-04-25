import type { FeaturedObjectiveId, LevelResult, RunState } from './contracts';
import { getFeaturedObjectiveLabel } from './floor-mutator-schedule';

export type SecondaryObjectiveState = 'active' | 'completed' | 'failed';

export interface SecondaryObjectiveProgress {
    id: FeaturedObjectiveId;
    label: string;
    status: SecondaryObjectiveState;
    state: SecondaryObjectiveState;
    condition: string;
    detail: string;
    failureReason: string | null;
    reward: string;
}

const flipParLimit = (pairCount: number): number => Math.ceil(pairCount * 1.25) + 2;

const objectiveReward = (id: FeaturedObjectiveId): string => {
    switch (id) {
        case 'scholar_style':
            return '+40 score and featured-objective Favor when scheduled.';
        case 'glass_witness':
            return '+35 score and featured-objective Favor when scheduled.';
        case 'cursed_last':
            return '+50 score and featured-objective Favor when scheduled.';
        case 'flip_par':
            return '+30 score and featured-objective Favor when scheduled.';
        default:
            return 'Bonus score and Favor when scheduled.';
    }
};

export const getSecondaryObjectiveProgress = (run: RunState): SecondaryObjectiveProgress | null => {
    const board = run.board;
    const id = board?.featuredObjectiveId;
    if (!board || !id) {
        return null;
    }
    const label = getFeaturedObjectiveLabel(id) ?? id;
    let state: SecondaryObjectiveState = 'active';
    let detail = '';
    let condition = '';
    let failureReason: string | null = null;

    if (run.lastLevelResult?.featuredObjectiveId === id) {
        state = run.lastLevelResult.featuredObjectiveCompleted ? 'completed' : 'failed';
        const reward = objectiveReward(id);
        return {
            id,
            label,
            status: state,
            state,
            condition: state === 'completed' ? 'Objective completed on floor clear.' : 'Objective missed on floor clear.',
            detail: state === 'completed' ? `${label} completed.` : `${label} missed.`,
            failureReason: state === 'failed' ? 'Objective missed before floor clear.' : null,
            reward
        };
    }

    switch (id) {
        case 'scholar_style':
            state = run.shuffleUsedThisFloor || run.destroyUsedThisFloor ? 'failed' : 'active';
            condition = 'Clear without shuffle or destroy.';
            failureReason = state === 'failed' ? 'Shuffle or destroy was used this floor.' : null;
            detail = state === 'failed' ? `Failed: ${failureReason}` : 'Do not use shuffle or destroy this floor.';
            break;
        case 'glass_witness':
            state = run.decoyFlippedThisFloor ? 'failed' : 'active';
            condition = 'Keep the glass decoy out of every mismatch.';
            failureReason = state === 'failed' ? 'The glass decoy entered a mismatch.' : null;
            detail = state === 'failed' ? `Failed: ${failureReason}` : 'Keep the glass decoy out of every mismatch.';
            break;
        case 'cursed_last':
            state = run.cursedMatchedEarlyThisFloor ? 'failed' : 'active';
            condition = 'Clear the cursed pair last among real pairs.';
            failureReason = state === 'failed' ? 'The cursed pair was matched early.' : null;
            detail = state === 'failed' ? `Failed: ${failureReason}` : 'Clear the cursed pair last among real pairs.';
            break;
        case 'flip_par': {
            const limit = flipParLimit(board.pairCount);
            state = run.matchResolutionsThisFloor > limit ? 'failed' : 'active';
            condition = `Stay within match-resolution par (${run.matchResolutionsThisFloor}/${limit}).`;
            failureReason = state === 'failed' ? `Match-resolution par exceeded (${run.matchResolutionsThisFloor}/${limit}).` : null;
            detail =
                state === 'failed'
                    ? `Failed: ${failureReason}`
                    : `Stay within ${run.matchResolutionsThisFloor}/${limit} match resolutions.`;
            break;
        }
        default:
            condition = 'Complete the featured objective before clearing the floor.';
            detail = 'Complete the featured objective before clearing the floor.';
            break;
    }

    return {
        id,
        label,
        status: state,
        state,
        condition,
        detail,
        failureReason,
        reward: objectiveReward(id)
    };
};

export const getSecondaryObjectiveStatusRows = (run: RunState): SecondaryObjectiveProgress[] => {
    const progress = getSecondaryObjectiveProgress(run);
    return progress ? [progress] : [];
};

export const formatLevelResultObjectiveLine = (result: LevelResult): string | null => {
    if (!result.featuredObjectiveId) {
        return null;
    }
    const label = getFeaturedObjectiveLabel(result.featuredObjectiveId) ?? result.featuredObjectiveId;
    if (result.featuredObjectiveCompleted) {
        const bonus = result.objectiveBonusScore ? ` (+${result.objectiveBonusScore} score)` : '';
        return `${label}: Complete${bonus}`;
    }
    return `${label}: Missed — no objective bonus.`;
};

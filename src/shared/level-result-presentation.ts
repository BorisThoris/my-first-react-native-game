import type { LevelResult } from './contracts';
import type { MechanicTokenId } from './mechanic-feedback';

export type FloorClearCausalityGroup = 'performance' | 'objective' | 'assist' | 'reward' | 'route';

export interface FloorClearCausalityRow {
    id: string;
    group: FloorClearCausalityGroup;
    label: string;
    detail: string;
    tokens: MechanicTokenId[];
}

const objectiveLabel = (id: LevelResult['featuredObjectiveId']): string => {
    switch (id) {
        case 'scholar_style':
            return 'Scholar style';
        case 'glass_witness':
            return 'Glass witness';
        case 'cursed_last':
            return 'Cursed last';
        case 'flip_par':
            return 'Flip par';
        default:
            return 'Objective';
    }
};

const clearLifeDetail = (result: LevelResult): string | null => {
    if (result.clearLifeGained !== 1) {
        return null;
    }
    return result.clearLifeReason === 'perfect'
        ? 'Perfect floor restored 1 life.'
        : result.clearLifeReason === 'clean'
          ? 'Clean floor restored 1 life.'
          : null;
};

export const getFloorClearCausalityRows = (
    result: LevelResult,
    powersUsedThisRun: boolean
): FloorClearCausalityRow[] => {
    const rows: FloorClearCausalityRow[] = [
        {
            id: 'performance_score',
            group: 'performance',
            label: 'Performance',
            detail: `Rating ${result.rating}; ${result.mistakes} mistake${result.mistakes === 1 ? '' : 's'}; +${result.scoreGained.toLocaleString()} score.`,
            tokens: result.perfect ? ['safe', 'reward'] : ['risk', 'reward']
        }
    ];

    const lifeDetail = clearLifeDetail(result);
    if (lifeDetail) {
        rows.push({
            id: 'life_restore',
            group: 'reward',
            label: 'Life restored',
            detail: lifeDetail,
            tokens: ['safe', 'reward']
        });
    }

    if (result.featuredObjectiveId) {
        rows.push({
            id: 'featured_objective',
            group: 'objective',
            label: objectiveLabel(result.featuredObjectiveId),
            detail: result.featuredObjectiveCompleted
                ? `Completed for +${result.objectiveBonusScore ?? 0} score and +${result.relicFavorGained ?? 0} Favor.`
                : 'Missed this floor; streak pressure updated.',
            tokens: result.featuredObjectiveCompleted ? ['objective', 'reward', 'momentum'] : ['objective', 'forfeit', 'risk']
        });
    }

    if (result.endlessRiskWagerOutcome) {
        rows.push({
            id: 'risk_wager',
            group: 'objective',
            label: 'Risk wager',
            detail:
                result.endlessRiskWagerOutcome === 'won'
                    ? `Won for +${result.endlessRiskWagerFavorGained ?? 0} Favor.`
                    : `Lost; streak reduced by ${result.endlessRiskWagerStreakLost ?? 0}.`,
            tokens: result.endlessRiskWagerOutcome === 'won' ? ['risk', 'reward', 'momentum'] : ['risk', 'forfeit']
        });
    }

    if (result.bossTrophyCacheOutcome) {
        rows.push({
            id: 'boss_trophy_cache',
            group: 'reward',
            label: 'Boss trophy',
            detail:
                result.bossTrophyCacheOutcome === 'claimed'
                    ? `Boss objective completed; trophy cache paid +${result.bossTrophyCacheScore ?? 0} score.`
                    : 'Boss objective unresolved; trophy cache was forfeited.',
            tokens:
                result.bossTrophyCacheOutcome === 'claimed'
                    ? ['objective', 'reward', 'momentum']
                    : ['objective', 'forfeit', 'risk']
        });
    }

    rows.push({
        id: 'perfect_memory',
        group: 'assist',
        label: 'Perfect Memory',
        detail: powersUsedThisRun
            ? 'Locked by an assist used this run.'
            : 'Still eligible if the run also clears with zero mismatches.',
        tokens: powersUsedThisRun ? ['forfeit', 'cost'] : ['safe', 'objective']
    });

    if (result.routeChoices?.length) {
        rows.push({
            id: 'route_choice',
            group: 'route',
            label: 'Next route',
            detail: `${result.routeChoices.length} connected room choices are available.`,
            tokens: ['objective', 'reward', 'risk']
        });
    }

    return rows;
};

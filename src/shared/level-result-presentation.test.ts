import { describe, expect, it } from 'vitest';
import type { LevelResult } from './contracts';
import { getFloorClearCausalityRows } from './level-result-presentation';
import { assertTokenCoverage } from './mechanic-feedback';

const baseResult: LevelResult = {
    level: 3,
    scoreGained: 250,
    rating: 'S',
    livesRemaining: 4,
    perfect: true,
    mistakes: 0,
    clearLifeReason: 'perfect',
    clearLifeGained: 1
};

describe('floor clear causality presentation', () => {
    it('groups performance, rewards, assist state, and route choices with token coverage', () => {
        const rows = getFloorClearCausalityRows(
            {
                ...baseResult,
                featuredObjectiveId: 'flip_par',
                featuredObjectiveCompleted: true,
                objectiveBonusScore: 45,
                relicFavorGained: 1,
                routeChoices: [
                    { id: 'safe', routeType: 'safe', label: 'Safe', detail: 'Recover.', rewardPreview: '+1 guard' }
                ]
            },
            false
        );

        expect(rows.map((row) => row.id)).toEqual([
            'performance_score',
            'life_restore',
            'featured_objective',
            'perfect_memory',
            'route_choice'
        ]);
        expect(rows.every((row) => assertTokenCoverage(row.tokens))).toBe(true);
        expect(rows.find((row) => row.id === 'perfect_memory')).toMatchObject({
            detail: 'Still eligible if the run also clears with zero mismatches.'
        });
    });

    it('names assist lock and wager loss causes', () => {
        const rows = getFloorClearCausalityRows(
            {
                ...baseResult,
                perfect: false,
                mistakes: 1,
                featuredObjectiveId: 'scholar_style',
                featuredObjectiveCompleted: false,
                endlessRiskWagerOutcome: 'lost',
                endlessRiskWagerStreakLost: 2
            },
            true
        );

        expect(rows.find((row) => row.id === 'perfect_memory')).toMatchObject({
            detail: 'Locked by an assist used this run.',
            tokens: ['forfeit', 'cost']
        });
        expect(rows.find((row) => row.id === 'risk_wager')?.detail).toContain('streak reduced by 2');
    });
});

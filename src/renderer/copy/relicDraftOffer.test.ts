import { describe, expect, it } from 'vitest';
import { getRelicDraftVisitTotals } from './relicDraftOffer';

describe('relicDraftOffer', () => {
    it('getRelicDraftVisitTotals: start of visit', () => {
        expect(getRelicDraftVisitTotals({ tier: 1, options: [], picksRemaining: 3, pickRound: 0 })).toEqual({
            total: 3,
            currentPick: 1
        });
    });

    it('getRelicDraftVisitTotals: second pick', () => {
        expect(getRelicDraftVisitTotals({ tier: 1, options: [], picksRemaining: 2, pickRound: 1 })).toEqual({
            total: 3,
            currentPick: 2
        });
    });

    it('getRelicDraftVisitTotals: single pick visit', () => {
        expect(getRelicDraftVisitTotals({ tier: 1, options: [], picksRemaining: 1, pickRound: 0 })).toEqual({
            total: 1,
            currentPick: 1
        });
    });
});

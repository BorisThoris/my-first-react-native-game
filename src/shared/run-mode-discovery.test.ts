import { describe, expect, it } from 'vitest';
import { buildRunModeDiscoveryState } from './run-mode-discovery';

describe('REG-010 run mode discovery state', () => {
    it('explains browse/search/page state in player-facing copy', () => {
        const state = buildRunModeDiscoveryState({
            availableModeCount: 5,
            filteredCount: 2,
            pageCount: 3,
            pageIndex: 1,
            query: 'daily'
        });

        expect(state.selectedModeHint).toMatch(/Start selected/i);
        expect(state.browseHint).toContain('Page 2 of 3');
        expect(state.searchState).toContain('2 result');
        expect(state.emptyState).toBeNull();
    });

    it('returns a visible no-result state for empty filters', () => {
        const state = buildRunModeDiscoveryState({
            availableModeCount: 0,
            filteredCount: 0,
            pageCount: 0,
            pageIndex: 0,
            query: 'zzz'
        });

        expect(state.emptyState).toMatch(/No modes match/);
        expect(state.browseHint).toMatch(/Clear the search/);
    });
});

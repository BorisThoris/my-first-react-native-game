import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useHudPoliteLiveAnnouncement } from './useHudPoliteLiveAnnouncement';

const base = {
    gauntletRemainingMs: null as number | null,
    gauntletActive: false,
    scoreParasiteActive: true,
    parasiteFloors: 0,
    parasiteWardRemaining: 0,
    lives: 3,
    boardLevel: 1 as number | null
};

describe('useHudPoliteLiveAnnouncement', () => {
    it('announces when gauntlet crosses the sixty-second bucket', async () => {
        const { result, rerender } = renderHook(
            (p: { ms: number }) =>
                useHudPoliteLiveAnnouncement({
                    ...base,
                    gauntletActive: true,
                    gauntletRemainingMs: p.ms
                }),
            { initialProps: { ms: 90_000 } }
        );
        expect(result.current).toBe('');
        rerender({ ms: 90_000 });
        expect(result.current).toBe('');
        await act(async () => {
            rerender({ ms: 59_000 });
        });
        expect(result.current).toBe('Gauntlet: one minute or less remaining.');
    });

    it('announces score parasite one-floor-before-drain', async () => {
        const { result, rerender } = renderHook(
            (p: { level: number; pf: number }) =>
                useHudPoliteLiveAnnouncement({
                    ...base,
                    boardLevel: p.level,
                    parasiteFloors: p.pf
                }),
            { initialProps: { level: 3, pf: 2 } }
        );
        await act(async () => {
            rerender({ level: 4, pf: 3 });
        });
        expect(result.current).toBe('Score parasite: next cleared floor triggers the drain unless warded.');
    });

    it('announces score parasite life drain', async () => {
        const { result, rerender } = renderHook(
            (p: { level: number; pf: number; lives: number }) =>
                useHudPoliteLiveAnnouncement({
                    ...base,
                    boardLevel: p.level,
                    parasiteFloors: p.pf,
                    lives: p.lives
                }),
            { initialProps: { level: 4, pf: 3, lives: 3 } }
        );
        await act(async () => {
            rerender({ level: 5, pf: 0, lives: 2 });
        });
        expect(result.current).toBe('Score parasite drained one life.');
    });

    it('announces ward absorbing parasite drain', async () => {
        const { result, rerender } = renderHook(
            (p: { level: number; pf: number; ward: number; lives: number }) =>
                useHudPoliteLiveAnnouncement({
                    ...base,
                    boardLevel: p.level,
                    parasiteFloors: p.pf,
                    parasiteWardRemaining: p.ward,
                    lives: p.lives
                }),
            { initialProps: { level: 4, pf: 3, ward: 1, lives: 3 } }
        );
        await act(async () => {
            rerender({ level: 5, pf: 0, ward: 0, lives: 3 });
        });
        expect(result.current).toBe('Score parasite drain absorbed by ward.');
    });
});

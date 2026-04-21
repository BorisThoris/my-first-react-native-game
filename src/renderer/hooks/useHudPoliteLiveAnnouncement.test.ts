import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Tile } from '../../shared/contracts';
import { GAMBIT_OPPORTUNITY_HINT_LINE } from '../copy/gameplayHints';
import { useHudPoliteLiveAnnouncement } from './useHudPoliteLiveAnnouncement';

const base = {
    gauntletRemainingMs: null as number | null,
    gauntletActive: false,
    scoreParasiteActive: true,
    parasiteFloors: 0,
    parasiteWardRemaining: 0,
    lives: 3,
    boardLevel: 1 as number | null,
    boardTiles: [] as Tile[],
    findablesClaimedThisFloor: 0,
    chainMatchStreak: 0,
    chainAnnounceActive: false,
    gambitThirdPickActive: false,
    gambitOpportunityFlippedIds: null as readonly string[] | null
};

const flushRaf = async (): Promise<void> => {
    await act(async () => {
        await new Promise<void>((resolve) => {
            requestAnimationFrame(() => resolve());
        });
        await Promise.resolve();
    });
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
        expect(result.current.message).toBe('');
        rerender({ ms: 90_000 });
        expect(result.current.message).toBe('');
        await act(async () => {
            rerender({ ms: 59_000 });
        });
        await flushRaf();
        expect(result.current.message).toBe('Gauntlet: one minute or less remaining.');
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
        await flushRaf();
        expect(result.current.message).toBe(
            'Score parasite: next cleared floor triggers the drain unless warded.'
        );
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
        await flushRaf();
        expect(result.current.message).toBe('Score parasite drained one life.');
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
        await flushRaf();
        expect(result.current.message).toBe('Score parasite drain absorbed by ward.');
    });

    it('announces match chain milestones while playing', async () => {
        const { result, rerender } = renderHook(
            (p: { streak: number }) =>
                useHudPoliteLiveAnnouncement({
                    ...base,
                    boardLevel: 3,
                    chainAnnounceActive: true,
                    chainMatchStreak: p.streak
                }),
            { initialProps: { streak: 2 } }
        );

        await act(async () => {
            rerender({ streak: 3 });
        });
        await flushRaf();

        expect(result.current.message).toBe(
            'Chain times three — consecutive matches boost your score.'
        );
    });

    it('announces pickup claims with reward-specific copy', async () => {
        const beforeTiles: Tile[] = [
            { id: 'a1', pairKey: 'A', symbol: 'A', label: 'A', state: 'hidden', findableKind: 'shard_spark' },
            { id: 'a2', pairKey: 'A', symbol: 'A', label: 'A', state: 'hidden', findableKind: 'shard_spark' }
        ];
        const afterTiles: Tile[] = [
            { id: 'a1', pairKey: 'A', symbol: 'A', label: 'A', state: 'matched' },
            { id: 'a2', pairKey: 'A', symbol: 'A', label: 'A', state: 'matched' }
        ];

        const { result, rerender } = renderHook(
            (p: { tiles: Tile[]; claimed: number }) =>
                useHudPoliteLiveAnnouncement({
                    ...base,
                    boardLevel: 2,
                    boardTiles: p.tiles,
                    findablesClaimedThisFloor: p.claimed
                }),
            { initialProps: { tiles: beforeTiles, claimed: 0 } }
        );

        await act(async () => {
            rerender({ tiles: afterTiles, claimed: 1 });
        });
        await flushRaf();

        expect(result.current.message).toBe('Shard spark claimed: plus one combo shard.');
    });

    it('dedupes announcements with the same key in one rAF flush', async () => {
        const { result } = renderHook(() =>
            useHudPoliteLiveAnnouncement({
                ...base,
                boardLevel: null
            })
        );

        await act(async () => {
            result.current.queuePoliteAnnouncement('a', { dedupeKey: 'k', priority: 'info' });
            result.current.queuePoliteAnnouncement('b', { dedupeKey: 'k', priority: 'info' });
        });
        await flushRaf();

        expect(result.current.message).toBe('b');
    });

    it('prefers higher priority when dedupe key matches', async () => {
        const { result } = renderHook(() =>
            useHudPoliteLiveAnnouncement({
                ...base,
                boardLevel: null
            })
        );

        await act(async () => {
            result.current.queuePoliteAnnouncement('info-text', { dedupeKey: 'x', priority: 'info' });
            result.current.queuePoliteAnnouncement('error-text', { dedupeKey: 'x', priority: 'error' });
        });
        await flushRaf();

        expect(result.current.message).toBe('error-text');
    });

    it('does not downgrade priority when a lower priority shares a dedupe key', async () => {
        const { result } = renderHook(() =>
            useHudPoliteLiveAnnouncement({
                ...base,
                boardLevel: null
            })
        );

        await act(async () => {
            result.current.queuePoliteAnnouncement('error-text', { dedupeKey: 'x', priority: 'error' });
            result.current.queuePoliteAnnouncement('info-text', { dedupeKey: 'x', priority: 'info' });
        });
        await flushRaf();

        expect(result.current.message).toBe('error-text');
    });

    it(
        'throttles rapid successive deliveries (min gap between live-region updates)',
        async () => {
            const { result } = renderHook(() =>
                useHudPoliteLiveAnnouncement({
                    ...base,
                    boardLevel: null
                })
            );

            await act(async () => {
                result.current.queuePoliteAnnouncement('first', { dedupeKey: 'a' });
            });
            await flushRaf();
            expect(result.current.message).toBe('first');

            await act(async () => {
                result.current.queuePoliteAnnouncement('second', { dedupeKey: 'b' });
            });
            await flushRaf();
            expect(result.current.message).toBe('first');

            await act(async () => {
                await new Promise<void>((r) => setTimeout(r, 420));
            });
            expect(result.current.message).toBe('second');
        },
        10_000
    );

    it('announces Gambit third-flip opportunity when the window opens', async () => {
        const { result, rerender } = renderHook(
            (p: { active: boolean; ids: readonly string[] | null }) =>
                useHudPoliteLiveAnnouncement({
                    ...base,
                    boardLevel: 2,
                    scoreParasiteActive: false,
                    gambitThirdPickActive: p.active,
                    gambitOpportunityFlippedIds: p.ids
                }),
            { initialProps: { active: false, ids: null as readonly string[] | null } }
        );
        await act(async () => {
            rerender({ active: true, ids: ['tile-a', 'tile-b'] });
        });
        await flushRaf();
        expect(result.current.message).toBe(GAMBIT_OPPORTUNITY_HINT_LINE);
    });
});

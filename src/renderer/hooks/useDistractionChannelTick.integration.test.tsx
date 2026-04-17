import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GAME_RULES_VERSION } from '../../shared/contracts';
import { pickFloorScheduleEntry } from '../../shared/floor-mutator-schedule';
import { useDistractionChannelTick } from './useDistractionChannelTick';

describe('useDistractionChannelTick + floor schedule (REF-099)', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('advances tick on interval when distraction_channel is active from schedule-derived gate', () => {
        vi.useFakeTimers();

        let found: { seed: number; level: number } | null = null;
        outer: for (let s = 0; s < 8000; s++) {
            for (let level = 1; level <= 64; level++) {
                const entry = pickFloorScheduleEntry(s, GAME_RULES_VERSION, level, 'endless');
                if (entry.mutators.includes('distraction_channel')) {
                    found = { seed: s, level };
                    break outer;
                }
            }
        }
        expect(found).not.toBeNull();

        const entry = pickFloorScheduleEntry(found!.seed, GAME_RULES_VERSION, found!.level, 'endless');
        expect(entry.mutators).toContain('distraction_channel');

        const distractionHudOn = entry.mutators.includes('distraction_channel');

        const { result, unmount } = renderHook(() => useDistractionChannelTick(distractionHudOn));
        expect(result.current).toBe(0);
        act(() => {
            vi.advanceTimersByTime(880);
        });
        expect(result.current).toBe(1);
        unmount();
    });
});

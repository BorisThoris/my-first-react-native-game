import { describe, expect, it } from 'vitest';
import {
    FLOOR_SCHEDULE_RULES_VERSION,
    pickFloorScheduleEntry,
    usesEndlessFloorSchedule
} from './floor-mutator-schedule';

describe('usesEndlessFloorSchedule', () => {
    it('is false for non-endless modes', () => {
        expect(usesEndlessFloorSchedule('puzzle', FLOOR_SCHEDULE_RULES_VERSION)).toBe(false);
        expect(usesEndlessFloorSchedule('daily', FLOOR_SCHEDULE_RULES_VERSION)).toBe(false);
    });

    it('is false when rules version is below the floor schedule gate', () => {
        expect(usesEndlessFloorSchedule('endless', FLOOR_SCHEDULE_RULES_VERSION - 1)).toBe(false);
    });

    it('is true for endless at or above the gate', () => {
        expect(usesEndlessFloorSchedule('endless', FLOOR_SCHEDULE_RULES_VERSION)).toBe(true);
    });
});

describe('pickFloorScheduleEntry', () => {
    const rv = FLOOR_SCHEDULE_RULES_VERSION;

    it('returns empty mutators for non-endless modes', () => {
        expect(pickFloorScheduleEntry(1, rv, 5, 'puzzle')).toEqual({
            mutators: [],
            floorTag: 'normal'
        });
    });

    it('returns empty mutators when rules version is below the gate', () => {
        expect(pickFloorScheduleEntry(1, rv - 1, 5, 'endless')).toEqual({
            mutators: [],
            floorTag: 'normal'
        });
    });

    it('cycles mutators and floorTag for endless + qualifying rules version', () => {
        expect(pickFloorScheduleEntry(0, rv, 1, 'endless')).toEqual({
            mutators: ['wide_recall'],
            floorTag: 'normal'
        });
        expect(pickFloorScheduleEntry(0, rv, 3, 'endless')).toEqual({
            mutators: [],
            floorTag: 'breather'
        });
        expect(pickFloorScheduleEntry(0, rv, 7, 'endless').floorTag).toBe('boss');
        expect(pickFloorScheduleEntry(0, rv, 7, 'endless').mutators).toContain('glass_floor');
    });

    const cycleLen = 12;

    it('wraps level with the endless cycle length', () => {
        const a = pickFloorScheduleEntry(42, rv, 1, 'endless');
        const b = pickFloorScheduleEntry(42, rv, 1 + cycleLen, 'endless');
        expect(b).toEqual(a);
    });

    it('optionally appends distraction_channel on some boss floors when RNG is below threshold', () => {
        let foundWith: number | null = null;
        let foundWithout: number | null = null;
        for (let runSeed = 0; runSeed < 8000; runSeed += 1) {
            const e = pickFloorScheduleEntry(runSeed, rv, 7, 'endless');
            if (e.floorTag !== 'boss') {
                continue;
            }
            if (e.mutators.includes('distraction_channel') && foundWith === null) {
                foundWith = runSeed;
            }
            if (!e.mutators.includes('distraction_channel') && e.mutators.length < 3 && foundWithout === null) {
                foundWithout = runSeed;
            }
            if (foundWith !== null && foundWithout !== null) {
                break;
            }
        }
        expect(foundWith, 'expected a boss seed where distraction_channel appended').not.toBeNull();
        expect(foundWithout, 'expected a boss seed where distraction_channel not appended').not.toBeNull();
    });

    it('does not add duplicate distraction_channel or exceed three mutators', () => {
        for (let runSeed = 0; runSeed < 2000; runSeed += 1) {
            const e = pickFloorScheduleEntry(runSeed, rv, 7, 'endless');
            if (e.floorTag !== 'boss') {
                continue;
            }
            const d = e.mutators.filter((m) => m === 'distraction_channel');
            expect(d.length).toBeLessThanOrEqual(1);
            expect(e.mutators.length).toBeLessThanOrEqual(3);
        }
    });
});

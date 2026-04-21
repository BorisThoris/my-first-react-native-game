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

    it('returns an empty schedule entry for non-endless modes', () => {
        expect(pickFloorScheduleEntry(1, rv, 5, 'puzzle')).toEqual({
            mutators: [],
            floorTag: 'normal',
            floorArchetypeId: null,
            featuredObjectiveId: null,
            title: null,
            hint: null
        });
    });

    it('returns an empty schedule entry when rules version is below the gate', () => {
        expect(pickFloorScheduleEntry(1, rv - 1, 5, 'endless')).toEqual({
            mutators: [],
            floorTag: 'normal',
            floorArchetypeId: null,
            featuredObjectiveId: null,
            title: null,
            hint: null
        });
    });

    it('returns authored chapter metadata for endless floors', () => {
        expect(pickFloorScheduleEntry(0, rv, 1, 'endless')).toMatchObject({
            mutators: ['wide_recall'],
            floorTag: 'normal',
            floorArchetypeId: 'survey_hall',
            featuredObjectiveId: 'flip_par',
            title: 'Survey Hall'
        });
        expect(pickFloorScheduleEntry(0, rv, 3, 'endless')).toMatchObject({
            mutators: ['findables_floor'],
            floorTag: 'breather',
            floorArchetypeId: 'treasure_gallery',
            featuredObjectiveId: 'scholar_style',
            title: 'Treasure Gallery'
        });
        expect(pickFloorScheduleEntry(0, rv, 7, 'endless')).toMatchObject({
            floorTag: 'boss',
            floorArchetypeId: 'trap_hall',
            featuredObjectiveId: 'glass_witness',
            title: 'Trap Hall'
        });
        expect(pickFloorScheduleEntry(0, rv, 12, 'endless')).toMatchObject({
            mutators: ['shifting_spotlight'],
            floorTag: 'normal',
            floorArchetypeId: 'spotlight_hunt',
            featuredObjectiveId: 'cursed_last',
            title: 'Spotlight Hunt'
        });
    });

    const cycleLen = 12;

    it('wraps level with the endless cycle length', () => {
        const a = pickFloorScheduleEntry(42, rv, 1, 'endless');
        const b = pickFloorScheduleEntry(42, rv, 1 + cycleLen, 'endless');
        expect(b).toEqual(a);
    });

    it('optionally appends distraction_channel on some boss floors without changing archetype or objective', () => {
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
        const withDistraction = pickFloorScheduleEntry(foundWith!, rv, 7, 'endless');
        expect(withDistraction.floorArchetypeId).toBe('trap_hall');
        expect(withDistraction.featuredObjectiveId).toBe('glass_witness');
    });

    it('uses the same boss-floor shape for BALANCE_NOTES sim default seed (42001) at level 7', () => {
        const e = pickFloorScheduleEntry(42_001, rv, 7, 'endless');
        expect(e.floorTag).toBe('boss');
        expect(e.floorArchetypeId).toBe('trap_hall');
        expect(e.featuredObjectiveId).toBe('glass_witness');
        expect(e.mutators).toContain('glass_floor');
        expect(e.mutators).toContain('sticky_fingers');
    });

    it('does not add duplicate distraction_channel or exceed three mutators on boss floors', () => {
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

import { describe, expect, it } from 'vitest';
import { getEncounterIdentityForFloor, getEncounterIdentityForRouteKind } from './boss-encounters';
import { GAME_RULES_VERSION } from './contracts';
import { pickFloorScheduleEntry } from './floor-mutator-schedule';

describe('REG-076 boss and elite encounter identity', () => {
    it('derives boss identity from scheduled boss floor tags', () => {
        const entry = pickFloorScheduleEntry(76_001, GAME_RULES_VERSION, 7, 'endless');
        const identity = getEncounterIdentityForFloor(entry);

        expect(identity).not.toBeNull();
        expect(identity).toMatchObject({
            encounterRank: 'boss',
            label: 'Boss encounter',
            scoreRule: 'Applies the boss floor score multiplier after bonuses.'
        });
        expect(identity!.mechanics.length).toBeGreaterThanOrEqual(2);
        expect(identity!.placeholderNeeded).toBe(true);
        expect(identity!.placeholderSlots).toContain('boss intro stinger');
    });

    it('names elite route identity without claiming boss score rules', () => {
        const identity = getEncounterIdentityForRouteKind('elite');

        expect(identity).not.toBeNull();
        expect(identity!.encounterRank).toBe('elite');
        expect(identity!.scoreRule).toBe('No boss score multiplier; elite identity is route-pressure and reward pacing only.');
        expect(identity!.placeholderSlots).toContain('elite route badge');
    });

    it('keeps normal/breather floors out of encounter presentation', () => {
        const entry = pickFloorScheduleEntry(76_001, GAME_RULES_VERSION, 1, 'endless');

        expect(getEncounterIdentityForFloor(entry)).toBeNull();
        expect(getEncounterIdentityForRouteKind('combat')).toBeNull();
    });
});

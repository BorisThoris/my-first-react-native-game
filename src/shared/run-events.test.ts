import { describe, expect, it } from 'vitest';
import { GAME_RULES_VERSION } from './contracts';
import { chooseRunEventOption, rollRunEventRoom } from './run-events';

describe('REG-074 run event rooms', () => {
    it('rolls deterministic offline events with bounded choices', () => {
        const a = rollRunEventRoom({ runSeed: 74_001, rulesVersion: GAME_RULES_VERSION, floor: 5 });
        const b = rollRunEventRoom({ runSeed: 74_001, rulesVersion: GAME_RULES_VERSION, floor: 5 });

        expect(a).toEqual(b);
        expect(a.offlineOnly).toBe(true);
        expect(a.options.length).toBeGreaterThanOrEqual(2);
        expect(a.options.every((option) => option.resultText.length > 0)).toBe(true);
    });

    it('applies event choice previews without mutating the input run state', () => {
        const event = rollRunEventRoom({ runSeed: 74_002, rulesVersion: GAME_RULES_VERSION, floor: 4 });
        const choice = event.options[0]!;
        const result = chooseRunEventOption(
            { shopGold: 1, lives: 3, relicFavorProgress: 0 },
            event,
            choice.id
        );

        expect(result.applied).toBe(true);
        expect(result.eventId).toBe(event.id);
        expect(result.choiceId).toBe(choice.id);
        expect(result.next.shopGold).toBeGreaterThanOrEqual(0);
        expect(chooseRunEventOption({ shopGold: 1, lives: 3, relicFavorProgress: 0 }, event, 'missing').applied).toBe(false);
    });
});

import { describe, expect, it } from 'vitest';
import { GAME_RULES_VERSION } from './contracts';
import { createRunMapState, chooseRunMapNode, generateRunMapChoices } from './run-map';

describe('REG-069 run map route nodes', () => {
    it('generates deterministic local route choices with shop hooks', () => {
        const a = generateRunMapChoices({ runSeed: 69_001, rulesVersion: GAME_RULES_VERSION, currentFloor: 2 });
        const b = generateRunMapChoices({ runSeed: 69_001, rulesVersion: GAME_RULES_VERSION, currentFloor: 2 });

        expect(a).toEqual(b);
        expect(a.map((node) => node.kind)).toEqual(['combat', 'shop', 'event']);
        expect(a[1]).toMatchObject({
            label: 'Vendor alcove',
            offlineOnly: true,
            unlocksSystems: ['REG-015', 'REG-070', 'REG-071']
        });
    });

    it('tracks selected node without mutating generated options', () => {
        const state = createRunMapState(42, GAME_RULES_VERSION, 3);
        const selected = chooseRunMapNode(state, state.nextNodes[1]!.id);

        expect(state.selectedNodeId).toBeNull();
        expect(selected.selectedNodeId).toBe(state.nextNodes[1]!.id);
        expect(chooseRunMapNode(state, 'missing')).toBe(state);
    });

    it('surfaces deterministic treasure and secret hooks on the route map', () => {
        const treasure = generateRunMapChoices({ runSeed: 75_001, rulesVersion: GAME_RULES_VERSION, currentFloor: 3 });
        const secret = generateRunMapChoices({ runSeed: 75_001, rulesVersion: GAME_RULES_VERSION, currentFloor: 6 });

        expect(treasure.map((node) => node.kind)).toContain('treasure');
        expect(treasure.find((node) => node.kind === 'treasure')).toMatchObject({
            label: 'Treasure gallery',
            unlocksSystems: ['REG-017', 'REG-069', 'REG-075']
        });
        expect(secret.find((node) => node.kind === 'event')?.detail).toContain('secret-room hook');
    });
});

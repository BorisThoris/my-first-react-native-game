import { describe, expect, it } from 'vitest';
import {
    getPrototypeSandboxDefinitions,
    resolveCatalystAltarPrototype,
    resolveLoadedGatewayPrototype,
    resolveMimicCachePrototype,
    resolveOmenPrototype,
    resolveParasiteVesselPrototype,
    resolvePinLatticePrototype
} from './prototype-sandbox';
import { assertTokenCoverage } from './mechanic-feedback';

describe('prototype sandbox mechanics', () => {
    it('keeps every promoted prototype sandbox-only with visible telegraph and token coverage', () => {
        const definitions = getPrototypeSandboxDefinitions();

        expect(definitions.map((definition) => definition.id)).toEqual([
            'omen_event',
            'mimic_cache',
            'anchor_seal',
            'loaded_gateway',
            'catalyst_altar',
            'parasite_vessel',
            'pin_lattice'
        ]);
        expect(definitions.every((definition) => definition.sandboxOnly)).toBe(true);
        expect(definitions.every((definition) => definition.telegraph.length > 20)).toBe(true);
        expect(definitions.every((definition) => definition.counterplay.length > 20)).toBe(true);
        expect(definitions.every((definition) => assertTokenCoverage(definition.tokens))).toBe(true);
    });

    it('keeps omen markers persistent until cleanup resolves the target pair', () => {
        expect(resolveOmenPrototype({ targetPairKey: 'A', resolvedPairKeys: [] })).toEqual({
            markerVisible: true,
            cleanupComplete: false
        });
        expect(resolveOmenPrototype({ targetPairKey: 'A', resolvedPairKeys: ['A'] })).toEqual({
            markerVisible: false,
            cleanupComplete: true
        });
    });

    it('blocks mimic punishment without a tell and separates control from forfeit', () => {
        expect(resolveMimicCachePrototype({ telegraphed: false, scouted: false, disarmed: false, destroyed: false })).toBe(
            'blocked_no_tell'
        );
        expect(resolveMimicCachePrototype({ telegraphed: true, scouted: false, disarmed: false, destroyed: true })).toBe(
            'forfeit_safe'
        );
        expect(resolveMimicCachePrototype({ telegraphed: true, scouted: true, disarmed: false, destroyed: false })).toBe(
            'clean_loot'
        );
    });

    it('keeps loaded gateway deterministic and catalyst/parasite values bounded', () => {
        expect(resolveLoadedGatewayPrototype('known', 1)).toMatchObject({ routePlanDeterministic: true, routeRisk: 'safe' });
        expect(resolveLoadedGatewayPrototype('unknown', 2)).toMatchObject({ routePlanDeterministic: true, routeRisk: 'mystery' });
        expect(resolveCatalystAltarPrototype(3, 2)).toEqual({
            canSpend: true,
            nextShards: 1,
            payoff: 'upgraded_reward'
        });
        expect(resolveCatalystAltarPrototype(1, 2)).toMatchObject({ canSpend: false, nextShards: 1 });
        expect(resolveParasiteVesselPrototype(2)).toEqual({ nextPressure: 1, converted: true });
        expect(resolveParasiteVesselPrototype(0)).toEqual({ nextPressure: 0, converted: false });
    });

    it('requires deliberate pin relation for Pin Lattice payoff', () => {
        expect(resolvePinLatticePrototype({ pinnedTileIds: ['a', 'b'], matchedTileIds: ['a', 'b'] })).toEqual({
            validPlanningReward: true,
            refundMarkers: 1
        });
        expect(resolvePinLatticePrototype({ pinnedTileIds: ['a'], matchedTileIds: ['a', 'b'] })).toEqual({
            validPlanningReward: false,
            refundMarkers: 0
        });
    });
});

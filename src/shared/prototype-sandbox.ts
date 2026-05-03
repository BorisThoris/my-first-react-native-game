import type { MechanicTokenId } from './mechanic-feedback';

export type PrototypeSandboxId =
    | 'omen_event'
    | 'mimic_cache'
    | 'anchor_seal'
    | 'loaded_gateway'
    | 'catalyst_altar'
    | 'parasite_vessel'
    | 'pin_lattice';

export interface PrototypeSandboxDefinition {
    id: PrototypeSandboxId;
    label: string;
    sandboxOnly: true;
    telegraph: string;
    counterplay: string;
    consequence: string;
    tokens: MechanicTokenId[];
}

export const PROTOTYPE_SANDBOX_DEFINITIONS: Record<PrototypeSandboxId, PrototypeSandboxDefinition> = {
    omen_event: {
        id: 'omen_event',
        label: 'Omen Event',
        sandboxOnly: true,
        telegraph: 'Marks one future pair and keeps the warning visible until that pair resolves.',
        counterplay: 'Remember or scout the marked pair before committing to risky clears.',
        consequence: 'Resolving the marked pair removes the omen marker and pays the shown branch.',
        tokens: ['hidden_known', 'objective', 'risk', 'reward']
    },
    mimic_cache: {
        id: 'mimic_cache',
        label: 'Mimic Cache',
        sandboxOnly: true,
        telegraph: 'Route copy announces a suspicious cache before any trap branch can punish.',
        counterplay: 'Scout, peek, disarm, or destroy for safety while accepting the visible forfeit.',
        consequence: 'Clean control turns suspicion into loot; blind claiming triggers the armed branch.',
        tokens: ['risk', 'reward', 'armed', 'hidden_known', 'forfeit']
    },
    anchor_seal: {
        id: 'anchor_seal',
        label: 'Anchor Seal',
        sandboxOnly: true,
        telegraph: 'Shows the exact pressure target that can be frozen for one resolve.',
        counterplay: 'Spend the seal only when freezing the target protects a real plan.',
        consequence: 'The sealed target is resolved once, then normal pressure resumes.',
        tokens: ['safe', 'cost', 'resolved', 'risk']
    },
    loaded_gateway: {
        id: 'loaded_gateway',
        label: 'Loaded Gateway',
        sandboxOnly: true,
        telegraph: 'Offers one known route branch and one higher-variance unknown branch.',
        counterplay: 'Choose known safety or accept deterministic risk for higher reward.',
        consequence: 'The chosen branch creates a normal completable route plan.',
        tokens: ['risk', 'reward', 'hidden_known', 'cost']
    },
    catalyst_altar: {
        id: 'catalyst_altar',
        label: 'Catalyst Altar',
        sandboxOnly: true,
        telegraph: 'Shows shard cost and upgraded reward before spend.',
        counterplay: 'Spend only when the reward protects objective or engine momentum.',
        consequence: 'Shard spend is capped and cannot overdraw the engine.',
        tokens: ['cost', 'reward', 'momentum', 'objective']
    },
    parasite_vessel: {
        id: 'parasite_vessel',
        label: 'Parasite Vessel',
        sandboxOnly: true,
        telegraph: 'Shows current parasite pressure and conversion result before activation.',
        counterplay: 'Convert visible pressure into bounded value before life loss timing becomes dangerous.',
        consequence: 'Pressure is reduced by a fixed amount and pays a small controlled reward.',
        tokens: ['risk', 'reward', 'momentum', 'objective']
    },
    pin_lattice: {
        id: 'pin_lattice',
        label: 'Pin Lattice',
        sandboxOnly: true,
        telegraph: 'Shows that only pinned planned pairs can refund pin value.',
        counterplay: 'Pin deliberately; random board marking does not qualify.',
        consequence: 'A valid pinned-pair match grants one limited refund marker.',
        tokens: ['hidden_known', 'momentum', 'cost', 'build']
    }
};

export const getPrototypeSandboxDefinitions = (): PrototypeSandboxDefinition[] =>
    Object.values(PROTOTYPE_SANDBOX_DEFINITIONS);

export interface OmenPrototypeState {
    targetPairKey: string | null;
    resolvedPairKeys: readonly string[];
}

export const resolveOmenPrototype = (state: OmenPrototypeState): { markerVisible: boolean; cleanupComplete: boolean } => {
    const cleanupComplete = state.targetPairKey != null && state.resolvedPairKeys.includes(state.targetPairKey);
    return {
        markerVisible: state.targetPairKey != null && !cleanupComplete,
        cleanupComplete
    };
};

export const resolveMimicCachePrototype = ({
    telegraphed,
    scouted,
    disarmed,
    destroyed
}: {
    telegraphed: boolean;
    scouted: boolean;
    disarmed: boolean;
    destroyed: boolean;
}): 'blocked_no_tell' | 'forfeit_safe' | 'clean_loot' | 'armed_risk' => {
    if (!telegraphed) return 'blocked_no_tell';
    if (destroyed) return 'forfeit_safe';
    if (scouted || disarmed) return 'clean_loot';
    return 'armed_risk';
};

export const resolveLoadedGatewayPrototype = (
    branch: 'known' | 'unknown',
    seed: number
): { branch: 'known' | 'unknown'; routePlanDeterministic: true; routeRisk: 'safe' | 'mystery' | 'greed' } => ({
    branch,
    routePlanDeterministic: true,
    routeRisk: branch === 'known' ? 'safe' : seed % 2 === 0 ? 'mystery' : 'greed'
});

export const resolveCatalystAltarPrototype = (
    currentShards: number,
    cost: number
): { canSpend: boolean; nextShards: number; payoff: 'upgraded_reward' | 'blocked' } => {
    const canSpend = currentShards >= cost && cost > 0;
    return {
        canSpend,
        nextShards: canSpend ? currentShards - cost : currentShards,
        payoff: canSpend ? 'upgraded_reward' : 'blocked'
    };
};

export const resolveParasiteVesselPrototype = (
    parasitePressure: number
): { nextPressure: number; converted: boolean } => ({
    nextPressure: Math.max(0, parasitePressure - 1),
    converted: parasitePressure > 0
});

export const resolvePinLatticePrototype = ({
    pinnedTileIds,
    matchedTileIds
}: {
    pinnedTileIds: readonly string[];
    matchedTileIds: readonly string[];
}): { validPlanningReward: boolean; refundMarkers: number } => {
    const matchedPins = matchedTileIds.filter((id) => pinnedTileIds.includes(id)).length;
    const validPlanningReward = matchedPins >= 2;
    return {
        validPlanningReward,
        refundMarkers: validPlanningReward ? 1 : 0
    };
};

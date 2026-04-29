import {
    type BonusRewardId,
    type BonusRewardLedger,
    MAX_COMBO_SHARDS,
    type RunState
} from './contracts';
import { hashStringToSeed } from './rng';
import type { RunMapNodeKind } from './run-map';

export type BonusRewardRoomKind = 'treasure_chest' | 'secret_room' | 'bonus_cache';

export interface BonusRewardPayout {
    shopGold?: number;
    comboShards?: number;
    relicFavorProgress?: number;
    score?: number;
}

export interface BonusRewardDefinition {
    id: BonusRewardId;
    roomKind: BonusRewardRoomKind;
    label: string;
    trigger: string;
    discoverability: string;
    eligibility: string;
    antiGrindLimit: {
        scope: 'per_run';
        maxClaims: number;
    };
    payout: BonusRewardPayout;
    summaryText: string;
}

export interface BonusRewardInstance extends BonusRewardDefinition {
    instanceId: string;
    runSeed: number;
    rulesVersion: number;
    floor: number;
    offlineOnly: true;
    eligible: boolean;
    unavailableReason: string | null;
}

export const BONUS_REWARD_CATALOG: Record<BonusRewardId, BonusRewardDefinition> = {
    chest_gold: {
        id: 'chest_gold',
        roomKind: 'treasure_chest',
        label: 'Treasure chest',
        trigger: 'Greed route on every fifth floor or authored treasure node.',
        discoverability: 'Shown as a Treasure gallery node before entry; no hidden online roll.',
        eligibility: 'Floor 2+ and fewer than two chest-gold claims this run.',
        antiGrindLimit: { scope: 'per_run', maxClaims: 2 },
        payout: { shopGold: 2, score: 25 },
        summaryText: '+2 shop gold and +25 score.'
    },
    secret_favor: {
        id: 'secret_favor',
        roomKind: 'secret_room',
        label: 'Secret shrine',
        trigger: 'Deterministic seed roll from a mystery or treasure-adjacent route.',
        discoverability: 'Foreshadowed as a cracked wall note in node copy; one secret per run.',
        eligibility: 'Floor 3+ and no secret room already discovered this run.',
        antiGrindLimit: { scope: 'per_run', maxClaims: 1 },
        payout: { relicFavorProgress: 1 },
        summaryText: '+1 relic Favor progress.'
    },
    bonus_shards: {
        id: 'bonus_shards',
        roomKind: 'bonus_cache',
        label: 'Bonus cache',
        trigger: 'Breather/treasure side room after a clean route choice.',
        discoverability: 'Displayed as a bonus cache reward row on eligible local nodes.',
        eligibility: 'Floor 2+ and fewer than two shard cache claims this run.',
        antiGrindLimit: { scope: 'per_run', maxClaims: 2 },
        payout: { comboShards: 1 },
        summaryText: '+1 combo shard, capped by the run shard limit.'
    }
};

export const createBonusRewardLedger = (): BonusRewardLedger => ({
    claimedInstanceIds: [],
    claimedRewardIds: {},
    discoveredSecretRooms: 0,
    openedTreasureRooms: 0
});

const rewardIdsForRouteKind = (routeKind: RunMapNodeKind | 'unknown'): BonusRewardId[] => {
    if (routeKind === 'treasure') {
        return ['chest_gold', 'secret_favor', 'bonus_shards'];
    }
    if (routeKind === 'event') {
        return ['secret_favor', 'bonus_shards', 'chest_gold'];
    }
    return ['bonus_shards', 'chest_gold', 'secret_favor'];
};

const rewardCount = (ledger: BonusRewardLedger, id: BonusRewardId): number => ledger.claimedRewardIds[id] ?? 0;

const isEligible = (definition: BonusRewardDefinition, floor: number, ledger: BonusRewardLedger): string | null => {
    if (floor < 2) {
        return 'Bonus rooms unlock after floor 1.';
    }
    if (definition.id === 'secret_favor' && floor < 3) {
        return 'Secret shrines unlock after floor 2.';
    }
    if (definition.roomKind === 'secret_room' && ledger.discoveredSecretRooms >= 1) {
        return 'Secret room already discovered this run.';
    }
    if (rewardCount(ledger, definition.id) >= definition.antiGrindLimit.maxClaims) {
        return `${definition.label} claim limit reached for this run.`;
    }
    return null;
};

export const rollBonusRewardRoom = ({
    runSeed,
    rulesVersion,
    floor,
    routeKind = 'unknown',
    ledger = createBonusRewardLedger()
}: {
    runSeed: number;
    rulesVersion: number;
    floor: number;
    routeKind?: RunMapNodeKind | 'unknown';
    ledger?: BonusRewardLedger;
}): BonusRewardInstance => {
    const candidates = rewardIdsForRouteKind(routeKind);
    const seed = hashStringToSeed(`bonusReward:${rulesVersion}:${runSeed}:${floor}:${routeKind}`);
    const rewardId = routeKind === 'treasure' ? candidates[0]! : candidates[Math.abs(seed) % candidates.length]!;
    const definition = BONUS_REWARD_CATALOG[rewardId];
    const unavailableReason = isEligible(definition, floor, ledger);
    return {
        ...definition,
        instanceId: `${rulesVersion}:${runSeed}:${floor}:${definition.id}`,
        runSeed,
        rulesVersion,
        floor,
        offlineOnly: true,
        eligible: unavailableReason === null,
        unavailableReason
    };
};

const gainFavor = (run: RunState, progress: number): RunState => {
    const total = run.relicFavorProgress + progress;
    const bonusPicks = Math.floor(total / 3);
    return {
        ...run,
        bonusRelicPicksNextOffer: run.bonusRelicPicksNextOffer + bonusPicks,
        favorBonusRelicPicksNextOffer: run.favorBonusRelicPicksNextOffer + bonusPicks,
        relicFavorProgress: total % 3
    };
};

export interface BonusRewardClaimResult {
    run: RunState;
    ledger: BonusRewardLedger;
    claimed: boolean;
    rewardId: BonusRewardId;
    reason?: 'ineligible' | 'already_claimed';
}

export const claimBonusReward = (
    run: RunState,
    ledger: BonusRewardLedger,
    reward: BonusRewardInstance
): BonusRewardClaimResult => {
    if (ledger.claimedInstanceIds.includes(reward.instanceId)) {
        return { run, ledger, claimed: false, rewardId: reward.id, reason: 'already_claimed' };
    }
    if (!reward.eligible) {
        return { run, ledger, claimed: false, rewardId: reward.id, reason: 'ineligible' };
    }

    let nextRun: RunState = {
        ...run,
        shopGold: run.shopGold + (reward.payout.shopGold ?? 0),
        stats: {
            ...run.stats,
            totalScore: run.stats.totalScore + (reward.payout.score ?? 0),
            currentLevelScore: run.stats.currentLevelScore + (reward.payout.score ?? 0),
            comboShards: Math.min(MAX_COMBO_SHARDS, run.stats.comboShards + (reward.payout.comboShards ?? 0))
        }
    };
    if (reward.payout.relicFavorProgress) {
        nextRun = gainFavor(nextRun, reward.payout.relicFavorProgress);
    }

    return {
        run: nextRun,
        ledger: {
            claimedInstanceIds: [...ledger.claimedInstanceIds, reward.instanceId],
            claimedRewardIds: {
                ...ledger.claimedRewardIds,
                [reward.id]: rewardCount(ledger, reward.id) + 1
            },
            discoveredSecretRooms:
                ledger.discoveredSecretRooms + (reward.roomKind === 'secret_room' ? 1 : 0),
            openedTreasureRooms:
                ledger.openedTreasureRooms + (reward.roomKind === 'treasure_chest' ? 1 : 0)
        },
        claimed: true,
        rewardId: reward.id
    };
};

export const getBonusRewardRows = () =>
    Object.values(BONUS_REWARD_CATALOG).map((reward) => ({
        id: reward.id,
        roomKind: reward.roomKind,
        label: reward.label,
        trigger: reward.trigger,
        eligibility: reward.eligibility,
        antiGrindLimit: `${reward.antiGrindLimit.maxClaims} per run`,
        summaryText: reward.summaryText
    }));

import { GAME_RULES_VERSION, type DungeonRunNodeKind, type MutatorId } from './contracts';
import { buildBoard, countFindablePairs } from './board-generation';
import { getShopGoldRewardForFloor, SHOP_ITEM_CATALOG } from './shop-rules';
import { pickFloorScheduleEntry, usesEndlessFloorSchedule } from './floor-mutator-schedule';
import { RELIC_DRAFT, RELIC_POOL, type RelicDraftRarity } from './relics';

export interface BalanceSimulationInput {
    seeds?: readonly number[];
    seed?: number;
    floors: number;
    rulesVersion?: number;
}

export interface BalanceSimulationRow {
    key: string;
    label: string;
    value: number;
    targetMin: number;
    targetMax: number;
    status: 'within_range' | 'below_range' | 'above_range';
    source: string;
}

export interface BalanceSimulationReport {
    rulesVersion: number;
    seeds: number[];
    floors: number;
    offlineOnly: true;
    samples: Array<{
        seed: number;
        floor: number;
        shopGoldEarned: number;
        findablePickupPairs: number;
        floorTag: string;
        dungeonNodeKind: DungeonRunNodeKind;
        shopSinkBudget: number;
        enemyThreatPairs: number;
        movingEnemyHazards: number;
        bossMovingEnemyHazards: number;
        contactRisk: number;
        floorBand: 'early' | 'mid' | 'late';
        relicFavorPotential: number;
        comboShardPotential: number;
        guardRewardPotential: number;
        relicOfferAvailable: number;
        consumableRewardPotential: number;
        treasureRewardPairs: number;
    }>;
    aggregate: {
        totalShopGoldEarned: number;
        findablePickupPairs: number;
        bossFloors: number;
        breatherFloors: number;
        eliteFloors: number;
        enemyThreatPairs: number;
        movingEnemyHazards: number;
        bossMovingEnemyHazards: number;
        contactRisk: number;
        shopSinkBudget: number;
        relicFavorPotential: number;
        comboShardPotential: number;
        guardRewardPotential: number;
        relicOfferAvailable: number;
        consumableRewardPotential: number;
        treasureRewardPairs: number;
    };
    rows: BalanceSimulationRow[];
    notes: string[];
}

const statusFor = (value: number, targetMin: number, targetMax: number): BalanceSimulationRow['status'] =>
    value < targetMin ? 'below_range' : value > targetMax ? 'above_range' : 'within_range';

const row = (
    key: string,
    label: string,
    value: number,
    targetMin: number,
    targetMax: number,
    source: string
): BalanceSimulationRow => ({
    key,
    label,
    value,
    targetMin,
    targetMax,
    status: statusFor(value, targetMin, targetMax),
    source
});

const scheduleMutatorsFor = (seed: number, rulesVersion: number, level: number): MutatorId[] => {
    if (!usesEndlessFloorSchedule('endless', rulesVersion)) {
        return [];
    }
    return pickFloorScheduleEntry(seed, rulesVersion, level, 'endless').mutators;
};

const average = (values: readonly number[]): number =>
    values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

const relicRarityShare = (rarity: RelicDraftRarity): number => {
    const total = RELIC_POOL.reduce((sum, id) => sum + RELIC_DRAFT[id].weight, 0);
    const rarityTotal = RELIC_POOL
        .filter((id) => RELIC_DRAFT[id].rarity === rarity)
        .reduce((sum, id) => sum + RELIC_DRAFT[id].weight, 0);
    return total === 0 ? 0 : rarityTotal / total;
};

const simulationNodeKindForFloor = (floor: number, floorTag: string): DungeonRunNodeKind => {
    if (floorTag === 'boss') return 'boss';
    if (floorTag === 'breather') return floor % 3 === 0 ? 'shop' : 'rest';
    if (floor % 5 === 0) return 'trap';
    if (floor % 2 === 0) return 'elite';
    return 'combat';
};

const floorBandFor = (floor: number): 'early' | 'mid' | 'late' =>
    floor <= 4 ? 'early' : floor <= 8 ? 'mid' : 'late';

const uniquePairCount = <T>(items: readonly T[], keyFor: (item: T) => string | null): number =>
    new Set(items.map(keyFor).filter((key): key is string => key != null)).size;

export const runBalanceSimulation = ({
    seeds,
    seed,
    floors,
    rulesVersion = GAME_RULES_VERSION
}: BalanceSimulationInput): BalanceSimulationReport => {
    const safeFloors = Math.max(1, Math.floor(floors));
    const safeSeeds = seeds && seeds.length > 0 ? [...seeds] : [seed ?? 0];
    const floorNumbers = Array.from({ length: safeFloors }, (_, index) => index + 1);
    const shopSinkPerVisit = Object.values(SHOP_ITEM_CATALOG).reduce((sum, item) => sum + item.baseCost, 0);
    const samples = safeSeeds.flatMap((sampleSeed) =>
        floorNumbers.map((floor) => {
            const schedule = pickFloorScheduleEntry(sampleSeed, rulesVersion, floor, 'endless');
            const dungeonNodeKind = simulationNodeKindForFloor(floor, schedule.floorTag);
            const board = buildBoard(floor, {
                runSeed: sampleSeed,
                runRulesVersion: rulesVersion,
                floorTag: schedule.floorTag,
                floorArchetypeId: schedule.floorArchetypeId,
                dungeonNodeKind,
                gameMode: 'endless',
                activeMutators: scheduleMutatorsFor(sampleSeed, rulesVersion, floor)
            });
            const activeHazards = board.enemyHazards?.filter((hazard) => hazard.state !== 'defeated') ?? [];
            const enemyThreatPairs = new Set(
                board.tiles
                    .filter((tile) => tile.dungeonCardKind === 'enemy' || tile.dungeonCardKind === 'trap')
                    .map((tile) => tile.pairKey)
            ).size;
            const treasureRewardPairs = uniquePairCount(
                board.tiles,
                (tile) => (tile.dungeonCardKind === 'treasure' || tile.dungeonCardKind === 'lock' ? tile.pairKey : null)
            );
            const keyPairs = uniquePairCount(board.tiles, (tile) => (tile.dungeonCardKind === 'key' ? tile.pairKey : null));
            const shrinePairs = uniquePairCount(
                board.tiles,
                (tile) => (tile.dungeonCardKind === 'shrine' ? tile.pairKey : null)
            );
            const routeRewardPairs = uniquePairCount(
                board.tiles,
                (tile) => (tile.routeCardKind || tile.routeSpecialKind ? tile.pairKey : null)
            );
            return {
                seed: sampleSeed,
                floor,
                shopGoldEarned: getShopGoldRewardForFloor(floor),
                findablePickupPairs: countFindablePairs(board.tiles),
                floorTag: schedule.floorTag,
                dungeonNodeKind,
                shopSinkBudget: floor % 3 === 0 ? shopSinkPerVisit : 0,
                enemyThreatPairs,
                movingEnemyHazards: activeHazards.length,
                bossMovingEnemyHazards: activeHazards.filter((hazard) => hazard.bossId != null).length,
                contactRisk: activeHazards.reduce((sum, hazard) => sum + hazard.damage, 0),
                floorBand: floorBandFor(floor),
                relicFavorPotential: schedule.featuredObjectiveId != null ? (schedule.floorTag === 'boss' ? 2 : 1) : 0,
                comboShardPotential: countFindablePairs(board.tiles) + (routeRewardPairs > 0 ? 1 : 0),
                guardRewardPotential: shrinePairs + (dungeonNodeKind === 'rest' ? 1 : 0),
                relicOfferAvailable: floor >= 3 && floor % 3 === 0 ? 1 : 0,
                consumableRewardPotential: keyPairs + (floor % 3 === 0 ? SHOP_ITEM_CATALOG.peek_charge.stock : 0),
                treasureRewardPairs
            };
        })
    );
    const shopGoldBySeed = safeSeeds.map(() =>
        floorNumbers.reduce((sum, floor) => sum + getShopGoldRewardForFloor(floor), 0)
    );
    const shopVisits = floorNumbers.filter((floor) => floor % 3 === 0).length;
    const findableCounts = samples.map((sample) => sample.findablePickupPairs);
    const bossFloors = safeSeeds.flatMap((seed) =>
        floorNumbers.map((floor) => pickFloorScheduleEntry(seed, rulesVersion, floor, 'endless').floorTag === 'boss' ? 1 : 0)
    );
    const movingHazardCounts = samples.map((sample) => sample.movingEnemyHazards);
    const contactRiskCounts = samples.map((sample) => sample.contactRisk);
    const rewardTotalsByBand = samples.reduce<Record<'early' | 'mid' | 'late', number>>(
        (totals, sample) => ({
            ...totals,
            [sample.floorBand]:
                totals[sample.floorBand] +
                sample.shopGoldEarned +
                sample.relicFavorPotential +
                sample.comboShardPotential +
                sample.guardRewardPotential +
                sample.consumableRewardPotential +
                sample.treasureRewardPairs
        }),
        { early: 0, mid: 0, late: 0 }
    );

    const rows = [
        row(
            'avg_shop_gold_per_seed',
            'Average shop gold earned per simulated seed',
            Number(average(shopGoldBySeed).toFixed(2)),
            safeFloors * 3,
            safeFloors * 8,
            'getShopGoldRewardForFloor'
        ),
        row(
            'shop_sink_pressure',
            'Shop sink total per simulated shop visit',
            shopSinkPerVisit * shopVisits,
            shopVisits * 4,
            shopVisits * 8,
            'SHOP_ITEM_CATALOG baseCost'
        ),
        row(
            'avg_findable_pairs_per_floor',
            'Average pickup pairs per floor',
            Number(average(findableCounts).toFixed(2)),
            1,
            2,
            'buildBoard/countFindablePairs'
        ),
        row(
            'boss_floor_share',
            'Boss floor share in schedule sample',
            Number(average(bossFloors).toFixed(2)),
            0.1,
            0.25,
            'pickFloorScheduleEntry'
        ),
        row(
            'avg_moving_enemy_hazards_per_floor',
            'Average moving enemy patrol overlays per floor',
            Number(average(movingHazardCounts).toFixed(2)),
            0.6,
            1.6,
            'buildBoard enemyHazards'
        ),
        row(
            'avg_contact_risk_per_floor',
            'Average moving enemy contact damage per floor',
            Number(average(contactRiskCounts).toFixed(2)),
            0.6,
            1.6,
            'EnemyHazardState damage'
        ),
        row(
            'elite_route_node_share',
            'Elite route node share in simulation sample',
            Number(average(samples.map((sample) => (sample.dungeonNodeKind === 'elite' ? 1 : 0))).toFixed(2)),
            0.15,
            0.35,
            'simulationNodeKindForFloor'
        ),
        row(
            'rare_relic_weight_share',
            'Rare relic draft weight share',
            Number(relicRarityShare('rare').toFixed(2)),
            0.1,
            0.25,
            'RELIC_DRAFT weights'
        ),
        row(
            'avg_relic_favor_potential_per_floor',
            'Average featured-objective Favor potential per floor',
            Number(average(samples.map((sample) => sample.relicFavorPotential)).toFixed(2)),
            0.4,
            1.2,
            'featured objective schedule'
        ),
        row(
            'avg_combo_shard_potential_per_floor',
            'Average combo shard potential per floor',
            Number(average(samples.map((sample) => sample.comboShardPotential)).toFixed(2)),
            1,
            3,
            'findables and route reward pairs'
        ),
        row(
            'avg_guard_reward_potential_per_floor',
            'Average guard reward potential per floor',
            Number(average(samples.map((sample) => sample.guardRewardPotential)).toFixed(2)),
            0.1,
            1.5,
            'shrine pairs and rest nodes'
        ),
        row(
            'relic_offer_cadence',
            'Relic offer cadence per simulated seed',
            Number(average(safeSeeds.map(() => floorNumbers.filter((floor) => floor >= 3 && floor % 3 === 0).length)).toFixed(2)),
            Math.floor(safeFloors / 4),
            Math.ceil(safeFloors / 2),
            'relic milestone cadence'
        ),
        row(
            'avg_consumable_reward_potential_per_floor',
            'Average consumable reward potential per floor',
            Number(average(samples.map((sample) => sample.consumableRewardPotential)).toFixed(2)),
            0.2,
            2,
            'key cards and shop stock'
        ),
        row(
            'avg_treasure_reward_pairs_per_floor',
            'Average treasure/cache pairs per floor',
            Number(average(samples.map((sample) => sample.treasureRewardPairs)).toFixed(2)),
            0.1,
            2,
            'treasure and lock card pairs'
        ),
        row(
            'reward_band_spread',
            'Reward-source spread across early/mid/late bands',
            Number((Math.min(...Object.values(rewardTotalsByBand)) / Math.max(1, Math.max(...Object.values(rewardTotalsByBand)))).toFixed(2)),
            0.35,
            1,
            'floor-band reward totals'
        )
    ];

    return {
        rulesVersion,
        seeds: safeSeeds,
        floors: safeFloors,
        offlineOnly: true,
        samples,
        aggregate: {
            totalShopGoldEarned: samples.reduce((sum, sample) => sum + sample.shopGoldEarned, 0),
            findablePickupPairs: samples.reduce((sum, sample) => sum + sample.findablePickupPairs, 0),
            bossFloors: samples.filter((sample) => sample.floorTag === 'boss').length,
            breatherFloors: samples.filter((sample) => sample.floorTag === 'breather').length,
            eliteFloors: samples.filter((sample) => sample.dungeonNodeKind === 'elite').length,
            enemyThreatPairs: samples.reduce((sum, sample) => sum + sample.enemyThreatPairs, 0),
            movingEnemyHazards: samples.reduce((sum, sample) => sum + sample.movingEnemyHazards, 0),
            bossMovingEnemyHazards: samples.reduce((sum, sample) => sum + sample.bossMovingEnemyHazards, 0),
            contactRisk: samples.reduce((sum, sample) => sum + sample.contactRisk, 0),
            shopSinkBudget: samples.reduce((sum, sample) => sum + sample.shopSinkBudget, 0),
            relicFavorPotential: samples.reduce((sum, sample) => sum + sample.relicFavorPotential, 0),
            comboShardPotential: samples.reduce((sum, sample) => sum + sample.comboShardPotential, 0),
            guardRewardPotential: samples.reduce((sum, sample) => sum + sample.guardRewardPotential, 0),
            relicOfferAvailable: samples.reduce((sum, sample) => sum + sample.relicOfferAvailable, 0),
            consumableRewardPotential: samples.reduce((sum, sample) => sum + sample.consumableRewardPotential, 0),
            treasureRewardPairs: samples.reduce((sum, sample) => sum + sample.treasureRewardPairs, 0)
        },
        rows,
        notes: [
            'Simulation is deterministic and local-only; no leaderboard or server authority is implied.',
            'Targets are smoke-test guardrails, not final balance verdicts.'
        ]
    };
};

export const summarizeBalanceSimulation = (report: BalanceSimulationReport): string =>
    report.rows.map((entry) => `${entry.key}=${entry.value}(${entry.status})`).join('; ');

export const BALANCE_SIMULATION_BASELINE = {
    totalShopGoldEarned: { min: 95, max: 110 },
    findablePickupPairs: { min: 12, max: 24 },
    bossFloors: { min: 2, max: 2 },
    breatherFloors: { min: 3, max: 3 },
    shopSinkBudget: { min: 56, max: 56 }
} as const;

export const assertBalanceSimulationWithinBaseline = (
    report: BalanceSimulationReport,
    baseline: typeof BALANCE_SIMULATION_BASELINE
): { ok: boolean; issues: string[] } => {
    const issues = (Object.keys(baseline) as Array<keyof typeof baseline>).flatMap((key) => {
        const value = report.aggregate[key];
        const range = baseline[key];
        return value < range.min || value > range.max ? [`${key}:${value} outside ${range.min}-${range.max}`] : [];
    });
    return { ok: issues.length === 0, issues };
};

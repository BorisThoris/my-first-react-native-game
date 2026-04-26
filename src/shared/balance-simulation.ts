import { GAME_RULES_VERSION, type MutatorId } from './contracts';
import { buildBoard, countFindablePairs, getShopGoldRewardForFloor, SHOP_ITEM_CATALOG } from './game';
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
        shopSinkBudget: number;
    }>;
    aggregate: {
        totalShopGoldEarned: number;
        findablePickupPairs: number;
        bossFloors: number;
        breatherFloors: number;
        shopSinkBudget: number;
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
            return {
                seed: sampleSeed,
                floor,
                shopGoldEarned: getShopGoldRewardForFloor(floor),
                findablePickupPairs: countFindablePairs(
                    buildBoard(floor, {
                        runSeed: sampleSeed,
                        runRulesVersion: rulesVersion,
                        activeMutators: scheduleMutatorsFor(sampleSeed, rulesVersion, floor)
                    }).tiles
                ),
                floorTag: schedule.floorTag,
                shopSinkBudget: floor % 3 === 0 ? shopSinkPerVisit : 0
            };
        })
    );
    const shopGoldBySeed = safeSeeds.map(() =>
        floorNumbers.reduce((sum, floor) => sum + getShopGoldRewardForFloor(floor), 0)
    );
    const shopVisits = floorNumbers.filter((floor) => floor % 3 === 0).length;
    const findableCounts = safeSeeds.flatMap((seed) =>
        floorNumbers.map((floor) =>
            countFindablePairs(
                buildBoard(floor, {
                    runSeed: seed,
                    runRulesVersion: rulesVersion,
                    activeMutators: scheduleMutatorsFor(seed, rulesVersion, floor)
                }).tiles
            )
        )
    );
    const bossFloors = safeSeeds.flatMap((seed) =>
        floorNumbers.map((floor) => pickFloorScheduleEntry(seed, rulesVersion, floor, 'endless').floorTag === 'boss' ? 1 : 0)
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
            'rare_relic_weight_share',
            'Rare relic draft weight share',
            Number(relicRarityShare('rare').toFixed(2)),
            0.1,
            0.25,
            'RELIC_DRAFT weights'
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
            shopSinkBudget: samples.reduce((sum, sample) => sum + sample.shopSinkBudget, 0)
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
    shopSinkBudget: { min: 20, max: 24 }
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

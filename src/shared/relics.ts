/**
 * Relic **pool and milestone selection** (`RELIC_POOL`, `rollRelicOptions`, `needsRelicPick`).
 * Draft uses **rarity + weights** (`RELIC_DRAFT`) and in-repo {@link pickWeightedWithoutReplacement}.
 * Per-relic gameplay lives in `game.ts` (`applyRelicImmediate`, memorize duration, shuffle/destroy economy, parasite ward, etc.).
 *
 * Balance cross-check: `docs/BALANCE_NOTES.md` (Relic roster) — update when adding IDs or changing memorize /
 * charge numbers; `relicBalanceDoc.test.ts` guards key doc strings.
 */
import type { ContractFlags, MutatorId, RelicId, RelicOfferServiceId, RelicOfferServiceState, RunState } from './contracts';
import { pickFloorScheduleEntry, usesEndlessFloorSchedule } from './floor-mutator-schedule';
import { hashStringToSeed } from './rng';
import { pickWeightedWithoutReplacement } from './weightedPick';

/** First floor (after clear) that can trigger a relic offer. */
export const RELIC_FIRST_MILESTONE_FLOOR = 3;
/** Offer again every N floors: 3, 6, 9, 12, … */
export const RELIC_MILESTONE_STEP = 3;
/** Cap total relic picks per run (Endless scaling safety). */
export const MAX_RELIC_PICKS_PER_RUN = 12;

/** Draft rarity — affects base weight and how fast odds rise with {@link relicMilestoneIndexForFloor}. */
export type RelicDraftRarity = 'common' | 'uncommon' | 'rare';
export type RelicDraftTag =
    | 'memorize'
    | 'parasite'
    | 'shuffle'
    | 'search'
    | 'destroy'
    | 'combo'
    | 'peek'
    | 'pin'
    | 'guard'
    | 'wager'
    | 'favor'
    | 'draft';

export type RelicBuildArchetype =
    | 'memory_control'
    | 'board_control'
    | 'combo_sustain'
    | 'safe_reveal'
    | 'risk_favor'
    | 'chapter_draft';

type RelicContractForbid = keyof Pick<ContractFlags, 'noShuffle' | 'noDestroy'>;

export interface RelicDraftContext {
    isScheduledEndless: boolean;
    clearedFloor: number;
    currentMutators: MutatorId[];
    nextMutators: MutatorId[];
    activeOrAcceptedRiskWager: boolean;
    favorNearRelicPick: boolean;
    hasChapterCompass: boolean;
}

export interface RelicDraftRow {
    rarity: RelicDraftRarity;
    /** Base weight before tier scaling (tune relative odds at tier 0). */
    weight: number;
    tags: RelicDraftTag[];
    /** REG-019: player-facing build identity buckets surfaced in drafts/Codex. */
    archetypes: RelicBuildArchetype[];
    forbiddenWithContract?: RelicContractForbid[];
}

export const RELIC_BUILD_ARCHETYPE_LABELS: Record<RelicBuildArchetype, string> = {
    memory_control: 'Memory control',
    board_control: 'Board control',
    combo_sustain: 'Combo sustain',
    safe_reveal: 'Safe reveal',
    risk_favor: 'Risk / Favor',
    chapter_draft: 'Chapter draft'
};

/**
 * Single source for draft odds. Add new `RelicId` here and in `game.ts` / encyclopedia.
 * Weights are relative within a draft; tier scaling favors higher rarities in later drafts.
 */
export const RELIC_DRAFT: Record<RelicId, RelicDraftRow> = {
    extra_shuffle_charge: {
        rarity: 'common',
        weight: 100,
        tags: ['shuffle'],
        archetypes: ['board_control'],
        forbiddenWithContract: ['noShuffle']
    },
    first_shuffle_free_per_floor: {
        rarity: 'common',
        weight: 88,
        tags: ['shuffle'],
        archetypes: ['board_control'],
        forbiddenWithContract: ['noShuffle']
    },
    memorize_bonus_ms: { rarity: 'common', weight: 92, tags: ['memorize'], archetypes: ['memory_control'] },
    memorize_under_short_memorize: { rarity: 'uncommon', weight: 52, tags: ['memorize'], archetypes: ['memory_control'] },
    region_shuffle_free_first: {
        rarity: 'common',
        weight: 85,
        tags: ['shuffle'],
        archetypes: ['board_control'],
        forbiddenWithContract: ['noShuffle']
    },
    destroy_bank_plus_one: {
        rarity: 'uncommon',
        weight: 55,
        tags: ['destroy'],
        archetypes: ['board_control'],
        forbiddenWithContract: ['noDestroy']
    },
    combo_shard_plus_step: {
        rarity: 'uncommon',
        weight: 48,
        tags: ['combo', 'parasite'],
        archetypes: ['combo_sustain']
    },
    parasite_ward_once: { rarity: 'rare', weight: 28, tags: ['parasite'], archetypes: ['combo_sustain'] },
    peek_charge_plus_one: { rarity: 'uncommon', weight: 50, tags: ['peek', 'wager'], archetypes: ['safe_reveal', 'risk_favor'] },
    stray_charge_plus_one: { rarity: 'rare', weight: 26, tags: ['search'], archetypes: ['safe_reveal'] },
    pin_cap_plus_one: { rarity: 'rare', weight: 24, tags: ['pin'], archetypes: ['safe_reveal'] },
    guard_token_plus_one: {
        rarity: 'rare',
        weight: 30,
        tags: ['guard', 'parasite', 'wager'],
        archetypes: ['combo_sustain', 'risk_favor']
    },
    shrine_echo: { rarity: 'uncommon', weight: 36, tags: ['favor', 'wager'], archetypes: ['risk_favor'] },
    chapter_compass: { rarity: 'uncommon', weight: 34, tags: ['draft'], archetypes: ['chapter_draft'] },
    wager_surety: { rarity: 'rare', weight: 22, tags: ['wager'], archetypes: ['risk_favor'] },
    parasite_ledger: { rarity: 'uncommon', weight: 38, tags: ['parasite'], archetypes: ['combo_sustain', 'chapter_draft'] }
};

/** Stable iteration order for docs / balance checks. */
export const RELIC_POOL: RelicId[] = (Object.keys(RELIC_DRAFT) as RelicId[]).sort((a, b) => a.localeCompare(b));

const RELIC_SYNERGY_RULES_VERSION = 14;
const ENDLESS_SYNERGY_RELICS = new Set<RelicId>(['chapter_compass', 'wager_surety', 'parasite_ledger']);
const SHORT_MEMORIZE_RELICS = new Set<RelicId>(['memorize_under_short_memorize', 'memorize_bonus_ms']);
const PARASITE_RELICS = new Set<RelicId>([
    'parasite_ward_once',
    'combo_shard_plus_step',
    'guard_token_plus_one',
    'parasite_ledger'
]);
const SHUFFLE_SEARCH_RELICS = new Set<RelicId>([
    'extra_shuffle_charge',
    'first_shuffle_free_per_floor',
    'region_shuffle_free_first',
    'stray_charge_plus_one'
]);
const ANCHOR_SPOTLIGHT_RELICS = new Set<RelicId>(['pin_cap_plus_one', 'peek_charge_plus_one']);
const WAGER_RELICS = new Set<RelicId>([
    'shrine_echo',
    'guard_token_plus_one',
    'peek_charge_plus_one',
    'wager_surety'
]);

const hasAnyMutator = (mutators: readonly MutatorId[], ids: readonly MutatorId[]): boolean =>
    ids.some((id) => mutators.includes(id));

const contextHasAnyMutator = (context: RelicDraftContext, ids: readonly MutatorId[]): boolean =>
    hasAnyMutator(context.currentMutators, ids) || hasAnyMutator(context.nextMutators, ids);

const isScheduledEndlessDraftRun = (run: RunState): boolean =>
    usesEndlessFloorSchedule(run.gameMode, run.runRulesVersion) &&
    !run.wildMenuRun &&
    run.board?.floorArchetypeId != null;

const tierWeightScale = (rarity: RelicDraftRarity, tierIndex: number): number => {
    const t = Math.max(0, tierIndex);
    switch (rarity) {
        case 'common':
            return 1;
        case 'uncommon':
            return 1 + t * 0.14;
        case 'rare':
            return 1 + t * 0.32;
        default:
            return 1;
    }
};

/** Effective draft weight for one relic at a milestone tier (higher tier → relatively stronger rares). */
export const effectiveRelicDraftWeight = (id: RelicId, tierIndex: number): number => {
    const row = RELIC_DRAFT[id];
    return row.weight * tierWeightScale(row.rarity, tierIndex);
};

export const getRelicDraftRow = (id: RelicId): RelicDraftRow => RELIC_DRAFT[id];

export const getRelicBuildArchetypes = (id: RelicId): RelicBuildArchetype[] => [...RELIC_DRAFT[id].archetypes];

export const getRelicArchetypeLabels = (id: RelicId): string[] =>
    getRelicBuildArchetypes(id).map((archetype) => RELIC_BUILD_ARCHETYPE_LABELS[archetype]);

export const getRelicArchetypeSummary = (id: RelicId): string =>
    getRelicArchetypeLabels(id).join(' / ');

export const getRelicBuildArchetypeSummaries = (): {
    id: RelicBuildArchetype;
    label: string;
    relicIds: RelicId[];
}[] =>
    (Object.keys(RELIC_BUILD_ARCHETYPE_LABELS) as RelicBuildArchetype[]).map((id) => ({
        id,
        label: RELIC_BUILD_ARCHETYPE_LABELS[id],
        relicIds: RELIC_POOL.filter((relicId) => RELIC_DRAFT[relicId].archetypes.includes(id))
    }));


export const getRelicDraftContext = (run: RunState, clearedFloor: number): RelicDraftContext => {
    const isScheduledEndless = isScheduledEndlessDraftRun(run);
    const nextMutators =
        isScheduledEndless
            ? pickFloorScheduleEntry(run.runSeed, run.runRulesVersion, clearedFloor + 1, run.gameMode).mutators
            : [];

    return {
        isScheduledEndless,
        clearedFloor,
        currentMutators: isScheduledEndless ? [...run.activeMutators] : [],
        nextMutators,
        activeOrAcceptedRiskWager: isScheduledEndless && run.endlessRiskWager != null,
        favorNearRelicPick: isScheduledEndless && run.relicFavorProgress >= 2,
        hasChapterCompass: run.relicIds.includes('chapter_compass')
    };
};

export const isRelicDraftEligible = (id: RelicId, run: RunState): boolean => {
    if (run.relicIds.includes(id)) {
        return false;
    }
    if (run.runRulesVersion < RELIC_SYNERGY_RULES_VERSION && ENDLESS_SYNERGY_RELICS.has(id)) {
        return false;
    }
    if (ENDLESS_SYNERGY_RELICS.has(id) && !isScheduledEndlessDraftRun(run)) {
        return false;
    }
    const forbidden = RELIC_DRAFT[id].forbiddenWithContract ?? [];
    return !forbidden.some((flag) => run.activeContract?.[flag]);
};

export const getRelicDraftReason = (id: RelicId, context: RelicDraftContext): string | null => {
    if (!context.isScheduledEndless) {
        return null;
    }
    if (context.activeOrAcceptedRiskWager && WAGER_RELICS.has(id)) {
        return 'Protects wager';
    }
    if (context.favorNearRelicPick && id === 'shrine_echo') {
        return 'Turns Favor into relic picks';
    }
    if (contextHasAnyMutator(context, ['short_memorize']) && SHORT_MEMORIZE_RELICS.has(id)) {
        return 'Answers short memorize';
    }
    if (contextHasAnyMutator(context, ['score_parasite']) && PARASITE_RELICS.has(id)) {
        return 'Checks parasite pressure';
    }
    if (
        contextHasAnyMutator(context, ['wide_recall', 'category_letters', 'sticky_fingers']) &&
        SHUFFLE_SEARCH_RELICS.has(id)
    ) {
        return 'Fits next chapter';
    }
    if (
        contextHasAnyMutator(context, ['n_back_anchor', 'shifting_spotlight']) &&
        ANCHOR_SPOTLIGHT_RELICS.has(id)
    ) {
        return 'Tracks shifting reads';
    }
    if (id === 'chapter_compass' && context.currentMutators.length + context.nextMutators.length > 0) {
        return 'Improves future chapter drafts';
    }
    return null;
};

export const getContextualRelicDraftWeight = (
    id: RelicId,
    context: RelicDraftContext,
    tierIndex: number
): number => {
    const base = effectiveRelicDraftWeight(id, tierIndex);
    if (!context.isScheduledEndless) {
        return base;
    }

    let multiplier = 1;
    if (contextHasAnyMutator(context, ['short_memorize']) && SHORT_MEMORIZE_RELICS.has(id)) {
        multiplier *= id === 'memorize_under_short_memorize' ? 3 : 1.8;
    }
    if (contextHasAnyMutator(context, ['score_parasite']) && PARASITE_RELICS.has(id)) {
        multiplier *= id === 'parasite_ledger' || id === 'parasite_ward_once' ? 3 : 1.7;
    }
    if (
        contextHasAnyMutator(context, ['wide_recall', 'category_letters', 'sticky_fingers']) &&
        SHUFFLE_SEARCH_RELICS.has(id)
    ) {
        multiplier *= 1.8;
    }
    if (
        contextHasAnyMutator(context, ['n_back_anchor', 'shifting_spotlight']) &&
        ANCHOR_SPOTLIGHT_RELICS.has(id)
    ) {
        multiplier *= id === 'pin_cap_plus_one' ? 2.4 : 2;
    }
    if (context.activeOrAcceptedRiskWager && WAGER_RELICS.has(id)) {
        multiplier *= id === 'wager_surety' ? 3 : 2;
    }
    if (context.favorNearRelicPick && id === 'shrine_echo') {
        multiplier *= 2.5;
    }
    if (id === 'chapter_compass' && getRelicDraftReason(id, context) != null) {
        multiplier *= 1.45;
    }
    if (context.hasChapterCompass && getRelicDraftReason(id, context) != null) {
        multiplier *= 1.35;
    }
    return base * multiplier;
};

export const relicDraftRarityLabel = (rarity: RelicDraftRarity): string => {
    switch (rarity) {
        case 'common':
            return 'Common';
        case 'uncommon':
            return 'Uncommon';
        case 'rare':
            return 'Rare';
        default:
            return rarity;
    }
};

/** @deprecated Older comfort/power split; draft uses {@link RELIC_DRAFT} rarities. */
export const RELIC_POOL_COMFORT: RelicId[] = RELIC_POOL.filter((id) => RELIC_DRAFT[id].rarity === 'common');

/** @deprecated Older comfort/power split; draft uses {@link RELIC_DRAFT} rarities. */
export const RELIC_POOL_POWER: RelicId[] = RELIC_POOL.filter((id) => RELIC_DRAFT[id].rarity !== 'common');

/**
 * Milestone index for a cleared floor (0 = first offer at floor 3), or null if not a milestone floor.
 */
export const relicMilestoneIndexForFloor = (clearedLevel: number): number | null => {
    if (clearedLevel < RELIC_FIRST_MILESTONE_FLOOR) {
        return null;
    }
    const delta = clearedLevel - RELIC_FIRST_MILESTONE_FLOOR;
    if (delta % RELIC_MILESTONE_STEP !== 0) {
        return null;
    }
    return delta / RELIC_MILESTONE_STEP;
};

/** @deprecated Use RELIC_FIRST_MILESTONE_FLOOR + RELIC_MILESTONE_STEP; kept for docs/tests sampling first three offers. */
export const RELIC_MILESTONE_FLOORS = [
    RELIC_FIRST_MILESTONE_FLOOR,
    RELIC_FIRST_MILESTONE_FLOOR + RELIC_MILESTONE_STEP,
    RELIC_FIRST_MILESTONE_FLOOR + RELIC_MILESTONE_STEP * 2
] as const;

const makeRng = (seed: number): (() => number) => {
    let s = seed >>> 0;
    return () => {
        s += 0x6d2b79f5;
        let x = s;
        x = Math.imul(x ^ (x >>> 15), x | 1);
        x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
};

export const needsRelicPick = (run: RunState): boolean => {
    if (run.gameMode === 'puzzle') {
        return false;
    }
    if (run.relicTiersClaimed >= MAX_RELIC_PICKS_PER_RUN) {
        return false;
    }
    if (run.status !== 'levelComplete' || !run.lastLevelResult) {
        return false;
    }
    const cleared = run.lastLevelResult.level;
    const idx = relicMilestoneIndexForFloor(cleared);
    if (idx === null) {
        return false;
    }
    return run.relicTiersClaimed <= idx && !run.relicOffer;
};

const DRAFT_OPTION_COUNT = 3;
/**
 * @param clearedFloor — level just cleared; included in RNG seed for stable options per floor.
 * @param pickRound — increments within one milestone visit when the player takes multiple relics (reroll trio).
 */
export const rollRelicOptions = (
    run: RunState,
    tierIndex: number,
    clearedFloor: number,
    pickRound: number = 0
): RelicId[] => {
    const available = RELIC_POOL.filter((id) => isRelicDraftEligible(id, run));
    if (available.length <= DRAFT_OPTION_COUNT) {
        return available.slice(0, DRAFT_OPTION_COUNT);
    }

    const seed = hashStringToSeed(`relic:${run.runSeed}:${tierIndex}:${clearedFloor}:${pickRound}`);
    const rng = makeRng(seed);
    const context = getRelicDraftContext(run, clearedFloor);
    const picked: RelicId[] = [];

    if (context.isScheduledEndless) {
        const contextualCandidates = available.filter((id) => getRelicDraftReason(id, context) != null);
        const directAnswerCandidates = contextualCandidates.filter((id) => id !== 'chapter_compass');
        const spotlightCandidates = directAnswerCandidates.length > 0 ? directAnswerCandidates : contextualCandidates;
        const spotlight = pickWeightedWithoutReplacement(
            rng,
            spotlightCandidates.map((id) => ({
                value: id,
                weight: getContextualRelicDraftWeight(id, context, tierIndex)
            })),
            1
        )[0];
        if (spotlight) {
            picked.push(spotlight);
        }
    }

    const weighted = available
        .filter((id) => !picked.includes(id))
        .map((id) => ({
            value: id,
            weight: context.isScheduledEndless
                ? getContextualRelicDraftWeight(id, context, tierIndex)
                : effectiveRelicDraftWeight(id, tierIndex)
        }));

    return [...picked, ...pickWeightedWithoutReplacement(rng, weighted, DRAFT_OPTION_COUNT - picked.length)];
};

export const getRelicDraftOptionReasons = (
    run: RunState,
    clearedFloor: number,
    options: readonly RelicId[]
): Partial<Record<RelicId, string>> | undefined => {
    const context = getRelicDraftContext(run, clearedFloor);
    if (!context.isScheduledEndless) {
        return undefined;
    }
    const reasons: Partial<Record<RelicId, string>> = {};
    for (const id of options) {
        const reason = getRelicDraftReason(id, context);
        if (reason) {
            reasons[id] = reason;
        }
    }
    return Object.keys(reasons).length > 0 ? reasons : undefined;
};

const RELIC_OFFER_SERVICE_CATALOG: Record<
    RelicOfferServiceId,
    { label: string; description: string; cost: number }
> = {
    reroll_offer: {
        label: 'Reroll offer',
        description: 'Spend shop gold to roll a fresh relic trio once this draft round.',
        cost: 2
    },
    ban_option: {
        label: 'Ban option',
        description: 'Spend shop gold to remove the first visible relic from this visit.',
        cost: 2
    },
    upgrade_offer: {
        label: 'Upgrade offer',
        description: 'Spend shop gold to bias the visible choices toward uncommon and rare relics.',
        cost: 3
    }
};

const relicOfferServiceUseCount = (run: RunState, serviceId: RelicOfferServiceId): number =>
    run.relicOffer?.serviceUses?.[serviceId] ?? 0;

export const createRelicOfferServices = (run: RunState): RelicOfferServiceState[] => {
    const offer = run.relicOffer;
    return (Object.keys(RELIC_OFFER_SERVICE_CATALOG) as RelicOfferServiceId[]).map((serviceId) => {
        const base = RELIC_OFFER_SERVICE_CATALOG[serviceId];
        let unavailableReason: string | null = null;
        if (!offer) {
            unavailableReason = 'No relic offer is open.';
        } else if (relicOfferServiceUseCount(run, serviceId) > 0) {
            unavailableReason = 'Already used this relic service during this visit.';
        } else if (run.shopGold < base.cost) {
            unavailableReason = 'Not enough shop gold.';
        } else if (serviceId === 'ban_option' && offer.options.length <= 1) {
            unavailableReason = 'Only one relic option remains.';
        } else if (serviceId === 'upgrade_offer' && offer.upgradedOffer) {
            unavailableReason = 'Offer already upgraded.';
        }
        return {
            serviceId,
            ...base,
            available: unavailableReason === null,
            unavailableReason,
            usedThisRound: relicOfferServiceUseCount(run, serviceId)
        };
    });
};

export interface RelicOfferServiceAction extends RelicOfferServiceState {
    effectPreview: string;
}

export const getRelicOfferServiceActions = (run: RunState): RelicOfferServiceAction[] =>
    createRelicOfferServices(run).map((service) => ({
        ...service,
        effectPreview:
            service.serviceId === 'reroll_offer'
                ? 'Fresh choices'
                : service.serviceId === 'ban_option'
                  ? 'Remove one option'
                  : 'Favor rare picks'
    }));

export const withRelicOfferServiceActions = <T extends RunState['relicOffer']>(run: RunState, offer: T): T =>
    offer
        ? {
              ...offer,
              services: getRelicOfferServiceActions({ ...run, relicOffer: offer })
          }
        : offer;

export interface RelicOfferServiceResult {
    run: RunState;
    applied: boolean;
    serviceId: RelicOfferServiceId;
    reason?: 'no_offer' | 'unavailable';
}

const upgradedRelicOptions = (
    run: RunState,
    tierIndex: number,
    clearedFloor: number,
    pickRound: number,
    bannedRelicIds: readonly RelicId[]
): RelicId[] => {
    const available = RELIC_POOL.filter((id) => isRelicDraftEligible(id, run) && !bannedRelicIds.includes(id));
    const preferred = available.filter((id) => RELIC_DRAFT[id].rarity !== 'common');
    const seed = hashStringToSeed(`relicUpgrade:${run.runSeed}:${tierIndex}:${clearedFloor}:${pickRound}`);
    const rng = makeRng(seed);
    const context = getRelicDraftContext(run, clearedFloor);
    const first = pickWeightedWithoutReplacement(
        rng,
        preferred.map((id) => ({
            value: id,
            weight: getContextualRelicDraftWeight(id, context, tierIndex) * 1.5
        })),
        Math.min(2, preferred.length)
    );
    const rest = pickWeightedWithoutReplacement(
        rng,
        available
            .filter((id) => !first.includes(id))
            .map((id) => ({ value: id, weight: getContextualRelicDraftWeight(id, context, tierIndex) })),
        DRAFT_OPTION_COUNT - first.length
    );
    return [...first, ...rest];
};

export const applyRelicOfferService = (
    run: RunState,
    serviceId: RelicOfferServiceId,
    targetRelicId?: RelicId
): RelicOfferServiceResult => {
    const offer = run.relicOffer;
    if (!offer || !run.lastLevelResult) {
        return { run, applied: false, serviceId, reason: 'no_offer' };
    }
    const service = createRelicOfferServices(run).find((row) => row.serviceId === serviceId);
    if (!service?.available) {
        return { run: { ...run, relicOffer: { ...offer, services: createRelicOfferServices(run) } }, applied: false, serviceId, reason: 'unavailable' };
    }
    const cleared = run.lastLevelResult.level;
    const tierIndex = relicMilestoneIndexForFloor(cleared);
    if (tierIndex === null) {
        return { run, applied: false, serviceId, reason: 'no_offer' };
    }

    const serviceUses = { ...(offer.serviceUses ?? {}), [serviceId]: relicOfferServiceUseCount(run, serviceId) + 1 };
    const bannedRelicIds = [...(offer.bannedRelicIds ?? [])];
    let pickRound = offer.pickRound;
    let upgradedOffer = offer.upgradedOffer ?? false;
    let options = [...offer.options];
    const paidRun: RunState = { ...run, shopGold: run.shopGold - service.cost };

    if (serviceId === 'ban_option') {
        const banTarget = targetRelicId && options.includes(targetRelicId) ? targetRelicId : options[0]!;
        bannedRelicIds.push(banTarget);
        options = options.filter((id) => id !== banTarget);
        if (options.length < DRAFT_OPTION_COUNT) {
            const refill = rollRelicOptions(paidRun, tierIndex, cleared, pickRound + 1).filter(
                (id) => !bannedRelicIds.includes(id) && !options.includes(id)
            );
            options = [...options, ...refill].slice(0, DRAFT_OPTION_COUNT);
        }
    } else if (serviceId === 'reroll_offer') {
        pickRound += 1;
        options = rollRelicOptions(paidRun, tierIndex, cleared, pickRound).filter((id) => !bannedRelicIds.includes(id));
    } else {
        upgradedOffer = true;
        pickRound += 1;
        options = upgradedRelicOptions(paidRun, tierIndex, cleared, pickRound, bannedRelicIds);
    }

    const nextOffer = {
        ...offer,
        options,
        pickRound,
        serviceUses,
        bannedRelicIds,
        upgradedOffer,
        contextualOptionReasons: getRelicDraftOptionReasons(paidRun, cleared, options)
    };
    const nextRun = { ...paidRun, relicOffer: nextOffer };
    return {
        run: { ...nextRun, relicOffer: { ...nextOffer, services: createRelicOfferServices(nextRun) } },
        applied: true,
        serviceId
    };
};


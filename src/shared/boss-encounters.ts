import {
    BOSS_FLOOR_SCORE_MULTIPLIER,
    type FloorArchetypeId,
    type FloorTag,
    type MutatorId
} from './contracts';
import type { FloorScheduleEntry } from './floor-mutator-schedule';
import type { RunMapNodeKind } from './run-map';

export type BossEliteEncounterKind = 'boss' | 'elite';

export interface BossElitePresentationSlot {
    slot: 'icon' | 'key_art' | 'audio_stinger' | 'fx_burst';
    placeholderNeeded: boolean;
    fallback: string;
}

export interface BossEliteEncounterIdentity {
    kind: BossEliteEncounterKind;
    id: string;
    label: string;
    readRule: string;
    readabilityChecklist?: string;
    mechanics: string[];
    rewardHook: string;
    payoffCopy?: string;
    scoreRule: string;
    presentationSlots: BossElitePresentationSlot[];
    offlineOnly: true;
}

const PRESENTATION_SLOTS: readonly BossElitePresentationSlot[] = [
    {
        slot: 'icon',
        placeholderNeeded: false,
        fallback: 'Reuse existing floor tag pill / route node glyph.'
    },
    {
        slot: 'key_art',
        placeholderNeeded: true,
        fallback: 'Use current chapter panel gradient and procedural frame.'
    },
    {
        slot: 'audio_stinger',
        placeholderNeeded: true,
        fallback: 'Silence; do not block local/offline play.'
    },
    {
        slot: 'fx_burst',
        placeholderNeeded: true,
        fallback: 'Existing HUD pulse / reduced-motion safe CSS transition.'
    }
] as const;

const mechanicCopy = (mutators: readonly MutatorId[], floorArchetypeId: FloorArchetypeId | null): string[] => {
    const rows = mutators.map((mutator) => `Mutator: ${mutator.replace(/_/g, ' ')}.`);
    if (floorArchetypeId) {
        rows.unshift(`Chapter identity: ${floorArchetypeId.replace(/_/g, ' ')}.`);
    }
    return rows.length > 0 ? rows : ['No extra mutator; identity comes from route risk and reward pacing.'];
};

export const BOSS_ENCOUNTER_IDENTITY: BossEliteEncounterIdentity = {
    kind: 'boss',
    id: 'boss_floor_identity',
    label: 'Boss floor',
    readRule: 'Boss floors must display a boss tag, a chapter/risk note, and at least one named pressure mechanic before or during play.',
    mechanics: [
        'Boss floorTag.',
        'Chapter schedule pressure mutators.',
        'Featured objective favor bonus.',
        'Keystone Pair board anchor.'
    ],
    rewardHook: 'Keystone Pair route anchor plus +2 Favor on featured-objective success.',
    scoreRule: `${BOSS_FLOOR_SCORE_MULTIPLIER}x score multiplier after floor subtotal bonuses.`,
    presentationSlots: [...PRESENTATION_SLOTS],
    offlineOnly: true
};

export const ELITE_ENCOUNTER_IDENTITY: BossEliteEncounterIdentity = {
    kind: 'elite',
    id: 'elite_route_identity',
    label: 'Elite memory',
    readRule: 'Elite nodes must be greed-route pressure hooks: clearly harder than combat, not a vendor/rest/treasure node.',
    mechanics: [
        'Greed route node.',
        'Higher pressure floor hook.',
        'Elite Cache, Final Ward, or Omen Seal hard-route board anchor.'
    ],
    rewardHook: 'Route-specific elite anchors pay gold, guard/combo, or Favor/combo without boss score rules.',
    scoreRule: 'Uses normal floor scoring until a future elite multiplier is explicitly versioned.',
    presentationSlots: [...PRESENTATION_SLOTS],
    offlineOnly: true
};

export const getBossEliteEncounterIdentityForNode = (
    kind: RunMapNodeKind
): BossEliteEncounterIdentity | null => (kind === 'elite' ? ELITE_ENCOUNTER_IDENTITY : kind === 'combat' ? null : null);

export const getBossEncounterIdentityForFloor = (
    floorTag: FloorTag,
    entry: Pick<FloorScheduleEntry, 'floorArchetypeId' | 'mutators' | 'riskProfile'>
): BossEliteEncounterIdentity | null => {
    if (floorTag !== 'boss') {
        return null;
    }
    return {
        ...BOSS_ENCOUNTER_IDENTITY,
        readabilityChecklist: `${BOSS_ENCOUNTER_IDENTITY.readRule} Placeholder slots: ${BOSS_ENCOUNTER_IDENTITY.presentationSlots
            .filter((slot) => slot.placeholderNeeded)
            .map((slot) => slot.slot.replace(/_/g, ' '))
            .join(', ')}.`,
        payoffCopy: `Boss pressure: ${BOSS_ENCOUNTER_IDENTITY.scoreRule} ${BOSS_ENCOUNTER_IDENTITY.rewardHook} Placeholder slots are documented.`,
        mechanics: [
            ...mechanicCopy(entry.mutators, entry.floorArchetypeId),
            'Keystone Pair board anchor.',
            entry.riskProfile ? `Risk read: ${entry.riskProfile}` : 'Risk read: boss pressure.'
        ]
    };
};

export const getBossFloorHudTitle = (
    entry: Pick<FloorScheduleEntry, 'floorArchetypeId' | 'mutators' | 'riskProfile'>
): string => {
    const identity = getBossEncounterIdentityForFloor('boss', entry);
    return identity
        ? `${identity.label}: ${identity.scoreRule} ${identity.rewardHook}`
        : 'Boss floor scoring';
};

export interface EncounterIdentityRow {
    encounterRank: BossEliteEncounterKind;
    label: string;
    scoreRule: string;
    mechanics: string[];
    placeholderNeeded: boolean;
    placeholderSlots: string[];
}

const rowFromIdentity = (identity: BossEliteEncounterIdentity): EncounterIdentityRow => ({
    encounterRank: identity.kind,
    label: identity.kind === 'boss' ? 'Boss encounter' : identity.label,
    scoreRule:
        identity.kind === 'boss'
            ? 'Applies the boss floor score multiplier after bonuses.'
            : 'No boss score multiplier; elite identity is route-pressure and reward pacing only.',
    mechanics: identity.mechanics,
    placeholderNeeded: identity.presentationSlots.some((slot) => slot.placeholderNeeded),
    placeholderSlots:
        identity.kind === 'boss'
            ? ['boss intro stinger', 'boss key art panel', 'boss FX burst']
            : ['elite route badge', 'elite key art panel', 'elite audio stinger']
});

export const getEncounterIdentityForFloor = (
    entry: FloorScheduleEntry
): EncounterIdentityRow | null => {
    const identity = getBossEncounterIdentityForFloor(entry.floorTag, entry);
    return identity ? rowFromIdentity(identity) : null;
};

export const getEncounterIdentityForRouteKind = (kind: RunMapNodeKind): EncounterIdentityRow | null => {
    const identity = getBossEliteEncounterIdentityForNode(kind);
    return identity ? rowFromIdentity(identity) : null;
};

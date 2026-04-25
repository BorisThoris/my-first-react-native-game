import {
    MAX_COMBO_SHARDS,
    MAX_DESTROY_PAIR_BANK,
    MAX_GUARD_TOKENS,
    type RunState
} from './contracts';

export type RunInventoryItemId =
    | 'shuffle_charge'
    | 'region_shuffle_charge'
    | 'destroy_charge'
    | 'peek_charge'
    | 'stray_remove'
    | 'guard_token'
    | 'combo_shard'
    | 'relic_loadout'
    | 'mutator_loadout'
    | 'contract_loadout';

export type RunInventoryItemKind = 'consumable' | 'loadout';
export type RunInventoryMutability = 'mid_run' | 'floor_only' | 'shop_or_rest' | 'draft_only' | 'locked';

export interface RunInventoryDefinition {
    id: RunInventoryItemId;
    kind: RunInventoryItemKind;
    label: string;
    stackLimit: number | null;
    mutableAt: RunInventoryMutability;
    source: string;
    useRule: string;
}

export interface RunInventoryRow extends RunInventoryDefinition {
    quantity: number;
    quantityLabel: string;
    maxStack: number;
    slotId?: string;
    mutability?: RunInventoryMutability;
    useWindow?: string;
    effectPreview?: string;
    available: boolean;
    unavailableReason: string | null;
}

export interface RunLoadoutSlotRow {
    id: string;
    label: string;
    source: 'relic' | 'mutator' | 'contract';
    mutableDuringRun: boolean;
    changeWindow: string;
}

export interface RunInventorySnapshot {
    offlineOnly: true;
    consumables: RunInventoryRow[];
    loadout: RunLoadoutSlotRow[];
}

export const RUN_INVENTORY_CATALOG: Record<RunInventoryItemId, RunInventoryDefinition> = {
    shuffle_charge: {
        id: 'shuffle_charge',
        kind: 'consumable',
        label: 'Shuffle charge',
        stackLimit: null,
        mutableAt: 'mid_run',
        source: 'Run start, relics, and clean floor rewards.',
        useRule: 'Spend during play to reshuffle hidden tiles; disabled by no-shuffle contracts.'
    },
    region_shuffle_charge: {
        id: 'region_shuffle_charge',
        kind: 'consumable',
        label: 'Row shuffle charge',
        stackLimit: null,
        mutableAt: 'mid_run',
        source: 'Run start and relic services.',
        useRule: 'Spend during play to reshuffle one row; disabled by no-shuffle contracts.'
    },
    destroy_charge: {
        id: 'destroy_charge',
        kind: 'consumable',
        label: 'Destroy charge',
        stackLimit: MAX_DESTROY_PAIR_BANK,
        mutableAt: 'mid_run',
        source: 'Clean clears, relics, and shop services.',
        useRule: 'Spend during play to remove a hidden pair; disabled by no-destroy contracts.'
    },
    peek_charge: {
        id: 'peek_charge',
        kind: 'consumable',
        label: 'Peek charge',
        stackLimit: null,
        mutableAt: 'mid_run',
        source: 'Run start, relics, and shop services.',
        useRule: 'Spend during play to reveal tiles without committing flips.'
    },
    stray_remove: {
        id: 'stray_remove',
        kind: 'consumable',
        label: 'Stray remover',
        stackLimit: null,
        mutableAt: 'mid_run',
        source: 'Wild/practice setup and relics.',
        useRule: 'Spend during play to remove one hidden stray tile from the board.'
    },
    guard_token: {
        id: 'guard_token',
        kind: 'consumable',
        label: 'Guard token',
        stackLimit: MAX_GUARD_TOKENS,
        mutableAt: 'floor_only',
        source: 'Streak rewards, lantern events, and guard relics.',
        useRule: 'Automatically absorbs mismatch life loss before hearts are spent.'
    },
    combo_shard: {
        id: 'combo_shard',
        kind: 'consumable',
        label: 'Combo shard',
        stackLimit: MAX_COMBO_SHARDS,
        mutableAt: 'floor_only',
        source: 'Match streaks and shard-spark pickups.',
        useRule: 'Automatically converts into life sustain when the shard threshold is met.'
    },
    relic_loadout: {
        id: 'relic_loadout',
        kind: 'loadout',
        label: 'Relic loadout',
        stackLimit: 12,
        mutableAt: 'draft_only',
        source: 'Milestone relic drafts and shrine services.',
        useRule: 'Changes only when a relic draft is open; selected relics are fixed for the run.'
    },
    mutator_loadout: {
        id: 'mutator_loadout',
        kind: 'loadout',
        label: 'Mutator loadout',
        stackLimit: null,
        mutableAt: 'locked',
        source: 'Mode selection, daily seed, or authored floor schedule.',
        useRule: 'Locked for the active floor; schedule may replace it on next floor.'
    },
    contract_loadout: {
        id: 'contract_loadout',
        kind: 'loadout',
        label: 'Contract loadout',
        stackLimit: null,
        mutableAt: 'locked',
        source: 'Mode/menu contract choice.',
        useRule: 'Locked after run start; no mid-run contract editing.'
    }
};

const quantityFor = (run: RunState, id: RunInventoryItemId): number => {
    switch (id) {
        case 'shuffle_charge':
            return run.shuffleCharges + (run.freeShuffleThisFloor ? 1 : 0);
        case 'region_shuffle_charge':
            return run.regionShuffleCharges + (run.regionShuffleFreeThisFloor ? 1 : 0);
        case 'destroy_charge':
            return run.destroyPairCharges;
        case 'peek_charge':
            return run.peekCharges;
        case 'stray_remove':
            return run.strayRemoveCharges;
        case 'guard_token':
            return run.stats.guardTokens;
        case 'combo_shard':
            return run.stats.comboShards;
        case 'relic_loadout':
            return run.relicIds.length;
        case 'mutator_loadout':
            return run.activeMutators.length;
        case 'contract_loadout':
            return run.activeContract ? 1 : 0;
        default:
            return 0;
    }
};

const unavailableReasonFor = (run: RunState, id: RunInventoryItemId, quantity: number): string | null => {
    if ((id === 'shuffle_charge' || id === 'region_shuffle_charge') && run.activeContract?.noShuffle) {
        return 'No-shuffle contract locks this consumable.';
    }
    if (id === 'destroy_charge' && run.activeContract?.noDestroy) {
        return 'No-destroy contract locks this consumable.';
    }
    if (quantity <= 0 && RUN_INVENTORY_CATALOG[id].kind === 'consumable') {
        return 'No charges currently banked.';
    }
    return null;
};

const quantityLabelFor = (definition: RunInventoryDefinition, quantity: number): string =>
    definition.stackLimit == null ? String(quantity) : `${quantity}/${definition.stackLimit}`;

const maxStackFor = (definition: RunInventoryDefinition): number => definition.stackLimit ?? 3;

export const getRunInventoryRows = (run: RunState): RunInventoryRow[] =>
    (Object.keys(RUN_INVENTORY_CATALOG) as RunInventoryItemId[]).map((id) => {
        const definition = RUN_INVENTORY_CATALOG[id];
        const quantity = quantityFor(run, id);
        const unavailableReason = unavailableReasonFor(run, id, quantity);
        return {
            ...definition,
            quantity,
            quantityLabel: quantityLabelFor(definition, quantity),
            maxStack: maxStackFor(definition),
            slotId: id,
            mutability: definition.mutableAt,
            useWindow: definition.useRule,
            effectPreview: definition.kind === 'loadout' ? 'Locked run setup.' : definition.source,
            available: unavailableReason === null,
            unavailableReason
        };
    });

export const getRunConsumableRows = (run: RunState): RunInventoryRow[] =>
    getRunInventoryRows(run)
        .filter((row) => row.kind === 'consumable')
        .map((row) => ({ ...row, quantity: Math.min(row.quantity, row.maxStack) }));

export const getRunLoadoutRows = (run: RunState): RunInventoryRow[] =>
    getRunInventoryRows(run).filter((row) => row.kind === 'loadout');

export const RUN_LOADOUT_SLOT_LIMIT = 4;

export const getRunInventoryLoadoutRows = (run: RunState): RunLoadoutSlotRow[] => [
    ...run.relicIds.map((id) => ({
        id: `relic:${id}`,
        label: id.replace(/_/g, ' '),
        source: 'relic' as const,
        mutableDuringRun: false,
        changeWindow: 'Relic draft or relic service only.'
    })),
    ...run.activeMutators.map((id) => ({
        id: `mutator:${id}`,
        label: id.replace(/_/g, ' '),
        source: 'mutator' as const,
        mutableDuringRun: false,
        changeWindow: 'Locked for the active floor; schedule may change next floor.'
    })),
    ...(run.activeContract
        ? [{
              id: 'contract:active',
              label: 'Scholar contract',
              source: 'contract' as const,
              mutableDuringRun: false,
              changeWindow: 'Locked at run start.'
          }]
        : [])
].slice(0, RUN_LOADOUT_SLOT_LIMIT);

export const buildRunInventory = (run: RunState): RunInventorySnapshot => ({
    offlineOnly: true,
    consumables: getRunConsumableRows(run)
        .filter((row) => row.id !== 'guard_token' && row.id !== 'combo_shard')
        .map((row) => (row.id === 'stray_remove' ? { ...row, id: 'stray_remove_charge' as RunInventoryItemId } : row))
        .map((row) => ({ ...row, quantity: Math.min(row.quantity, row.maxStack) })),
    loadout: getRunInventoryLoadoutRows(run)
});

export const getRunLoadoutSummary = (run: RunState): {
    equipped: number;
    capacity: number;
    totalStacks: number;
    midRunMutable: boolean;
} => {
    const inventory = buildRunInventory(run);
    return {
        equipped: inventory.loadout.length,
        capacity: RUN_LOADOUT_SLOT_LIMIT,
        totalStacks: inventory.consumables.reduce((sum, row) => sum + row.quantity, 0),
        midRunMutable: inventory.consumables.some((row) => row.mutableAt === 'mid_run' && row.quantity > 0)
    };
};

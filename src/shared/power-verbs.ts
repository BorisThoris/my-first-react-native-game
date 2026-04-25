import type { RunState } from './contracts';

export type PowerVerbId =
    | 'shuffle'
    | 'region_shuffle'
    | 'pin'
    | 'peek'
    | 'destroy_pair'
    | 'stray_remove'
    | 'flash_pair'
    | 'undo_resolve'
    | 'gambit';

export type PowerVerbJob = 'Recall' | 'Search' | 'Damage control' | 'Risk';

export interface PowerVerbTeachingRow {
    id: PowerVerbId;
    label: string;
    job: PowerVerbJob;
    purpose: string;
    cost: string;
    perfectMemoryImpact: 'allowed' | 'locks_perfect_memory';
    disabledReason: string | null;
}

export const POWER_VERB_GROUPS = {
    recall: 'Recall',
    search: 'Search',
    damage_control: 'Damage control',
    risk: 'Risk'
} as const;

const onlyWhilePlaying = (run: RunState): string | null => (run.status === 'playing' ? null : 'Only while playing.');

export const getPowerVerbRows = (run: RunState): PowerVerbTeachingRow[] => [
    {
        id: 'pin',
        label: 'Pin',
        job: 'Recall',
        purpose: 'Mark remembered locations without revealing or changing tiles.',
        cost: `${run.pinnedTileIds.length} pinned now; pins are slot-limited.`,
        perfectMemoryImpact: 'allowed',
        disabledReason:
            onlyWhilePlaying(run) ??
            (run.activeContract?.maxPinsTotalRun != null &&
            run.pinsPlacedCountThisRun >= run.activeContract.maxPinsTotalRun
                ? 'Pin vow placement cap reached.'
                : null)
    },
    {
        id: 'peek',
        label: 'Peek',
        job: 'Recall',
        purpose: 'Briefly reveal one hidden tile when memory needs a cue.',
        cost: `${run.peekCharges} peek charge(s).`,
        perfectMemoryImpact: 'locks_perfect_memory',
        disabledReason: onlyWhilePlaying(run) ?? (run.peekCharges < 1 ? 'No peek charges.' : null)
    },
    {
        id: 'flash_pair',
        label: 'Flash',
        job: 'Recall',
        purpose: 'Reveal one random hidden pair briefly in Practice or Wild runs.',
        cost: `${run.flashPairCharges} flash charge(s).`,
        perfectMemoryImpact: 'locks_perfect_memory',
        disabledReason: onlyWhilePlaying(run) ?? (run.flashPairCharges < 1 ? 'No flash charges.' : null)
    },
    {
        id: 'shuffle',
        label: 'Shuffle',
        job: 'Search',
        purpose: 'Re-roll hidden tile positions when the layout is no longer useful.',
        cost: run.activeContract?.noShuffle ? 'Locked by Scholar contract.' : `${run.shuffleCharges} full-board charge(s).`,
        perfectMemoryImpact: 'locks_perfect_memory',
        disabledReason:
            onlyWhilePlaying(run) ??
            (run.activeContract?.noShuffle
                ? 'Scholar contract disables full-board shuffle.'
                : run.shuffleCharges < 1
                  ? 'No shuffle charges.'
                  : run.board?.flippedTileIds.length
                    ? 'Resolve the current flip first.'
                    : null)
    },
    {
        id: 'region_shuffle',
        label: 'Rows',
        job: 'Search',
        purpose: 'Shuffle one row while preserving the rest of your spatial read.',
        cost: `${run.regionShuffleCharges} row charge(s); relics may make the first row free.`,
        perfectMemoryImpact: 'locks_perfect_memory',
        disabledReason:
            onlyWhilePlaying(run) ??
            (run.activeContract?.noShuffle
                ? 'Scholar contract disables row shuffle.'
                : run.regionShuffleCharges < 1 && !run.regionShuffleFreeThisFloor
                  ? 'No row shuffle charge or free row shuffle.'
                  : null)
    },
    {
        id: 'destroy_pair',
        label: 'Destroy',
        job: 'Damage control',
        purpose: 'Remove a fully hidden pair for no match score.',
        cost: `${run.destroyPairCharges} destroy charge(s); clean floors refill the bank.`,
        perfectMemoryImpact: 'locks_perfect_memory',
        disabledReason:
            onlyWhilePlaying(run) ??
            (run.activeContract?.noDestroy
                ? 'Scholar contract disables destroy.'
                : run.destroyPairCharges < 1
                  ? 'No destroy charges.'
                  : null)
    },
    {
        id: 'stray_remove',
        label: 'Stray',
        job: 'Damage control',
        purpose: 'Remove one hidden non-decoy tile to reduce overload.',
        cost: `${run.strayRemoveCharges} stray-remove charge(s).`,
        perfectMemoryImpact: 'locks_perfect_memory',
        disabledReason: onlyWhilePlaying(run) ?? (run.strayRemoveCharges < 1 ? 'No stray-remove charges.' : null)
    },
    {
        id: 'undo_resolve',
        label: 'Undo',
        job: 'Damage control',
        purpose: 'Cancel a resolving flip before it commits.',
        cost: `${run.undoUsesThisFloor} undo use(s) this floor.`,
        perfectMemoryImpact: 'locks_perfect_memory',
        disabledReason: run.undoUsesThisFloor < 1 ? 'No undo uses this floor.' : null
    },
    {
        id: 'gambit',
        label: 'Gambit',
        job: 'Risk',
        purpose: 'Commit a third flip during a mismatch to look for a rescue match.',
        cost: run.gambitAvailableThisFloor ? 'One chance this floor.' : 'Already spent this floor.',
        perfectMemoryImpact: 'locks_perfect_memory',
        disabledReason: run.gambitAvailableThisFloor ? null : 'Gambit already used this floor.'
    }
];

export const getPowerVerbTeachingRows = getPowerVerbRows;

export const getPowerVerbTeachingSummary = (run: RunState): string =>
    getPowerVerbRows(run)
        .map(
            (row) =>
                `${row.job}: ${row.label} — ${row.purpose} ${row.perfectMemoryImpact === 'locks_perfect_memory' ? 'Locks Perfect Memory.' : 'Perfect Memory-safe.'}`
        )
        .join(' ');

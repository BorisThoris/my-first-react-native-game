import type { RunState, SaveData, RunSummary } from './contracts';

export type RunHistoryPersistence = 'persisted_summary' | 'ephemeral_run' | 'derived_export';

export interface RunHistoryBuildSnapshot {
    relicIds: string[];
    mutatorIds: string[];
    contract: string;
    mode: string;
}

export interface RunReplayLink {
    kind?: 'local_replay_link';
    replayKey: string;
    replaySupported: boolean;
    reason: string;
    seed: number | null;
    rulesVersion: number | null;
    localOnly: true;
    shareString?: string;
}

export interface RunHistoryJournalRow {
    id: string;
    label: string;
    value: string;
    detail?: string;
    persistence: RunHistoryPersistence;
    exportSafe: boolean;
    offlineOnly?: true;
}

export interface RunHistoryEntry {
    runSeed?: number;
    localOnly?: true;
    summary: RunSummary | null;
    build: RunHistoryBuildSnapshot;
    replay: RunReplayLink;
    journalRows: RunHistoryJournalRow[];
    piiFree: true;
    onlineRequired: false;
}

const contractLabel = (run: Pick<RunState, 'activeContract' | 'practiceMode'>): string => {
    if (run.activeContract?.noShuffle && run.activeContract?.noDestroy) {
        return 'Scholar contract';
    }
    if (run.activeContract?.maxPinsTotalRun != null) {
        return `Pin vow ${run.activeContract.maxPinsTotalRun}`;
    }
    if (run.practiceMode) {
        return 'Practice';
    }
    return 'None';
};

export const buildRunReplayLink = (run: RunState): RunReplayLink => {
    const summary = run.lastRunSummary;
    const seed = summary?.runSeed ?? run.runSeed ?? null;
    const rulesVersion = summary?.runRulesVersion ?? run.runRulesVersion ?? null;
    const mode = summary?.gameMode ?? run.gameMode;
    const replaySupported = seed != null && rulesVersion != null && mode !== 'puzzle';
    return {
        kind: 'local_replay_link',
        replayKey: replaySupported ? `${mode}:${rulesVersion}:${seed}` : 'local-replay-unavailable',
        replaySupported,
        reason: replaySupported
            ? 'Deterministic local seed/rules/mode can reconstruct the run start; flip timeline remains ephemeral.'
            : 'Fixed/imported puzzle boards require their tile payload; do not invent a replay link.',
        seed,
        rulesVersion,
        localOnly: true,
        shareString: replaySupported
            ? `local replay ${mode}:${rulesVersion}:${seed}`
            : 'local replay unavailable'
    };
};

export const buildRunHistoryEntry = (run: RunState): RunHistoryEntry => {
    const summary = run.lastRunSummary;
    const build: RunHistoryBuildSnapshot = {
        relicIds: [...run.relicIds],
        mutatorIds: [...run.activeMutators],
        contract: contractLabel(run),
        mode: run.gameMode
    };
    const replay = buildRunReplayLink(run);
    const journalRows: RunHistoryJournalRow[] = [
        {
            id: 'summary',
            label: 'Run summary',
            value: summary
                ? `${summary.totalScore} score · floor ${summary.highestLevel} · ${summary.levelsCleared} clears`
                : 'No resolved summary yet',
            persistence: 'persisted_summary',
            exportSafe: true,
            offlineOnly: true
        },
        {
            id: 'build',
            label: 'Build snapshot',
            value: `${build.mode} · ${build.contract} · ${build.relicIds.length} relics · ${build.mutatorIds.length} mutators`,
            persistence: 'derived_export',
            exportSafe: true,
            offlineOnly: true
        },
        {
            id: 'replay',
            label: 'Replay key',
            value: replay.replayKey,
            detail: `${run.flipHistory.length} flip ids; ${replay.reason}`,
            persistence: 'derived_export',
            exportSafe: replay.replaySupported,
            offlineOnly: true
        },
        {
            id: 'encore',
            label: 'Encore keys',
            value: `${run.flipHistory.length} tile ids kept until this run is dismissed`,
            detail: `${run.matchedPairKeysThisRun.length} matched pair keys for local encore bonus.`,
            persistence: 'ephemeral_run',
            exportSafe: false,
            offlineOnly: true
        }
    ];
    return {
        runSeed: replay.seed ?? undefined,
        localOnly: true,
        summary,
        build,
        replay,
        journalRows,
        piiFree: true,
        onlineRequired: false
    };
};

export const buildRunJournalRows = (run: RunState): RunHistoryJournalRow[] =>
    buildRunHistoryEntry(run).journalRows;

export const buildRunJournalEntry = (run: RunState): {
    journalId: string;
    buildSummary: string;
    replayLabel: string;
    rows: RunHistoryJournalRow[];
    localOnly: true;
} => {
    const entry = buildRunHistoryEntry(run);
    return {
        journalId: entry.replay.replayKey,
        buildSummary: `${entry.build.relicIds.length} relics / ${entry.build.mutatorIds.length} mutators`,
        replayLabel: entry.replay.replaySupported ? 'local replay available' : 'replay unavailable',
        rows: entry.journalRows,
        localOnly: true
    };
};

export const buildRunJournalRowsFromSave = (save: SaveData): RunHistoryJournalRow[] => {
    const summary = save.lastRunSummary;
    return [
        {
            id: 'last_summary',
            label: 'Last run summary',
            value: summary
                ? `${summary.gameMode ?? 'classic'} · ${summary.totalScore} score · floor ${summary.highestLevel}`
                : 'No persisted run summary',
            persistence: 'persisted_summary',
            exportSafe: true
        },
        {
            id: 'encore_pairs',
            label: 'Encore pair keys',
            value: `${save.playerStats?.encorePairKeysLastRun.length ?? 0} pair keys remembered locally`,
            persistence: 'persisted_summary',
            exportSafe: false
        }
    ];
};

export const buildRunHistoryExportString = (run: RunState): string => {
    const entry = buildRunHistoryEntry(run);
    const summary = entry.summary;
    if (!summary) {
        return 'No run history export available yet.';
    }
    return [
        `Run ${summary.gameMode ?? 'classic'} floor ${summary.highestLevel}`,
        `${summary.totalScore} local score`,
        `build ${entry.build.relicIds.length} relics/${entry.build.mutatorIds.length} mutators`,
        entry.replay.replaySupported ? `replay ${entry.replay.replayKey}` : 'replay unavailable',
        'offline local journal; no account or leaderboard rank'
    ].join(' · ');
};

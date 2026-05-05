import type { RunState, RunSummary } from './contracts';
import { buildRunHistoryExportString } from './run-history';

export interface GameOverNextRunRow {
    id: 'run_it_back' | 'build_recap' | 'local_share' | 'next_goal';
    title: string;
    value: string;
    detail: string;
    actionHint: string;
    localOnly: true;
}

const modeLabel = (summary: RunSummary): string => {
    if (summary.activeContract?.noShuffle) {
        return 'Scholar Contract';
    }
    if (summary.activeContract?.maxPinsTotalRun != null) {
        return 'Pin Vow';
    }
    if (summary.wildMenuRun) {
        return 'Wild Run';
    }
    if (
        summary.practiceMode &&
        summary.gameMode === 'endless' &&
        (summary.highestLevel ?? 0) >= 5 &&
        summary.activeMutators?.includes('wide_recall')
    ) {
        return 'Dungeon Showcase';
    }
    switch (summary.gameMode) {
        case 'daily':
            return summary.dailyDateKeyUtc ? `Daily ${summary.dailyDateKeyUtc}` : 'Daily';
        case 'gauntlet':
            return 'Gauntlet';
        case 'meditation':
            return 'Meditation';
        case 'puzzle':
            return 'Puzzle';
        default:
            if (summary.practiceMode) {
                return 'Practice';
            }
            return 'Classic';
    }
};

export const getGameOverNextRunRows = (run: RunState): GameOverNextRunRow[] => {
    const summary = run.lastRunSummary;
    const runLabel = summary ? modeLabel(summary) : 'No completed run';
    const buildCount = `${run.relicIds.length} relic(s) / ${run.activeMutators.length} mutator(s)`;
    return [
        {
            id: 'run_it_back',
            title: 'Run it back',
            value: runLabel,
            detail: summary
                ? `${summary.totalScore.toLocaleString()} score · floor ${summary.highestLevel} · ${summary.levelsCleared} clear(s)`
                : 'Complete a run to unlock a restart recommendation.',
            actionHint: 'Play Again restarts the current mode locally; Main Menu returns to the hub.',
            localOnly: true
        },
        {
            id: 'build_recap',
            title: 'Build recap',
            value: buildCount,
            detail: run.activeContract ? 'Contract rules shaped this run.' : 'No contract constraints on this run.',
            actionHint: 'Review Inventory/Codex for build rules before the next attempt.',
            localOnly: true
        },
        {
            id: 'local_share',
            title: 'Local share',
            value: summary ? buildRunHistoryExportString(run) : 'No export yet',
            detail: 'Share strings stay offline-safe: no account, PII, or online rank.',
            actionHint: 'Use this as a readable recap until clipboard/export UI is expanded.',
            localOnly: true
        },
        {
            id: 'next_goal',
            title: 'Next goal',
            value: summary && summary.highestLevel < 5 ? 'Reach floor 5' : 'Push a cleaner run',
            detail: summary?.perfectClears ? `${summary.perfectClears} perfect floor(s) logged.` : 'Perfect floors and no-assist runs unlock mastery.',
            actionHint: 'Choose Classic for long-run progression or Daily for UTC archive progress.',
            localOnly: true
        }
    ];
};

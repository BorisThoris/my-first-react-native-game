import { describe, expect, it } from 'vitest';
import type { RunState } from './contracts';
import { createNewRun, createRunSummary, finishMemorizePhase } from './game-core';
import { buildRunHistoryEntry, buildRunJournalRows, buildRunReplayLink } from './run-history';

const completedRun = (): RunState => {
    const run = createRunSummary(
        {
            ...finishMemorizePhase(createNewRun(100, { runSeed: 85_001, initialRelicIds: ['chapter_compass'] })),
            flipHistory: ['1-0-A', '1-0-B', '1-1-A'],
            matchedPairKeysThisRun: ['1-0', '1-1']
        },
        ['ACH_FIRST_CLEAR']
    );
    return run;
};

describe('REG-085 run history, replay, and journal', () => {
    it('builds a local-only run history entry without a second save file', () => {
        const entry = buildRunHistoryEntry(completedRun());

        expect(entry).toMatchObject({
            runSeed: 85_001,
            localOnly: true,
            replay: {
                kind: 'local_replay_link'
            }
        });
        expect(entry.build.relicIds).toContain('chapter_compass');
        expect(entry.journalRows.map((row) => row.id)).toEqual(['summary', 'build', 'replay', 'encore']);
    });

    it('produces privacy-safe replay links and journal rows', () => {
        const run = completedRun();
        const link = buildRunReplayLink(run);
        const rows = buildRunJournalRows(run);

        expect(link.shareString).toContain('local replay');
        expect(link.shareString).not.toMatch(/account|token|path|email/i);
        expect(rows.find((row) => row.id === 'replay')?.detail).toContain('3 flip ids');
        expect(rows.every((row) => row.offlineOnly)).toBe(true);
    });
});

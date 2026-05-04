import { describe, expect, it } from 'vitest';
import type { RunState } from './contracts';
import { createNewRun, createRunSummary, finishMemorizePhase } from './game-core';
import {
    MAX_DUNGEON_JOURNAL_ROWS,
    buildDungeonJournalRows,
    buildRunHistoryEntry,
    buildRunHistoryExportString,
    buildRunJournalRows,
    buildRunReplayLink
} from './run-history';

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
        expect(entry.journalRows.find((row) => row.id === 'build')?.value).toContain('The Slayer');
        expect(entry.journalRows.find((row) => row.id === 'build')?.detail).toContain('prepare, focus, finish');
        expect(entry.journalRows.map((row) => row.id).slice(0, 4)).toEqual(['summary', 'build', 'replay', 'encore']);
        expect(entry.journalRows.map((row) => row.id)).toEqual(
            expect.arrayContaining(['dungeon_node', 'dungeon_objective', 'dungeon_rewards'])
        );
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

    it('derives a capped dungeon journal without persisting full replay data', () => {
        const base = completedRun();
        const run: RunState = {
            ...base,
            status: 'gameOver',
            lives: 0,
            pendingRouteCardPlan: {
                choiceId: base.dungeonRun.currentNodeId,
                routeType: 'greed',
                sourceLevel: 3,
                targetLevel: 4
            },
            board: base.board
                ? {
                      ...base.board,
                      floorTag: 'boss',
                      dungeonBossId: 'trap_warden',
                      dungeonObjectiveId: 'defeat_boss',
                      selectedGatewayRouteType: 'greed'
                  }
                : base.board,
            lastLevelResult: {
                level: 4,
                scoreGained: 240,
                rating: 'A',
                livesRemaining: 0,
                perfect: false,
                mistakes: 3,
                clearLifeReason: 'none',
                clearLifeGained: 0,
                featuredObjectiveId: 'glass_witness',
                featuredObjectiveCompleted: false
            },
            dungeonEnemiesDefeated: 3,
            dungeonEnemiesDefeatedThisFloor: 1,
            dungeonTrapsResolvedThisFloor: 2,
            dungeonTreasuresOpened: 2,
            dungeonGatewaysUsed: 1,
            dungeonKeys: { iron: 1, boss: 1 },
            dungeonMasterKeys: 1,
            enemyHazardHitsThisFloor: 2,
            shopGold: 9
        };

        const rows = buildDungeonJournalRows(run);
        expect(rows.length).toBeLessThanOrEqual(MAX_DUNGEON_JOURNAL_ROWS);
        expect(rows.map((row) => row.id)).toEqual(
            expect.arrayContaining([
                'dungeon_node',
                'dungeon_route',
                'dungeon_boss',
                'dungeon_objective',
                'dungeon_rewards',
                'dungeon_outcome'
            ])
        );
        expect(rows.find((row) => row.id === 'dungeon_route')?.value).toContain('greed');
        expect(rows.find((row) => row.id === 'dungeon_boss')?.value).toContain('Trap Warden');
        expect(rows.every((row) => row.exportSafe && row.offlineOnly)).toBe(true);
        expect(buildRunHistoryExportString(run)).toContain('Dungeon node');
        expect(buildRunHistoryExportString(run)).not.toMatch(/token|email|path/i);
    });

    it('uses primary build archetype in journal recap when relics exist', () => {
        const entry = buildRunHistoryEntry(completedRun());
        const journal = buildRunJournalRows(completedRun());

        expect(entry.journalRows.find((row) => row.id === 'build')?.value).toContain('The Slayer');
        expect(journal.find((row) => row.id === 'build')?.value).toContain('The Slayer');
    });
});

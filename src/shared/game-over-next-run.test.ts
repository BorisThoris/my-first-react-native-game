import { describe, expect, it } from 'vitest';
import { createNewRun, createRunSummary, finishMemorizePhase } from './game';
import { getGameOverNextRunRows } from './game-over-next-run';

describe('REG-096 game over next-run loop', () => {
    it('derives run-it-back, build recap, and local share rows from run summary', () => {
        const run = createRunSummary({ ...finishMemorizePhase(createNewRun(0)), status: 'gameOver', lives: 0 }, []);
        const rows = getGameOverNextRunRows(run);

        expect(rows.map((row) => row.id)).toEqual(['run_it_back', 'build_recap', 'local_share', 'next_goal']);
        expect(rows.every((row) => row.localOnly)).toBe(true);
        expect(rows.find((row) => row.id === 'run_it_back')?.actionHint).toMatch(/again/i);
        expect(rows.find((row) => row.id === 'local_share')?.detail).toMatch(/online rank/i);
    });
});

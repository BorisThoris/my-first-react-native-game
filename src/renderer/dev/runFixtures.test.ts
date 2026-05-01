import { describe, expect, it } from 'vitest';
import { DUNGEON_E2E_FIXTURE_RECIPES } from '../../shared/dungeon-e2e-fixtures';
import { buildSandboxRun } from './runFixtures';

describe('dev sandbox run fixtures', () => {
    it('builds DNG-072 dungeon board fixture recipes without falling back to arcade', () => {
        const boardFixtures = DUNGEON_E2E_FIXTURE_RECIPES.filter((recipe) =>
            recipe.fixture.startsWith('dungeon')
        );

        for (const recipe of boardFixtures) {
            const run = buildSandboxRun(recipe.fixture, 0);
            expect(run.runSeed, recipe.id).toBe(recipe.seed);
            expect(run.board?.level, recipe.id).toBe(recipe.floor);
            expect(run.board?.tiles.length, recipe.id).toBeGreaterThan(0);
        }
    });

    it('keeps key dungeon fixtures aligned to their intended node states', () => {
        expect(buildSandboxRun('dungeonBoss', 0).board?.floorTag).toBe('boss');
        expect(buildSandboxRun('dungeonBoss', 0).board?.dungeonBossId).not.toBeNull();
        expect(buildSandboxRun('dungeonTrapRoom', 0).board?.floorArchetypeId).toBe('trap_hall');
        expect(buildSandboxRun('dungeonRest', 0).board?.dungeonObjectiveId).toBeDefined();
        expect(buildSandboxRun('dungeonTreasure', 0).board?.tiles.some((tile) => tile.dungeonCardKind === 'treasure')).toBe(
            true
        );
        expect(buildSandboxRun('dungeonExitLock', 0).board?.dungeonExitTileId).toBeTruthy();
    });
});

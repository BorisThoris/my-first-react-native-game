import { describe, expect, it } from 'vitest';
import {
    DUNGEON_E2E_FIXTURE_RECIPES,
    getDungeonE2EFixtureRecipes
} from './dungeon-e2e-fixtures';

describe('DNG-072 dungeon E2E fixture recipes', () => {
    it('covers every required dungeon screenshot state with deterministic recipes', () => {
        expect(getDungeonE2EFixtureRecipes().map((recipe) => recipe.id)).toEqual([
            'dungeon_enemy_floor',
            'dungeon_boss_floor',
            'dungeon_trap_room',
            'dungeon_shop',
            'dungeon_rest',
            'dungeon_treasure',
            'dungeon_event',
            'dungeon_exit_lock',
            'dungeon_floor_clear',
            'dungeon_game_over'
        ]);

        for (const recipe of DUNGEON_E2E_FIXTURE_RECIPES) {
            expect(recipe.seed, recipe.id).toBeGreaterThan(0);
            expect(recipe.floor, recipe.id).toBeGreaterThan(0);
            expect(recipe.selectors.length, recipe.id).toBeGreaterThan(0);
            expect(recipe.desktopCapture, recipe.id).toMatch(/desktop\.png$/);
            expect(recipe.mobileCapture, recipe.id).toMatch(/mobile\.png$/);
        }
    });

    it('keeps screenshot selectors animation-independent', () => {
        for (const recipe of DUNGEON_E2E_FIXTURE_RECIPES) {
            expect(recipe.selectors.every((selector) => !selector.includes('animation'))).toBe(true);
        }
    });
});

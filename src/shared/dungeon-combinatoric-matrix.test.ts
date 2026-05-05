import { describe, expect, it } from 'vitest';
import {
    DUNGEON_COMBINATORIC_MATRIX,
    DUNGEON_COMBINATORIC_MATRIX_VERSION,
    dungeonCombinatoricRowsByStatus,
    getDungeonCombinatoricMatrix
} from './dungeon-combinatoric-matrix';

describe('DNG-070 dungeon combinatoric matrix', () => {
    it('publishes a stable versioned matrix with unique row ids', () => {
        expect(DUNGEON_COMBINATORIC_MATRIX_VERSION).toBe('dng-070-v2');
        expect(getDungeonCombinatoricMatrix().length).toBeGreaterThanOrEqual(16);
        const ids = DUNGEON_COMBINATORIC_MATRIX.map((row) => row.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('maps every P0 covered or excluded row to evidence and a rationale', () => {
        for (const row of DUNGEON_COMBINATORIC_MATRIX.filter((candidate) => candidate.priority === 'P0')) {
            expect(row.status, row.id).not.toBe('future');
            expect(row.evidence.length, row.id).toBeGreaterThan(0);
            expect(row.evidence.every((entry) => entry.endsWith('.test.ts') || entry.endsWith('.test.tsx'))).toBe(true);
            expect(row.rationale.length, row.id).toBeGreaterThan(24);
        }
    });

    it('covers major dungeon dimensions across P0 rows', () => {
        const p0Text = DUNGEON_COMBINATORIC_MATRIX.filter((row) => row.priority === 'P0')
            .map((row) =>
                [
                    row.mode,
                    row.node,
                    row.archetype,
                    row.objective,
                    row.mutator,
                    row.relicOrEconomy,
                    row.cardFamily,
                    row.enemy,
                    row.input,
                    row.viewport
                ].join(' ')
            )
            .join(' ')
            .toLowerCase();

        for (const required of [
            'safe',
            'greed',
            'mystery',
            'boss',
            'elite',
            'trap',
            'shop',
            'room',
            'keyboard',
            'mobile'
        ]) {
            expect(p0Text, required).toContain(required);
        }
    });

    it('keeps forbidden combinations explicit instead of silently untested', () => {
        const excluded = dungeonCombinatoricRowsByStatus('excluded');

        expect(excluded.length).toBeGreaterThanOrEqual(1);
        expect(excluded.map((row) => row.id)).toContain('forbidden_stray_remove_protected_route_anchors');
        expect(excluded[0]?.rationale).toMatch(/intentionally/i);
    });

    it('PPI-009 represents playable-path deterministic scenarios with test evidence', () => {
        const ppi009Rows = DUNGEON_COMBINATORIC_MATRIX.filter((row) => row.id.startsWith('ppi009_'));

        expect(ppi009Rows.map((row) => row.id)).toEqual([
            'ppi009_fixture_route_choices_seeded_floor_clear',
            'ppi009_fixture_shop_wallet_compatible_offer',
            'ppi009_fixture_side_room_then_shop_handoff',
            'ppi009_fixture_relic_draft_before_next_floor',
            'ppi009_fixture_game_over_terminal_explained',
            'ppi009_high_risk_board_completion_timing'
        ]);
        expect(ppi009Rows.every((row) => row.priority === 'P0' && row.status === 'covered')).toBe(true);
        expect(ppi009Rows.every((row) => row.evidence.includes('src/shared/dungeon-combinatoric-matrix.test.ts'))).toBe(
            true
        );

        const scenarioText = ppi009Rows
            .map((row) =>
                [
                    row.node,
                    row.archetype,
                    row.objective,
                    row.mutator,
                    row.relicOrEconomy,
                    row.cardFamily,
                    row.enemy,
                    row.input,
                    row.viewport,
                    row.rationale
                ].join(' ')
            )
            .join(' ')
            .toLowerCase();

        for (const required of ['route', 'shop', 'side room', 'relic', 'game over', 'high-risk', 'fixture']) {
            expect(scenarioText, required).toContain(required);
        }

        expect(
            ppi009Rows.some((row) => row.evidence.includes('src/shared/playable-path-fixtures.test.ts'))
        ).toBe(true);
        expect(ppi009Rows.some((row) => row.evidence.includes('src/shared/softlock-fairness.test.ts'))).toBe(true);
    });
});

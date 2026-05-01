import { describe, expect, it } from 'vitest';
import { GAME_RULES_VERSION } from './contracts';
import {
    createDungeonRunMapState,
    createRunMapState,
    chooseRunMapNode,
    enterSelectedDungeonNode,
    generateRunMapChoices,
    getDungeonMapPresentation,
    getDungeonRouteDecisionPresentation,
    revealDungeonChoices,
    selectDungeonNode
} from './run-map';

describe('REG-069 run map route nodes', () => {
    it('generates deterministic local route choices with shop hooks', () => {
        const a = generateRunMapChoices({ runSeed: 69_001, rulesVersion: GAME_RULES_VERSION, currentFloor: 2 });
        const b = generateRunMapChoices({ runSeed: 69_001, rulesVersion: GAME_RULES_VERSION, currentFloor: 2 });

        expect(a).toEqual(b);
        expect(a.map((node) => node.kind).sort()).toEqual(['combat', 'event', 'shop']);
        expect(a.find((node) => node.kind === 'shop')).toMatchObject({
            label: 'Vendor alcove',
            offlineOnly: true,
            unlocksSystems: ['REG-015', 'REG-070', 'REG-071']
        });
    });

    it('tracks selected node without mutating generated options', () => {
        const state = createRunMapState(42, GAME_RULES_VERSION, 3);
        const selected = chooseRunMapNode(state, state.nextNodes[1]!.id);

        expect(state.selectedNodeId).toBeNull();
        expect(selected.selectedNodeId).toBe(state.nextNodes[1]!.id);
        expect(chooseRunMapNode(state, 'missing')).toBe(state);
    });

    it('surfaces deterministic treasure and secret hooks on the route map', () => {
        const treasure = generateRunMapChoices({ runSeed: 75_001, rulesVersion: GAME_RULES_VERSION, currentFloor: 3 });
        const secret = generateRunMapChoices({ runSeed: 75_001, rulesVersion: GAME_RULES_VERSION, currentFloor: 6 });

        expect(treasure.map((node) => node.kind)).toContain('treasure');
        expect(treasure.find((node) => node.kind === 'treasure')).toMatchObject({
            label: 'Treasure gallery',
            unlocksSystems: ['REG-017', 'REG-069', 'REG-075']
        });
        expect(secret.find((node) => node.kind === 'event')?.detail).toContain('oddity');
    });

    it('promotes route choices into a persistent dungeon graph', () => {
        const routeChoices = [
            {
                id: 'choice:safe',
                routeType: 'safe' as const,
                label: 'Safe passage',
                detail: 'Standard next floor.'
            },
            {
                id: 'choice:greed',
                routeType: 'greed' as const,
                label: 'Greedy route',
                detail: 'Higher pressure route hook.'
            },
            {
                id: 'choice:mystery',
                routeType: 'mystery' as const,
                label: 'Mystery route',
                detail: 'Hidden treasure or secret-room hook.'
            }
        ];
        const initial = createDungeonRunMapState(99, GAME_RULES_VERSION, 1);
        const revealed = revealDungeonChoices(initial, 1, routeChoices);
        const selected = selectDungeonNode(revealed, 'choice:greed');
        const entered = enterSelectedDungeonNode(selected);

        expect(revealed.nodes.find((node) => node.id === initial.currentNodeId)?.status).toBe('cleared');
        expect(revealed.nodes.filter((node) => node.status === 'revealed')).toHaveLength(3);
        expect(entered.currentNodeId).toBe('choice:greed');
        expect(entered.nodes.find((node) => node.id === 'choice:greed')).toMatchObject({
            kind: 'elite',
            status: 'current'
        });
        expect(entered.nodes.find((node) => node.id === 'choice:safe')?.status).toBe('skipped');
    });

    it('builds UI-ready room and map presentation for the dungeon shell', () => {
        const routeChoices = [
            {
                id: 'choice:safe',
                routeType: 'safe' as const,
                label: 'Safe passage',
                detail: 'Standard next floor.'
            },
            {
                id: 'choice:greed',
                routeType: 'greed' as const,
                label: 'Greedy route',
                detail: 'Higher pressure route hook.'
            }
        ];
        const map = revealDungeonChoices(createDungeonRunMapState(101, GAME_RULES_VERSION, 1), 1, routeChoices);
        const presentation = getDungeonMapPresentation(map);

        expect(presentation.current).toMatchObject({
            label: 'Dungeon gate',
            glyph: 'G',
            tone: 'safe'
        });
        expect(presentation.revealed.map((node) => node.label)).toEqual(['Safe passage', 'Greedy route']);
        expect(presentation.revealed.find((node) => node.id === 'choice:greed')).toMatchObject({
            mechanic: 'Elite enemy pressure and greed anchors.',
            tone: 'danger'
        });
        expect(presentation.bossDistance).toBe(5);
    });

    it('DNG-010 builds route decision rows with consistent risk and reward columns', () => {
        const routeChoices = [
            {
                id: 'choice:safe',
                routeType: 'safe' as const,
                label: 'Safe passage',
                detail: 'Standard next floor.',
                rewardPreview: 'Steady clear route.',
                riskPreview: 'Low threat.'
            },
            {
                id: 'choice:greed',
                routeType: 'greed' as const,
                label: 'Greedy route',
                detail: 'Higher pressure route hook.',
                rewardPreview: 'Better cache odds.',
                riskPreview: 'High pressure.'
            },
            {
                id: 'choice:mystery',
                routeType: 'mystery' as const,
                label: 'Mystery route',
                detail: 'Hidden treasure or secret-room hook.',
                rewardPreview: 'Unknown room reward.',
                riskPreview: 'Unusual rules.'
            }
        ];
        const decision = getDungeonRouteDecisionPresentation(
            createDungeonRunMapState(101, GAME_RULES_VERSION, 1),
            routeChoices
        );

        expect(decision.current?.label).toBe('Dungeon gate');
        expect(decision.rows.map((row) => row.choiceLabel)).toEqual(['Safe passage', 'Greedy route', 'Mystery route']);
        expect(decision.rows.every((row) => row.sourceNodeId === decision.current?.id)).toBe(true);
        expect(decision.rows.every((row) => row.targetFloor === 2)).toBe(true);
        expect(decision.rows.map((row) => row.reward)).toEqual(['Steady clear route.', 'Better cache odds.', 'Unknown room reward.']);
        expect(decision.rows.map((row) => row.risk)).toEqual(['Low threat.', 'High pressure.', 'Unusual rules.']);
        expect(decision.rows.find((row) => row.id === 'choice:greed')).toMatchObject({
            nodeKind: 'elite',
            tone: 'danger',
            mechanic: 'Elite enemy pressure and greed anchors.'
        });
        expect(decision.summary).toContain('Safe passage: Standard next floor.');
    });
});

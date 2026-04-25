import type { RouteChoice, RouteNodeType } from './contracts';

export type RunMapNodeKind = 'combat' | 'shop' | 'elite' | 'rest' | 'event' | 'treasure';

export interface RunMapNode {
    id: string;
    floor: number;
    routeType: RouteNodeType;
    kind: RunMapNodeKind;
    label: string;
    detail: string;
    offlineOnly: true;
    unlocksSystems: string[];
}

export interface RunMapPreview {
    seed: number;
    rulesVersion: number;
    currentFloor: number;
    nextNodes: RunMapNode[];
}

export interface RunMapState extends RunMapPreview {
    selectedNodeId: string | null;
}

const kindFromRouteType = (routeType: RouteNodeType, floor: number): RunMapNodeKind => {
    if (routeType === 'greed') {
        return floor % 3 === 0 ? 'shop' : 'elite';
    }
    if (routeType === 'safe') {
        return 'combat';
    }
    return routeType === 'mystery' ? 'event' : routeType;
};

const labelForKind = (kind: RunMapNodeKind): string => {
    switch (kind) {
        case 'shop':
            return 'Vendor alcove';
        case 'elite':
            return 'Elite memory';
        case 'rest':
            return 'Quiet rest';
        case 'event':
            return 'Odd event';
        case 'treasure':
            return 'Treasure gallery';
        case 'combat':
        default:
            return 'Survey hall';
    }
};

const systemsForKind = (kind: RunMapNodeKind): string[] =>
    kind === 'shop'
        ? ['REG-015', 'REG-070', 'REG-071']
        : kind === 'event'
          ? ['REG-017', 'REG-069', 'REG-074']
          : kind === 'treasure'
            ? ['REG-017', 'REG-069', 'REG-075']
            : ['REG-017', 'REG-069'];

const kindFromRouteChoice = (choice: RouteChoice, fallbackFloor: number): RunMapNodeKind => {
    if (choice.routeType === 'mystery' && choice.detail.toLowerCase().includes('treasure')) {
        return 'treasure';
    }
    return kindFromRouteType(choice.routeType, fallbackFloor);
};

export const routeChoiceToMapNode = (choice: RouteChoice, fallbackFloor: number): RunMapNode => ({
    id: choice.id,
    floor: fallbackFloor,
    routeType: choice.routeType,
    kind: kindFromRouteChoice(choice, fallbackFloor),
    label: labelForKind(kindFromRouteChoice(choice, fallbackFloor)),
    detail: choice.detail,
    offlineOnly: true,
    unlocksSystems: systemsForKind(kindFromRouteChoice(choice, fallbackFloor))
});

export const generateRunMapChoices = ({
    runSeed,
    rulesVersion,
    currentFloor
}: {
    runSeed: number;
    rulesVersion: number;
    currentFloor: number;
}): RunMapNode[] => {
    const nextFloor = currentFloor + 1;
    const base = `${rulesVersion}:${runSeed}:${nextFloor}`;
    const safe: RouteChoice = {
        id: `${base}:safe`,
        routeType: 'safe',
        label: 'Safe passage',
        detail: 'Standard next floor. Keep the run curve predictable.'
    };
    const greed: RouteChoice = {
        id: `${base}:greed`,
        routeType: 'greed',
        label: 'Greedy route',
        detail:
            nextFloor % 3 === 0
                ? 'Higher pressure route hook with vendor access after the next floor.'
                : 'Higher pressure route hook for future shop, elite, or bonus rewards.'
    };
    const mystery: RouteChoice = {
        id: `${base}:mystery`,
        routeType: 'mystery',
        label: 'Mystery route',
        detail:
            nextFloor % 4 === 0
                ? 'Hidden treasure or secret-room hook with capped bonus rewards.'
                : 'Random event and secret-room hook with replayable local RNG.'
    };
    return [safe, greed, mystery].map((choice) => routeChoiceToMapNode(choice, nextFloor));
};

export const createRunMapState = (seed: number, rulesVersion: number, currentFloor: number): RunMapState => ({
    seed,
    rulesVersion,
    currentFloor,
    nextNodes: generateRunMapChoices({ runSeed: seed, rulesVersion, currentFloor }),
    selectedNodeId: null
});

export const chooseRunMapNode = (state: RunMapState, nodeId: string): RunMapState => {
    if (!state.nextNodes.some((node) => node.id === nodeId)) {
        return state;
    }
    return { ...state, selectedNodeId: nodeId };
};

export const buildRunMapPreview = (
    seed: number,
    rulesVersion: number,
    currentFloor: number,
    choices: readonly RouteChoice[]
): RunMapPreview => ({
    seed,
    rulesVersion,
    currentFloor,
    nextNodes: choices.map((choice) => routeChoiceToMapNode(choice, currentFloor + 1))
});

export const runMapHasShopHook = (preview: RunMapPreview): boolean =>
    preview.nextNodes.some((node) => node.detail.toLowerCase().includes('shop') || node.routeType === 'greed');

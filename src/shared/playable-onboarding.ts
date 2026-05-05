import type { BoardState, RunState, SaveData } from './contracts';

export type OnboardingStepId = 'first_match' | 'recovery' | 'handoff';

export interface OnboardingStepRow {
    id: OnboardingStepId;
    title: string;
    body: string;
    status: 'active' | 'complete' | 'locked';
    targetTileIds: string[];
    mobilePlacement: 'top' | 'bottom';
}

export interface OnboardingScenario {
    replayAvailable: true;
    skipAvailable: true;
    completed: boolean;
    steps: OnboardingStepRow[];
    activeStep: OnboardingStepRow | null;
}

export interface PlayableOnboardingPrompt {
    id: OnboardingStepId;
    title: string;
    prompt: string;
    detail: string;
    targetTileIds: string[];
}

const firstUnmatchedPair = (board: BoardState | null): string[] => {
    if (!board) {
        return [];
    }
    const byPair = new Map<string, string[]>();
    for (const tile of board.tiles) {
        if (tile.state === 'matched' || tile.pairKey === '__decoy__' || tile.pairKey === '__wild__') {
            continue;
        }
        byPair.set(tile.pairKey, [...(byPair.get(tile.pairKey) ?? []), tile.id]);
    }
    return [...byPair.values()].find((ids) => ids.length >= 2)?.slice(0, 2) ?? [];
};

export const getPlayableOnboardingScenario = ({
    board,
    onboardingDismissed
}: {
    board: BoardState | null;
    onboardingDismissed: boolean;
    powersFtueSeen?: boolean;
}): OnboardingScenario => {
    const completed = onboardingDismissed;
    const matchedPairs = board?.matchedPairs ?? 0;
    const targetTileIds = firstUnmatchedPair(board);
    const activeId: OnboardingStepId = completed
        ? 'handoff'
        : !board || board.level > 2
          ? 'handoff'
          : matchedPairs <= 0
            ? 'first_match'
            : matchedPairs === 1
              ? 'recovery'
              : 'handoff';
    const order: OnboardingStepId[] = ['first_match', 'recovery', 'handoff'];
    const stepIndex = order.indexOf(activeId);
    const steps: OnboardingStepRow[] = [
        {
            id: 'first_match',
            title: 'Make your first match',
            body: 'Flip the highlighted pair. Matching teaches score and streak faster than a rules modal.',
            status: activeId === 'first_match' ? 'active' : stepIndex > 1 ? 'complete' : 'locked',
            targetTileIds,
            mobilePlacement: 'bottom'
        },
        {
            id: 'recovery',
            title: 'Use recovery tools',
            body: 'Shards, peek, shuffle, and route rewards help you recover after the board gets harder.',
            status: activeId === 'recovery' ? 'active' : stepIndex > 3 ? 'complete' : 'locked',
            targetTileIds,
            mobilePlacement: 'bottom'
        },
        {
            id: 'handoff',
            title: 'You have control',
            body: 'Tutorial prompts stay off in normal runs. Replay or reset onboarding from the profile flow later.',
            status: activeId === 'handoff' ? 'active' : 'locked',
            targetTileIds: [],
            mobilePlacement: 'top'
        }
    ];

    return {
        replayAvailable: true,
        skipAvailable: true,
        completed,
        steps,
        activeStep: steps.find((step) => step.id === activeId) ?? null
    };
};

export const getPlayableOnboardingScenarioForSave = (save: SaveData, board: BoardState | null): OnboardingScenario =>
    getPlayableOnboardingScenario({
        board,
        onboardingDismissed: save.onboardingDismissed,
        powersFtueSeen: save.powersFtueSeen
    });

export const getPlayableOnboardingStep = (
    run: RunState,
    save: Pick<SaveData, 'onboardingDismissed' | 'powersFtueSeen'>
): PlayableOnboardingPrompt | null => {
    const scenario = getPlayableOnboardingScenario({
        board: run.board,
        onboardingDismissed: save.onboardingDismissed,
        powersFtueSeen: save.powersFtueSeen
    });
    const step = scenario.activeStep;

    if (scenario.completed || !step || step.id === 'handoff' || run.status !== 'playing') {
        return null;
    }

    return {
        id: step.id,
        title: step.title,
        prompt: step.title,
        detail: step.body,
        targetTileIds: step.targetTileIds
    };
};

export const getPlayableOnboardingPrompt = getPlayableOnboardingStep;

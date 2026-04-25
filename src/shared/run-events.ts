import { hashStringToSeed } from './rng';
import type { RunState } from './contracts';

export type RunEventId = 'lost_cache' | 'mirror_bargain' | 'quiet_lantern';
export type RunEventChoiceEffect = 'gain_shop_gold' | 'gain_relic_favor' | 'heal_or_guard' | 'skip';

export interface RunEventChoice {
    id: string;
    label: string;
    effect: RunEventChoiceEffect;
    detail: string;
    resultText?: string;
}

export interface RunEventDefinition {
    id: RunEventId;
    title: string;
    body: string;
    choices: readonly RunEventChoice[];
}

export interface RunEventState extends RunEventDefinition {
    eventKey: string;
    runSeed: number;
    rulesVersion: number;
    floor: number;
    offlineOnly: true;
    options: readonly (RunEventChoice & { resultText: string })[];
}

export const RUN_EVENT_TABLE: readonly RunEventDefinition[] = [
    {
        id: 'lost_cache',
        title: 'Lost cache',
        body: 'A sealed satchel lies between rooms. It can fund the vendor, or you can leave it untouched.',
        choices: [
            { id: 'take_gold', label: 'Take 2 gold', effect: 'gain_shop_gold', detail: '+2 shop gold this run.' },
            { id: 'leave_cache', label: 'Leave it', effect: 'skip', detail: 'No change; safest for purist routing.' }
        ]
    },
    {
        id: 'mirror_bargain',
        title: 'Mirror bargain',
        body: 'The mirror offers relic momentum in exchange for a riskier route memory.',
        choices: [
            { id: 'accept_favor', label: 'Accept favor', effect: 'gain_relic_favor', detail: '+1 relic Favor progress.' },
            { id: 'decline_mirror', label: 'Decline', effect: 'skip', detail: 'No change.' }
        ]
    },
    {
        id: 'quiet_lantern',
        title: 'Quiet lantern',
        body: 'A dim lantern steadies the party before the next floor.',
        choices: [
            { id: 'rest_light', label: 'Rest in the light', effect: 'heal_or_guard', detail: '+1 life if wounded; otherwise +1 guard token if uncapped.' },
            { id: 'press_on', label: 'Press on', effect: 'skip', detail: 'No change.' }
        ]
    }
] as const;

const eventIndexFor = (runSeed: number, rulesVersion: number, floor: number): number => {
    const seed = hashStringToSeed(`runEvent:${rulesVersion}:${runSeed}:${floor}`);
    return Math.abs(seed) % RUN_EVENT_TABLE.length;
};

export const generateRunEvent = ({
    runSeed,
    rulesVersion,
    floor
}: {
    runSeed: number;
    rulesVersion: number;
    floor: number;
}): RunEventState => {
    const def = RUN_EVENT_TABLE[eventIndexFor(runSeed, rulesVersion, floor)]!;
    return {
        ...def,
        options: def.choices.map((choice) => ({ ...choice, resultText: choice.detail })),
        eventKey: `${rulesVersion}:${runSeed}:${floor}:${def.id}`,
        runSeed,
        rulesVersion,
        floor,
        offlineOnly: true
    };
};

export const rollRunEventRoom = generateRunEvent;

export interface RunEventPreviewState {
    shopGold: number;
    lives: number;
    relicFavorProgress: number;
}

export const chooseRunEventOption = (
    state: RunEventPreviewState,
    event: RunEventState,
    choiceId: string
): {
    applied: boolean;
    eventId: RunEventId;
    choiceId: string;
    next: RunEventPreviewState;
    reason?: 'missing_choice';
} => {
    const choice = event.options.find((item) => item.id === choiceId);
    if (!choice) {
        return { applied: false, eventId: event.id, choiceId, next: state, reason: 'missing_choice' };
    }
    let next = { ...state };
    if (choice.effect === 'gain_shop_gold') {
        next = { ...next, shopGold: next.shopGold + 2 };
    } else if (choice.effect === 'gain_relic_favor') {
        next = { ...next, relicFavorProgress: (next.relicFavorProgress + 1) % 3 };
    } else if (choice.effect === 'heal_or_guard') {
        next = { ...next, lives: Math.min(5, next.lives + 1) };
    }
    return { applied: true, eventId: event.id, choiceId, next };
};

export interface RunEventResolution {
    run: RunState;
    applied: boolean;
    reason?: 'missing_choice';
}

const gainOneFavor = (run: RunState): RunState => {
    const total = run.relicFavorProgress + 1;
    const bonusPicks = Math.floor(total / 3);
    return {
        ...run,
        bonusRelicPicksNextOffer: run.bonusRelicPicksNextOffer + bonusPicks,
        favorBonusRelicPicksNextOffer: run.favorBonusRelicPicksNextOffer + bonusPicks,
        relicFavorProgress: total % 3
    };
};

export const applyRunEventChoice = (
    run: RunState,
    event: RunEventState,
    choiceId: string
): RunEventResolution => {
    const choice = event.choices.find((item) => item.id === choiceId);
    if (!choice) {
        return { run, applied: false, reason: 'missing_choice' };
    }
    switch (choice.effect) {
        case 'gain_shop_gold':
            return { run: { ...run, shopGold: run.shopGold + 2 }, applied: true };
        case 'gain_relic_favor':
            return { run: gainOneFavor(run), applied: true };
        case 'heal_or_guard':
            if (run.lives < 5) {
                return { run: { ...run, lives: run.lives + 1 }, applied: true };
            }
            return {
                run: { ...run, stats: { ...run.stats, guardTokens: Math.min(2, run.stats.guardTokens + 1) } },
                applied: true
            };
        case 'skip':
        default:
            return { run, applied: true };
    }
};

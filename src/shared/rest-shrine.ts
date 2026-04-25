import { MAX_LIVES, type RunState } from './contracts';

export type RestShrineServiceId = 'rest_heal' | 'shrine_bargain';
export type RestShrineRisk = 'safe' | 'risk';

export interface RestShrineServiceDefinition {
    serviceId: RestShrineServiceId;
    label: string;
    description: string;
    cost: number;
    risk: RestShrineRisk;
}

export interface RestShrineServiceState extends RestShrineServiceDefinition {
    id: string;
    available: boolean;
    unavailableReason: string | null;
    purchased: boolean;
}

export const REST_SHRINE_SERVICE_CATALOG: Record<RestShrineServiceId, RestShrineServiceDefinition> = {
    rest_heal: {
        serviceId: 'rest_heal',
        label: 'Rest heal',
        description: 'Spend shop gold to restore 1 life, capped by max lives.',
        cost: 2,
        risk: 'safe'
    },
    shrine_bargain: {
        serviceId: 'shrine_bargain',
        label: 'Shrine bargain',
        description: 'Spend shop gold for +1 relic Favor progress.',
        cost: 3,
        risk: 'risk'
    }
};

export const createRestShrineServices = (run: RunState): RestShrineServiceState[] =>
    (Object.keys(REST_SHRINE_SERVICE_CATALOG) as RestShrineServiceId[]).map((serviceId, index) => {
        const base = REST_SHRINE_SERVICE_CATALOG[serviceId];
        const available = serviceId !== 'rest_heal' || run.lives < MAX_LIVES;
        return {
            ...base,
            id: `${run.runRulesVersion}:${run.runSeed}:${run.board?.level ?? run.stats.highestLevel}:rest:${index}`,
            available,
            unavailableReason: available ? null : 'Life already full.',
            purchased: false
        };
    });

export const restShrineServiceCanAfford = (run: RunState, service: RestShrineServiceState): boolean =>
    service.available && run.shopGold >= service.cost;

export interface RestShrinePurchaseResult {
    run: RunState;
    services: RestShrineServiceState[];
    purchased: boolean;
    reason?: 'missing' | 'unavailable' | 'insufficient_funds' | 'sold_out';
    lives?: number;
    shopGold?: number;
    relicFavorProgress?: number;
}

const gainOneFavorProgress = (run: RunState): Pick<RunState, 'bonusRelicPicksNextOffer' | 'favorBonusRelicPicksNextOffer' | 'relicFavorProgress'> => {
    const total = run.relicFavorProgress + 1;
    const bonusPicks = Math.floor(total / 3);
    return {
        bonusRelicPicksNextOffer: run.bonusRelicPicksNextOffer + bonusPicks,
        favorBonusRelicPicksNextOffer: run.favorBonusRelicPicksNextOffer + bonusPicks,
        relicFavorProgress: total % 3
    };
};

export const purchaseRestShrineService = (
    run: RunState,
    services: readonly RestShrineServiceState[],
    serviceId: string
): RestShrinePurchaseResult => {
    const service = services.find((item) => item.id === serviceId);
    if (!service) {
        return { run, services: [...services], purchased: false, reason: 'missing' };
    }
    if (service.purchased) {
        return { run, services: [...services], purchased: false, reason: 'sold_out' };
    }
    if (!service.available) {
        return { run, services: [...services], purchased: false, reason: 'unavailable' };
    }
    if (!restShrineServiceCanAfford(run, service)) {
        return { run, services: [...services], purchased: false, reason: 'insufficient_funds' };
    }

    let nextRun: RunState = { ...run, shopGold: run.shopGold - service.cost };
    if (service.serviceId === 'rest_heal') {
        nextRun = { ...nextRun, lives: Math.min(MAX_LIVES, nextRun.lives + 1) };
    } else {
        nextRun = { ...nextRun, ...gainOneFavorProgress(nextRun) };
    }

    return {
        ...nextRun,
        run: nextRun,
        services: services.map((item) => (item.id === serviceId ? { ...item, purchased: true } : item)),
        purchased: true,
        lives: nextRun.lives,
        shopGold: nextRun.shopGold,
        relicFavorProgress: nextRun.relicFavorProgress
    };
};

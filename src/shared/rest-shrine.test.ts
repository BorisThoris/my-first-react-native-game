import { describe, expect, it } from 'vitest';
import { MAX_LIVES } from './contracts';
import { createNewRun, finishMemorizePhase } from './game-core';
import { createRestShrineServices, purchaseRestShrineService } from './rest-shrine';

describe('REG-073 rest shrine services', () => {
    it('exposes safe heal and risk bargain services with clear failure paths', () => {
        const run = { ...finishMemorizePhase(createNewRun(0, { echoFeedbackEnabled: false })), shopGold: 5, lives: MAX_LIVES };
        const servicesAtFull = createRestShrineServices(run);
        const healFull = servicesAtFull.find((service) => service.serviceId === 'rest_heal')!;
        expect(healFull.available).toBe(false);
        expect(healFull.unavailableReason).toBe('Life already full.');

        const damaged = { ...run, lives: 3 };
        const services = createRestShrineServices(damaged);
        const heal = services.find((service) => service.serviceId === 'rest_heal')!;
        const bargain = services.find((service) => service.serviceId === 'shrine_bargain')!;

        const healed = purchaseRestShrineService(damaged, services, heal.id);
        expect(healed.lives).toBe(4);
        expect(healed.shopGold).toBe(damaged.shopGold - heal.cost);
        expect(healed.services.find((service) => service.id === heal.id)?.purchased).toBe(true);

        const favored = purchaseRestShrineService(damaged, services, bargain.id);
        expect(favored.relicFavorProgress).toBe(damaged.relicFavorProgress + 1);
        expect(favored.shopGold).toBe(damaged.shopGold - bargain.cost);

        const brokeRun = { ...damaged, shopGold: 0 };
        const broke = purchaseRestShrineService(brokeRun, services, bargain.id);
        expect(broke.run).toBe(brokeRun);
    });
});

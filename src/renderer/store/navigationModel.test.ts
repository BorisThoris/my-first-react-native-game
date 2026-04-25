import { describe, expect, it } from 'vitest';
import {
    getNavigationRouteContract,
    NAVIGATION_ROUTE_CONTRACTS,
    resolveNavigationTransition,
    resolveSettingsCloseTarget,
    resolveSubscreenCloseTarget
} from './navigationModel';

describe('navigationModel', () => {
    it('documents bounded page and in-run route contracts', () => {
        expect(getNavigationRouteContract('menu', 'modeSelect', 'open')).toMatchObject({
            presentation: 'page',
            timerPolicy: 'none'
        });
        expect(getNavigationRouteContract('playing', 'inventory', 'open')).toMatchObject({
            presentation: 'in-run-overlay',
            preservesRun: true,
            timerPolicy: 'freeze-on-open'
        });
        expect(getNavigationRouteContract('settings', 'playing', 'back')).toMatchObject({
            timerPolicy: 'resume-on-close'
        });
        expect(NAVIGATION_ROUTE_CONTRACTS.some((route) => route.from === 'gameOver' && route.to === 'menu')).toBe(true);
    });

    it('normalizes impossible playing returns to menu', () => {
        expect(resolveSubscreenCloseTarget({ currentView: 'inventory', returnView: 'playing', runPresent: false })).toBe('menu');
        expect(resolveSettingsCloseTarget({ currentView: 'settings', returnView: 'playing', runPresent: false })).toBe('menu');
    });

    it('keeps settings return targets explicit for mode select and collection', () => {
        expect(
            resolveNavigationTransition(
                {
                    run: null,
                    settingsReturnView: 'menu',
                    subscreenReturnView: 'menu',
                    view: 'modeSelect'
                },
                'openSettings',
                'modeSelect'
            )
        ).toMatchObject({
            settingsReturnView: 'modeSelect',
            view: 'settings'
        });
        expect(
            resolveNavigationTransition(
                {
                    run: null,
                    settingsReturnView: 'modeSelect',
                    subscreenReturnView: 'menu',
                    view: 'settings'
                },
                'closeSettings'
            )
        ).toMatchObject({
            kind: 'setView',
            view: 'modeSelect'
        });
    });
});

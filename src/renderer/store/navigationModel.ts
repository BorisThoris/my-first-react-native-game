import type { RunStatus, SubscreenReturnView, ViewState } from '../../shared/contracts';

export type NavigationSurface =
    | 'boot'
    | 'menu'
    | 'modeSelect'
    | 'collection'
    | 'inventory'
    | 'codex'
    | 'settings'
    | 'playing'
    | 'gameOver';

export type NavigationAction =
    | 'back'
    | 'close'
    | 'escape'
    | 'open'
    | 'pause-toggle'
    | 'return';

export type NavigationPresentation = 'page' | 'in-run-overlay' | 'status-overlay';

export interface NavigationRouteContract {
    action: NavigationAction;
    from: NavigationSurface;
    preservesRun: boolean;
    presentation: NavigationPresentation;
    timerPolicy: 'none' | 'freeze-on-open' | 'resume-on-close' | 'no-resume';
    to: NavigationSurface;
}

interface ResolveCloseInput {
    currentView: ViewState;
    returnView: SubscreenReturnView;
    runPresent: boolean;
}

type RequestedSettingsReturnView = SubscreenReturnView | 'settings';

const MENU_RETURN_VIEWS = new Set<ViewState>(['modeSelect', 'collection', 'inventory', 'codex', 'settings']);
const IN_RUN_META_VIEWS = new Set<ViewState>(['inventory', 'codex', 'settings']);

export const NAVIGATION_ROUTE_CONTRACTS: ReadonlyArray<NavigationRouteContract> = [
    { action: 'open', from: 'menu', to: 'modeSelect', presentation: 'page', preservesRun: false, timerPolicy: 'none' },
    { action: 'back', from: 'modeSelect', to: 'menu', presentation: 'page', preservesRun: false, timerPolicy: 'none' },
    { action: 'open', from: 'menu', to: 'collection', presentation: 'page', preservesRun: false, timerPolicy: 'none' },
    { action: 'back', from: 'collection', to: 'menu', presentation: 'page', preservesRun: false, timerPolicy: 'none' },
    { action: 'open', from: 'menu', to: 'inventory', presentation: 'page', preservesRun: false, timerPolicy: 'none' },
    { action: 'back', from: 'inventory', to: 'menu', presentation: 'page', preservesRun: false, timerPolicy: 'none' },
    { action: 'open', from: 'menu', to: 'codex', presentation: 'page', preservesRun: false, timerPolicy: 'none' },
    { action: 'back', from: 'codex', to: 'menu', presentation: 'page', preservesRun: false, timerPolicy: 'none' },
    { action: 'open', from: 'menu', to: 'settings', presentation: 'page', preservesRun: false, timerPolicy: 'none' },
    { action: 'back', from: 'settings', to: 'menu', presentation: 'page', preservesRun: false, timerPolicy: 'none' },
    { action: 'open', from: 'modeSelect', to: 'settings', presentation: 'page', preservesRun: false, timerPolicy: 'none' },
    { action: 'back', from: 'settings', to: 'modeSelect', presentation: 'page', preservesRun: false, timerPolicy: 'none' },
    {
        action: 'open',
        from: 'collection',
        to: 'settings',
        presentation: 'page',
        preservesRun: false,
        timerPolicy: 'none'
    },
    { action: 'back', from: 'settings', to: 'collection', presentation: 'page', preservesRun: false, timerPolicy: 'none' },
    {
        action: 'open',
        from: 'playing',
        to: 'inventory',
        presentation: 'in-run-overlay',
        preservesRun: true,
        timerPolicy: 'freeze-on-open'
    },
    {
        action: 'back',
        from: 'inventory',
        to: 'playing',
        presentation: 'in-run-overlay',
        preservesRun: true,
        timerPolicy: 'resume-on-close'
    },
    {
        action: 'open',
        from: 'playing',
        to: 'codex',
        presentation: 'in-run-overlay',
        preservesRun: true,
        timerPolicy: 'freeze-on-open'
    },
    {
        action: 'back',
        from: 'codex',
        to: 'playing',
        presentation: 'in-run-overlay',
        preservesRun: true,
        timerPolicy: 'resume-on-close'
    },
    {
        action: 'open',
        from: 'playing',
        to: 'settings',
        presentation: 'in-run-overlay',
        preservesRun: true,
        timerPolicy: 'freeze-on-open'
    },
    {
        action: 'back',
        from: 'settings',
        to: 'playing',
        presentation: 'in-run-overlay',
        preservesRun: true,
        timerPolicy: 'resume-on-close'
    },
    {
        action: 'pause-toggle',
        from: 'playing',
        to: 'playing',
        presentation: 'status-overlay',
        preservesRun: true,
        timerPolicy: 'freeze-on-open'
    },
    {
        action: 'return',
        from: 'playing',
        to: 'gameOver',
        presentation: 'page',
        preservesRun: true,
        timerPolicy: 'no-resume'
    },
    { action: 'back', from: 'gameOver', to: 'menu', presentation: 'page', preservesRun: false, timerPolicy: 'none' }
];

export const getNavigationRouteContract = (
    from: NavigationSurface,
    to: NavigationSurface,
    action: NavigationAction
): NavigationRouteContract | null =>
    NAVIGATION_ROUTE_CONTRACTS.find((route) => route.from === from && route.to === to && route.action === action) ?? null;

export const isRunStatusResumableAfterMetaOverlay = (status: RunStatus): boolean =>
    status === 'memorize' || status === 'playing' || status === 'resolving';

export const resolveSubscreenCloseTarget = ({
    currentView,
    returnView,
    runPresent
}: ResolveCloseInput): SubscreenReturnView => {
    if (returnView === 'playing') {
        return runPresent && (currentView === 'inventory' || currentView === 'codex') ? 'playing' : 'menu';
    }

    return returnView;
};

export const resolveSettingsCloseTarget = ({
    currentView,
    returnView,
    runPresent
}: ResolveCloseInput): SubscreenReturnView => {
    if (returnView === 'playing') {
        return runPresent && currentView === 'settings' ? 'playing' : 'menu';
    }

    return returnView;
};

export const isMenuDestinationView = (view: ViewState): boolean => MENU_RETURN_VIEWS.has(view);

export const isInRunMetaView = (view: ViewState): boolean => IN_RUN_META_VIEWS.has(view);

export type StoreNavigationAction =
    | 'closeSettings'
    | 'closeSubscreen'
    | 'openCodexFromMenu'
    | 'openCodexFromPlaying'
    | 'openCollection'
    | 'openInventoryFromMenu'
    | 'openInventoryFromPlaying'
    | 'openModeSelect'
    | 'openSettings';

export type StoreNavigationTransition =
    {
        kind: 'setView';
        freezeRun?: boolean;
        resumeRun?: boolean;
        settingsReturnView?: SubscreenReturnView;
        subscreenReturnView?: SubscreenReturnView;
        view: ViewState;
    };

interface StoreNavigationState {
    run: unknown | null;
    settingsReturnView: SubscreenReturnView;
    subscreenReturnView: SubscreenReturnView;
    view: ViewState;
}

export const resolveNavigationTransition = (
    state: StoreNavigationState,
    action: StoreNavigationAction,
    requestedReturnView: RequestedSettingsReturnView = 'menu'
): StoreNavigationTransition => {
    const safeRequestedReturnView = requestedReturnView === 'settings' ? 'menu' : requestedReturnView;

    switch (action) {
        case 'openModeSelect':
            return { kind: 'setView', view: 'modeSelect', subscreenReturnView: 'menu' };
        case 'openCollection':
            return { kind: 'setView', view: 'collection', subscreenReturnView: 'menu' };
        case 'openInventoryFromMenu':
            return { kind: 'setView', view: 'inventory', subscreenReturnView: 'menu' };
        case 'openCodexFromMenu':
            return { kind: 'setView', view: 'codex', subscreenReturnView: 'menu' };
        case 'openInventoryFromPlaying':
            return state.run && state.view === 'playing'
                ? { kind: 'setView', view: 'inventory', subscreenReturnView: 'playing', freezeRun: true }
                : { kind: 'setView', view: state.view };
        case 'openCodexFromPlaying':
            return state.run && state.view === 'playing'
                ? { kind: 'setView', view: 'codex', subscreenReturnView: 'playing', freezeRun: true }
                : { kind: 'setView', view: state.view };
        case 'closeSubscreen': {
            const target = resolveSubscreenCloseTarget({
                currentView: state.view,
                returnView: state.subscreenReturnView,
                runPresent: Boolean(state.run)
            });
            if (target === 'menu') {
                return { kind: 'setView', view: 'menu', subscreenReturnView: 'menu' };
            }
            return {
                kind: 'setView',
                view: target,
                resumeRun: target === 'playing'
            };
        }
        case 'openSettings':
            return {
                kind: 'setView',
                view: 'settings',
                settingsReturnView: safeRequestedReturnView,
                freezeRun: safeRequestedReturnView === 'playing' && Boolean(state.run)
            };
        case 'closeSettings': {
            const target = resolveSettingsCloseTarget({
                currentView: state.view,
                returnView: state.settingsReturnView,
                runPresent: Boolean(state.run)
            });
            if (target === 'menu') {
                return { kind: 'setView', view: 'menu', settingsReturnView: 'menu' };
            }
            return {
                kind: 'setView',
                view: target,
                resumeRun: target === 'playing'
            };
        }
        default:
            return { kind: 'setView', view: state.view };
    }
};

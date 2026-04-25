import {
    isNarrowShortLandscapeForMenuStack,
    isShortLandscapeViewport,
    VIEWPORT_MOBILE_MAX,
    VIEWPORT_TABLET_MAX
} from './breakpoints';

export type ResponsiveViewportKind = 'phone_portrait' | 'phone_landscape' | 'tablet' | 'short_desktop' | 'desktop';
export type ResponsiveSmokeScreen =
    | 'main_menu'
    | 'choose_path'
    | 'gameplay'
    | 'pause_overlay'
    | 'floor_clear_overlay'
    | 'run_settings_modal'
    | 'game_over';

export interface ResponsiveViewportCase {
    id: string;
    width: number;
    height: number;
    kind: ResponsiveViewportKind;
    mustShowPrimaryAction: true;
    primaryAssertions: string[];
}

export interface ResponsiveScreenRoute {
    screen: ResponsiveSmokeScreen;
    requiredViewportIds: string[];
    primaryActionSelector: string;
    rationale: string;
}

export const HIGH_TRAFFIC_VIEWPORT_MATRIX: readonly ResponsiveViewportCase[] = [
    {
        id: 'phone_360x740',
        width: 360,
        height: 740,
        kind: 'phone_portrait',
        mustShowPrimaryAction: true,
        primaryAssertions: ['Play or current run action visible', 'no horizontal scroll', 'safe-area padding honored']
    },
    {
        id: 'phone_390x844',
        width: 390,
        height: 844,
        kind: 'phone_portrait',
        mustShowPrimaryAction: true,
        primaryAssertions: ['primary action above fold', 'modal footer reachable', 'board remains primary']
    },
    {
        id: 'phone_430x932',
        width: 430,
        height: 932,
        kind: 'phone_portrait',
        mustShowPrimaryAction: true,
        primaryAssertions: ['primary action above fold', 'secondary routes do not compete', 'touch targets readable']
    },
    {
        id: 'phone_landscape_844x390',
        width: 844,
        height: 390,
        kind: 'phone_landscape',
        mustShowPrimaryAction: true,
        primaryAssertions: ['compact landscape shell', 'primary action visible', 'footer/action rail not cropped']
    },
    {
        id: 'tablet_768x1024',
        width: 768,
        height: 1024,
        kind: 'tablet',
        mustShowPrimaryAction: true,
        primaryAssertions: ['tablet density uses non-phone layout where possible', 'meta actions reachable']
    },
    {
        id: 'short_desktop_1024x768',
        width: 1024,
        height: 768,
        kind: 'tablet',
        mustShowPrimaryAction: true,
        primaryAssertions: ['landscape tablet keeps board/menu action hierarchy', 'no modal footer clipping']
    },
    {
        id: 'short_wide_1366x640',
        width: 1366,
        height: 640,
        kind: 'short_desktop',
        mustShowPrimaryAction: true,
        primaryAssertions: ['short desktop density active', 'main actions reachable', 'desktop stage not sparse']
    },
    {
        id: 'desktop_1440x900',
        width: 1440,
        height: 900,
        kind: 'desktop',
        mustShowPrimaryAction: true,
        primaryAssertions: ['roomy desktop baseline', 'no compact-only overflow rules']
    }
] as const;

export const RESPONSIVE_VIEWPORT_MATRIX = HIGH_TRAFFIC_VIEWPORT_MATRIX;

export const RESPONSIVE_SCREEN_ROUTES: readonly ResponsiveScreenRoute[] = [
    {
        screen: 'main_menu',
        requiredViewportIds: ['phone_360x740', 'phone_landscape_844x390', 'short_desktop_1024x768', 'desktop_1440x900'],
        primaryActionSelector: 'button[aria-label="Play"]',
        rationale: 'Hub entry must keep Play dominant before meta links.'
    },
    {
        screen: 'choose_path',
        requiredViewportIds: ['phone_390x844', 'phone_landscape_844x390', 'desktop_1440x900'],
        primaryActionSelector: '[data-testid="choose-path-low-cta"], [data-gauntlet-presets] button, button[aria-label^="Play"]',
        rationale: 'Mode selection must keep at least one selectable/locked-path control visible.'
    },
    {
        screen: 'gameplay',
        requiredViewportIds: ['phone_360x740', 'phone_390x844', 'short_wide_1366x640', 'desktop_1440x900'],
        primaryActionSelector: '[data-testid="board-stage"]',
        rationale: 'Board-first gameplay is the most frequent viewport regression.'
    },
    {
        screen: 'pause_overlay',
        requiredViewportIds: ['phone_390x844', 'phone_landscape_844x390', 'short_wide_1366x640'],
        primaryActionSelector: '[data-testid="game-pause-overlay"] button',
        rationale: 'Pause decisions must not hide resume/exit actions.'
    },
    {
        screen: 'floor_clear_overlay',
        requiredViewportIds: ['phone_390x844', 'phone_landscape_844x390', 'short_wide_1366x640'],
        primaryActionSelector: '[role="dialog"] button',
        rationale: 'Continue and route/shop decisions must be reachable.'
    },
    {
        screen: 'run_settings_modal',
        requiredViewportIds: ['phone_360x740', 'phone_landscape_844x390', 'short_wide_1366x640'],
        primaryActionSelector: '[data-testid="settings-shell-footer"] button',
        rationale: 'Back/Save must remain in a sticky reachable footer.'
    },
    {
        screen: 'game_over',
        requiredViewportIds: ['phone_360x740', 'phone_390x844', 'desktop_1440x900'],
        primaryActionSelector: '[data-testid="game-over-above-fold-summary"] button',
        rationale: 'Retry/menu loop must be above the fold on phones.'
    }
] as const;

export const classifyResponsiveViewport = (width: number, height: number): ResponsiveViewportKind => {
    if (width <= VIEWPORT_MOBILE_MAX && height >= width) {
        return 'phone_portrait';
    }
    if (isNarrowShortLandscapeForMenuStack(width, height)) {
        return 'phone_landscape';
    }
    if (width <= VIEWPORT_TABLET_MAX) {
        return 'tablet';
    }
    if (isShortLandscapeViewport(width, height)) {
        return 'short_desktop';
    }
    return 'desktop';
};

export const responsiveViewportIdsForScreen = (screen: ResponsiveSmokeScreen): string[] =>
    [...(RESPONSIVE_SCREEN_ROUTES.find((route) => route.screen === screen)?.requiredViewportIds ?? [])];

export const getViewportRegressionExpectations = (
    id: string
): {
    compactDensity: boolean;
    menuStacks: boolean;
    settingsLayout: 'stacked' | 'short-stacked' | 'wide-short' | 'desktop';
} => {
    const viewport = HIGH_TRAFFIC_VIEWPORT_MATRIX.find((entry) => entry.id === id);
    if (!viewport) {
        throw new Error(`Unknown viewport id: ${id}`);
    }
    const compactDensity =
        viewport.width <= VIEWPORT_MOBILE_MAX ||
        isShortLandscapeViewport(viewport.width, viewport.height) ||
        (viewport.height <= VIEWPORT_MOBILE_MAX && viewport.width <= VIEWPORT_TABLET_MAX);
    const menuStacks = viewport.width <= VIEWPORT_MOBILE_MAX || isNarrowShortLandscapeForMenuStack(viewport.width, viewport.height);
    const shortLandscape = isShortLandscapeViewport(viewport.width, viewport.height);
    const settingsLayout =
        shortLandscape && menuStacks
            ? 'short-stacked'
            : shortLandscape
              ? 'wide-short'
              : viewport.width <= VIEWPORT_MOBILE_MAX
                ? 'stacked'
                : 'desktop';
    return { compactDensity, menuStacks, settingsLayout };
};

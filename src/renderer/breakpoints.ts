/** Match renderer CSS `@media` thresholds (mobile / tablet / tight phone). */

export const VIEWPORT_MOBILE_MAX = 760;
export const VIEWPORT_TABLET_MAX = 1220;

/**
 * Landscape viewports with limited height (phones, 1280×720, short laptops).
 * Align shell `@media (max-height: 860px)` rules with this value.
 */
export const VIEWPORT_SHORT_LANDSCAPE_MAX_HEIGHT = 860;

export const isShortLandscapeViewport = (width: number, height: number): boolean =>
    width > height && height > 0 && height <= VIEWPORT_SHORT_LANDSCAPE_MAX_HEIGHT;

/**
 * Max width (CSS px) at which short landscape still stacks main-menu hero + support to one column.
 * Wider short HD (e.g. 1280×720, 1920×720) keeps two columns; narrow cases (844×390, 900×700) stack.
 */
export const VIEWPORT_LANDSCAPE_STACK_MAX_WIDTH = 960;

export const isNarrowShortLandscapeForMenuStack = (width: number, height: number): boolean =>
    isShortLandscapeViewport(width, height) && width <= VIEWPORT_LANDSCAPE_STACK_MAX_WIDTH;

/** SSR / Vitest: no `window` access at call time beyond guards. */
export const safeSubscribeWindowResize = (onResize: () => void): (() => void) => {
    if (typeof window === 'undefined') {
        return () => {};
    }
    window.addEventListener('resize', onResize);
    return () => {
        window.removeEventListener('resize', onResize);
    };
};

/** Prefer over reading `window.innerWidth` during static import; defaults match `useViewportSize` SSR fallback. */
export const readWindowInnerSizeFallback = (): { width: number; height: number } => {
    if (typeof window === 'undefined') {
        return { width: 1280, height: 800 };
    }
    return { width: window.innerWidth, height: window.innerHeight };
};

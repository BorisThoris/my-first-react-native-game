/** Match renderer CSS `@media` thresholds (mobile / tablet / tight phone). */
/** @deprecated Scroll-based shell fallback removed; uniform zoom + layout only. Kept for older tests if referenced. */
export const FIT_SHELL_TOUCH_UNIFORM_ZOOM_MIN = 0.935;

export const VIEWPORT_MOBILE_MAX = 760;
export const VIEWPORT_TABLET_MAX = 1220;
export const VIEWPORT_TIGHT_MAX_W = 430;
export const VIEWPORT_TIGHT_MAX_H = 620;

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

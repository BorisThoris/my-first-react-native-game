import type { CameraViewportModePreference } from './contracts';

/**
 * Derives the boolean passed through the tree as `cameraViewportMode` / `mobileCameraMode` (shell CSS +
 * `data-mobile-camera-mode`, `TileBoard` fit margins and touch-gesture mode).
 *
 * **Viewport signal (`viewportWantsMobileCamera`)** — must stay aligned with compact-touch chrome:
 * - `width <= VIEWPORT_MOBILE_MAX` (see `breakpoints.ts`), **or**
 * - `isNarrowShortLandscapeForMenuStack(width, height)` (short landscape *and* width ≤ 960px).
 *
 * So **wide short HD** (e.g. 1280×720) stays **false**: desktop-style board framing matches the roomy main menu
 * shell (`mobile-layout` e2e: “parity with main menu”).
 *
 * **Settings** — `preference` overrides the viewport:
 * - `auto`: use `viewportWantsMobileCamera` (default save = legacy behavior).
 * - `always`: force mobile camera layout even on wide viewports (dense HUD over board; useful for QA / preference).
 * - `never`: force wide layout even on phones; board DPR/fit inside `TileBoard` still use its own `compact` breakpoint,
 *   so pan/zoom chrome may differ from shell — acceptable trade-off for an explicit “off” switch.
 */
export const deriveCameraViewportMode = (
    preference: CameraViewportModePreference,
    viewportWantsMobileCamera: boolean
): boolean => {
    if (preference === 'always') {
        return true;
    }
    if (preference === 'never') {
        return false;
    }
    return viewportWantsMobileCamera;
};

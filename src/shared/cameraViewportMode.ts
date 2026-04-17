import type { CameraViewportModePreference } from './contracts';

/** Must match `VIEWPORT_MOBILE_MAX` in `src/renderer/breakpoints.ts` (shared module cannot import the renderer). */
export const MOBILE_CAMERA_WIDTH_BREAKPOINT = 760;
/** Width hysteresis so resizing across the phone/desktop boundary does not single-frame flip shell/HUD layout. */
export const MOBILE_CAMERA_WIDTH_HYSTERESIS_PX = 20;

/**
 * Latch “phone-width” bucket for `isPhoneViewport` (narrow short-landscape is handled separately in `GameScreen`).
 * Enter at {@link MOBILE_CAMERA_WIDTH_BREAKPOINT}; exit at breakpoint + hysteresis so small oscillations do not pop.
 */
export const latchPhoneWidthForMobileCamera = (width: number, prevLatchedNarrow: boolean): boolean => {
    const exitW = MOBILE_CAMERA_WIDTH_BREAKPOINT + MOBILE_CAMERA_WIDTH_HYSTERESIS_PX;
    if (!prevLatchedNarrow) {
        return width <= MOBILE_CAMERA_WIDTH_BREAKPOINT;
    }
    return width <= exitW;
};

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
 * - `never`: force wide layout even on phones. `TileBoard` sets `compact` from viewport size alone
 *   (`width <= VIEWPORT_MOBILE_MAX` or `isNarrowShortLandscapeForMenuStack` — same predicate as the shell’s compact-touch
 *   signal, but **not** overridden by settings), so DPR cap, fit margins, and desktop-vs-touch pan rules can still follow the
 *   compact board path while the shell stays desktop-style — acceptable trade-off for an explicit “off” switch.
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

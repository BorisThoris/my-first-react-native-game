/**
 * Hub shells (main menu, choose-your-path) share fit-zoom padding rules; centralize literals so
 * breakpoint tweaks stay consistent (`MainMenu`, `ChooseYourPathScreen`).
 */

const HUB_SHELL_FIT_PADDING_SHORT_DESKTOP = 8;
/** Main menu: default inset when viewport is not the wide short-desktop band. */
const HUB_SHELL_FIT_PADDING_MENU_DEFAULT = 12;
/**
 * Choose Your Path: +2px vs menu on the same band — denser mode grid benefits from slightly more
 * breathing room at the fit boundary (path still uses the same short-desktop 8px).
 */
const HUB_SHELL_FIT_PADDING_CHOOSE_PATH_DEFAULT = 14;

type HubShellSurface = 'menu' | 'choosePath';

/**
 * CSS px padding passed to {@link useFitShellZoom} for hub meta shells.
 * Short desktop: `width >= 1024` and `height <= 760` (e.g. 1280×720).
 */
export function getHubShellFitPadding(viewportWidth: number, viewportHeight: number, surface: HubShellSurface): number {
    if (viewportWidth >= 1024 && viewportHeight <= 760) {
        return HUB_SHELL_FIT_PADDING_SHORT_DESKTOP;
    }
    return surface === 'menu' ? HUB_SHELL_FIT_PADDING_MENU_DEFAULT : HUB_SHELL_FIT_PADDING_CHOOSE_PATH_DEFAULT;
}

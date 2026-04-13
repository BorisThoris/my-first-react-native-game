/**
 * Development-only URL sandbox (no effect in production builds).
 *
 * Query keys (all optional except devSandbox gate):
 * - `devSandbox=1` — required to enable parsing; without it, other keys are ignored.
 * - `screen` — `menu` | `settings` | `playing` | `gameOver` | `modeSelect` | `collection` |
 *   `inventory` | `codex` (maps to ViewState; excludes `boot`).
 * - `fixture` — when `screen=playing` (or gameOver where applicable), see `runFixtures.ts`.
 * - `skipIntro=1` — skip StartupIntro when landing on `menu` (App sets intro playback to done).
 *
 * Example:
 *   http://127.0.0.1:5173/?devSandbox=1&screen=playing&fixture=dailyParasite
 *   http://127.0.0.1:5173/?devSandbox=1&screen=settings&skipIntro=1
 *
 * Screenshot workflow (compare to `docs/ENDPRODUCTIMAGE.png`):
 * - `yarn capture:endproduct-parity` — Playwright writes element crops to `docs/visual-capture/endproduct-parity/`
 *   (`hud-*.png`, `tile-board-*.png`). Without the script, the same spec defaults to `test-results/endproduct-parity/`.
 * - Helpers: `e2e/visualScreenHelpers.ts` → `openDevSandboxPlaying`, `gotoWithSaveAndQuery`, `getEndproductParityCaptureDir`.
 */
import type { ViewState } from '../../shared/contracts';

export type DevSandboxScreen = Exclude<ViewState, 'boot'>;

export interface DevSandboxConfig {
    enabled: boolean;
    /** Target shell when `enabled`; null = leave default after hydrate (menu). */
    screen: DevSandboxScreen | null;
    /** Canned run preset for `playing` / `gameOver`; ignored for meta screens without a run. */
    fixture: string | null;
    skipIntro: boolean;
}

const SCREEN_MAP: Record<string, DevSandboxScreen> = {
    menu: 'menu',
    settings: 'settings',
    playing: 'playing',
    gameover: 'gameOver',
    'game-over': 'gameOver',
    modeSelect: 'modeSelect',
    modeselect: 'modeSelect',
    collection: 'collection',
    inventory: 'inventory',
    codex: 'codex'
};

export const parseScreenParam = (raw: string | null): DevSandboxScreen | null => {
    if (!raw) {
        return null;
    }
    const key = raw.trim().toLowerCase();
    return SCREEN_MAP[key] ?? null;
};

export const readDevSandboxConfig = (): DevSandboxConfig => {
    if (!import.meta.env.DEV || typeof window === 'undefined') {
        return { enabled: false, screen: null, fixture: null, skipIntro: false };
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('devSandbox') !== '1') {
        return { enabled: false, screen: null, fixture: null, skipIntro: false };
    }

    const screen = parseScreenParam(params.get('screen'));
    const fixture = params.get('fixture')?.trim() || null;
    const skipIntro = params.get('skipIntro') === '1' || params.get('skipIntro') === 'true';

    return {
        enabled: true,
        screen,
        fixture,
        skipIntro
    };
};

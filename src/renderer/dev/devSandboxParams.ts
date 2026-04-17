/**
 * Development-only URL sandbox (no effect in production builds).
 *
 * Query keys (all optional except devSandbox gate):
 * - `devSandbox=1` — required to enable parsing; without it, other keys are ignored.
 * - `screen` — `menu` | `settings` | `playing` | `gameOver` | `modeSelect` | `collection` |
 *   `inventory` | `codex` (maps to ViewState; excludes `boot`).
 * - `fixture` — when `screen=playing` (or gameOver where applicable), see `runFixtures.ts`.
 * - `skipIntro=1` — skip StartupIntro when landing on `menu` (App sets intro playback to done).
 * - `unlockAchievements=ACH_FIRST_CLEAR,…` — DEV-only: when `screen=playing`, seeds `newlyUnlockedAchievements`
 *   so achievement toasts fire once (E2E / harness).
 *
 * Example:
 *   http://127.0.0.1:5173/?devSandbox=1&screen=playing&fixture=dailyParasite
 *   http://127.0.0.1:5173/?devSandbox=1&screen=settings&skipIntro=1
 *
 * FX shader sandbox (no full game shell — isolated WebGL card + rim fire; DEV only):
 *   http://127.0.0.1:5173/?devSandbox=1&fx=matchedRimFire
 *   Playwright: `yarn capture:matched-flame` → `test-results/matched-flame-capture/` (or set `VISUAL_CAPTURE_ROOT`).
 *
 * Screenshot workflow (compare to `docs/ENDPRODUCTIMAGE.png`):
 * - `yarn capture:endproduct-parity` — Playwright writes element crops to `docs/visual-capture/endproduct-parity/`
 *   (`hud-*.png`, `tile-board-*.png`). Without the script, the same spec defaults to `test-results/endproduct-parity/`.
 * - Helpers: `e2e/visualScreenHelpers.ts` → `openDevSandboxPlaying`, `gotoWithSaveAndQuery`, `getEndproductParityCaptureDir`.
 */
import type { AchievementId, ViewState } from '../../shared/contracts';
import { ACHIEVEMENT_IDS } from '../../shared/save-data';

const ACHIEVEMENT_ID_SET = new Set<string>(ACHIEVEMENT_IDS);

const parseUnlockAchievementsParam = (params: URLSearchParams): AchievementId[] => {
    const raw = params.get('unlockAchievements')?.trim();
    if (!raw) {
        return [];
    }
    const out: AchievementId[] = [];
    for (const token of raw.split(',')) {
        const id = token.trim();
        if (ACHIEVEMENT_ID_SET.has(id)) {
            out.push(id as AchievementId);
        }
    }
    return out;
};

export type DevSandboxScreen = Exclude<ViewState, 'boot'>;

/** Isolated FX previews (replace app chrome; `devSandbox=1` required). */
export type FxSandboxId = 'matchedRimFire';

export interface DevSandboxConfig {
    enabled: boolean;
    /** When set, `App` renders only this FX preview (ignores `screen` / store sandbox navigation). */
    fxSandbox: FxSandboxId | null;
    /** Target shell when `enabled`; null = leave default after hydrate (menu). */
    screen: DevSandboxScreen | null;
    /** Canned run preset for `playing` / `gameOver`; ignored for meta screens without a run. */
    fixture: string | null;
    skipIntro: boolean;
    /** When `screen=playing`, applied as `newlyUnlockedAchievements` for toast harness (DEV only). */
    unlockAchievements: AchievementId[];
}

/** Default when dev sandbox is off or unavailable — use `resetDevSandboxConfig()` for a fresh object in tests / dev UI. */
export const DEV_SANDBOX_DEFAULT_CONFIG: DevSandboxConfig = {
    enabled: false,
    fxSandbox: null,
    screen: null,
    fixture: null,
    skipIntro: false,
    unlockAchievements: []
};

export const resetDevSandboxConfig = (): DevSandboxConfig => ({
    ...DEV_SANDBOX_DEFAULT_CONFIG,
    unlockAchievements: [...DEV_SANDBOX_DEFAULT_CONFIG.unlockAchievements]
});

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

const parseFxSandboxParam = (raw: string | null): FxSandboxId | null => {
    if (!raw) {
        return null;
    }
    const key = raw.trim().toLowerCase().replace(/-/g, '');
    if (key === 'matchedrimfire') {
        return 'matchedRimFire';
    }
    return null;
};

export const readDevSandboxConfig = (): DevSandboxConfig => {
    if (!import.meta.env.DEV || typeof window === 'undefined') {
        return resetDevSandboxConfig();
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('devSandbox') !== '1') {
        return resetDevSandboxConfig();
    }

    const fxSandbox = parseFxSandboxParam(params.get('fx'));
    const screen = parseScreenParam(params.get('screen'));
    const fixture = params.get('fixture')?.trim() || null;
    const skipIntro = params.get('skipIntro') === '1' || params.get('skipIntro') === 'true';

    return {
        enabled: true,
        fxSandbox,
        screen,
        fixture,
        skipIntro,
        unlockAchievements: parseUnlockAchievementsParam(params)
    };
};

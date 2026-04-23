import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/react/shallow';
import ChooseYourPathScreen from './components/ChooseYourPathScreen';
import CodexScreen from './components/CodexScreen';
import CollectionScreen from './components/CollectionScreen';
import GameOverScreen from './components/GameOverScreen';
import GameScreen from './components/GameScreen';
import InventoryScreen from './components/InventoryScreen';
import MainMenu from './components/MainMenu';
import SettingsScreen from './components/SettingsScreen';
import { GAMEPLAY_VISUAL_CSS_VARS } from './components/gameplayVisualConfig';
import metaScreenStyles from './components/MetaScreen.module.css';
import StartupIntro from './components/StartupIntro';
import type { IntroPlaybackState } from './components/startupIntroConfig';
import { VIEWPORT_MOBILE_MAX, VIEWPORT_TABLET_MAX } from './breakpoints';
import { useViewportSize } from './hooks/useViewportSize';
import styles from './styles/App.module.css';
import { buildRendererThemeStyle } from './styles/theme';
import { useGameplayMusic } from './audio/gameplayMusic';
import MatchedCardRimFireSandbox from './dev/MatchedCardRimFireSandbox';
import ProceduralIllustrationGallerySandbox from './dev/ProceduralIllustrationGallerySandbox';
import { readDevSandboxConfig } from './dev/devSandboxParams';
import { setTelemetrySink } from '../shared/telemetry';
import { useAppStore } from './store/useAppStore';

/** Landmark id for A11Y-002 skip link (`href` / programmatic focus). */
export const APP_MAIN_LANDMARK_ID = 'app-main';

const focusAppMainLandmark = (): void => {
    document.getElementById(APP_MAIN_LANDMARK_ID)?.focus({ preventScroll: true });
};

const App = () => {
    const { height, width } = useViewportSize();
    const {
        dismissHowToPlay,
        hydrated,
        hydrate,
        newlyUnlockedAchievements,
        openCollection,
        openCodexFromMenu,
        openInventoryFromMenu,
        openModeSelect,
        openSettings,
        run,
        saveData,
        settingsReturnView,
        subscreenReturnView,
        settings,
        steamConnected,
        view
    } = useAppStore(
        useShallow((state) => ({
            dismissHowToPlay: state.dismissHowToPlay,
            hydrated: state.hydrated,
            hydrate: state.hydrate,
            newlyUnlockedAchievements: state.newlyUnlockedAchievements,
            openCollection: state.openCollection,
            openCodexFromMenu: state.openCodexFromMenu,
            openInventoryFromMenu: state.openInventoryFromMenu,
            openModeSelect: state.openModeSelect,
            openSettings: state.openSettings,
            run: state.run,
            saveData: state.saveData,
            settingsReturnView: state.settingsReturnView,
            subscreenReturnView: state.subscreenReturnView,
            settings: state.settings,
            steamConnected: state.steamConnected,
            view: state.view
        }))
    );
    /** Wide short landscape (e.g. 1280×720): use roomy density + outer ui-scale; phones/tablet stays compact. */
    const shortLandscapeDesktop =
        width > VIEWPORT_TABLET_MAX && width > height && height > 0 && height <= VIEWPORT_MOBILE_MAX;
    const isCompactViewport =
        width <= VIEWPORT_MOBILE_MAX || (height <= VIEWPORT_MOBILE_MAX && !shortLandscapeDesktop);
    const safeUiScale = isCompactViewport
        ? 1
        : width <= VIEWPORT_TABLET_MAX
          ? Math.min(settings.uiScale, 1.08)
          : Math.min(settings.uiScale, 1.15);
    const themeStyle = buildRendererThemeStyle(
        safeUiScale,
        isCompactViewport ? 'compact' : 'roomy',
        settings.reduceMotion
    );
    const activeView = hydrated ? view : 'boot';
    const [introPlayback, setIntroPlayback] = useState<Exclude<IntroPlaybackState, 'playing'>>('pending');
    const inGameSettingsOverlay =
        hydrated && view === 'settings' && settingsReturnView === 'playing' && Boolean(run);
    /* SIDE-013/014 — logical `view` is inventory/codex but `data-view` stays `playing` so GameScreen stays mounted under the meta shell; store still owns `view` for Back/closeSubscreen. */
    const inGameShellOverlay =
        hydrated &&
        (view === 'inventory' || view === 'codex') &&
        subscreenReturnView === 'playing' &&
        run !== null;
    const visualView = inGameSettingsOverlay || inGameShellOverlay ? 'playing' : activeView;

    const musicShellActive = hydrated && (visualView === 'menu' || visualView === 'playing');

    useGameplayMusic({
        active: musicShellActive,
        track: visualView === 'playing' ? 'run' : 'menu',
        masterVolume: settings.masterVolume,
        musicVolume: settings.musicVolume
    });

    const ambientGridState =
        hydrated &&
        (visualView === 'menu' ||
            visualView === 'playing' ||
            view === 'modeSelect' ||
            view === 'collection' ||
            (view === 'inventory' && subscreenReturnView === 'menu') ||
            (view === 'codex' && subscreenReturnView === 'menu'))
            ? 'off'
            : 'on';
    const introOverlayVisible =
        introPlayback === 'pending' && (!hydrated || (hydrated && view === 'menu'));
    const showMainMenu = hydrated && view === 'menu';
    const showMenuShell = showMainMenu || (!hydrated && introPlayback === 'pending');
    const menuShellBlurred = showMainMenu && introOverlayVisible;

    const devSandboxAppliedRef = useRef(false);

    useEffect(() => {
        void hydrate();
    }, [hydrate]);

    /** Dev-only: log telemetry to console so `trackEvent` calls are visible without a host sink. */
    useEffect(() => {
        if (!import.meta.env.DEV) {
            return undefined;
        }
        setTelemetrySink((event, payload) => {
            console.debug(`[telemetry] ${event}`, payload);
        });
        return () => {
            setTelemetrySink(null);
        };
    }, []);

    useEffect(() => {
        if (!hydrated || devSandboxAppliedRef.current) {
            return;
        }
        const cfg = readDevSandboxConfig();
        if (!cfg.enabled) {
            return;
        }
        if (cfg.fxSandbox) {
            devSandboxAppliedRef.current = true;
            return;
        }
        devSandboxAppliedRef.current = true;
        void Promise.resolve().then(() => {
            if (cfg.skipIntro) {
                setIntroPlayback('done');
            }
            if (cfg.screen) {
                useAppStore.getState().__devApplySandbox(cfg);
            }
        });
    }, [hydrated]);

    /*
     * OVR-008 / HUD-013 — z-index ladder (single reference; low → high where applicable):
     *
     * App shell (.content / App.module.css):
     *   0–1: menu / game shells (.menuLayer, .content).
     *   9000: StartupIntro root overlay (portaled to document.body — StartupIntro.module.css .overlay; inner UI uses local z-index).
     *   21: OverlayModal backdrop (pause, floor clear, abandon).
     *   22: Meta in-run modal (inventory/codex) — MetaScreen.module.css .modalOverlay (+ META-010 .modalOverlayDesk / .modalInnerDesk).
     *   24: Settings shell modal — SettingsScreen.module.css (in-run modal portaled to `document.body`).
     *
     * In-game column (GameScreen.module.css — SIDE-010 / safe-area QA):
     *   `.gameForeground` 1 — frames the scrollport; children establish sub-stacks.
     *   `gamePlayLayout` row: `.mainGameColumn` 0; `.leftToolbar` 3 (`.mobileCameraLeftToolbar` 8 on phones so the rail
     *       stays above the main column / HUD stack).
     *   Within `.mainGameColumn`: `.hudRow` 2; `.boardStage` 1; board tiles `.boardStage > :global(*)` 1;
     *       `.distractionHud` 4 (above tiles, still under the HUD row because `.boardStage` roots below `.hudRow`).
     *       `.matchScoreFloater` / `.mismatchScoreFloater` 5 — transient +score or “Miss” pop
     *       (`data-testid` `match-score-floater` / `mismatch-score-floater`); above distraction HUD, under in-run
     *       OverlayModal shells (21+).
     */
    if (import.meta.env.DEV) {
        const fx = readDevSandboxConfig().fxSandbox;
        if (fx === 'matchedRimFire') {
            return <MatchedCardRimFireSandbox />;
        }
        if (fx === 'proceduralGallery') {
            return <ProceduralIllustrationGallerySandbox />;
        }
    }

    return (
        <div
            className={styles.app}
            data-ambient-grid={ambientGridState}
            data-reduce-motion={settings.reduceMotion ? 'true' : 'false'}
            data-density={isCompactViewport ? 'compact' : 'roomy'}
            data-view={visualView}
            data-viewport={
                width <= VIEWPORT_MOBILE_MAX ? 'mobile' : width <= VIEWPORT_TABLET_MAX ? 'tablet' : 'desktop'
            }
            style={themeStyle}
        >
            <a
                className={styles.skipLink}
                href={`#${APP_MAIN_LANDMARK_ID}`}
                onClick={(event: MouseEvent<HTMLAnchorElement>): void => {
                    /* Fragment navigation alone does not always move focus in embedded runtimes (e.g. Vitest). */
                    event.preventDefault();
                    focusAppMainLandmark();
                }}
            >
                Skip to main content
            </a>
            <div className={styles.ambientGlow} />
            <main className={styles.content} data-app-scrollport id={APP_MAIN_LANDMARK_ID} tabIndex={-1}>
                {showMenuShell && (
                    <div
                        aria-hidden={introOverlayVisible}
                        className={`${styles.menuLayer} ${menuShellBlurred ? styles.menuLayerIntro : ''}`}
                        data-e2e-menu-pointer={menuShellBlurred ? 'blocked' : 'interactive'}
                        data-testid="main-menu-focus-root"
                        tabIndex={-1}
                    >
                        {showMainMenu ? (
                            <MainMenu
                                bestScore={saveData.bestScore}
                                lastRunSummary={saveData.lastRunSummary}
                                saveData={saveData}
                                reduceMotion={settings.reduceMotion}
                                suppressMenuBackgroundFallback={introOverlayVisible}
                                steamConnected={steamConnected}
                                onDismissHowToPlay={dismissHowToPlay}
                                onOpenSettings={() => openSettings('menu')}
                                onOpenCollection={openCollection}
                                onOpenCodex={openCodexFromMenu}
                                onOpenInventory={openInventoryFromMenu}
                                onPlay={openModeSelect}
                                showHowToPlay={!saveData.onboardingDismissed}
                            />
                        ) : null}
                    </div>
                )}

                {introOverlayVisible &&
                    createPortal(
                        <StartupIntro
                            graphicsQuality={hydrated ? settings.graphicsQuality : undefined}
                            onComplete={() => setIntroPlayback('done')}
                            reduceMotion={settings.reduceMotion}
                        />,
                        document.body
                    )}

                {hydrated && view === 'modeSelect' && <ChooseYourPathScreen />}

                {hydrated && view === 'collection' && <CollectionScreen />}

                {hydrated && view === 'inventory' && subscreenReturnView === 'menu' && <InventoryScreen />}

                {hydrated && view === 'codex' && subscreenReturnView === 'menu' && <CodexScreen />}

                {hydrated && view === 'settings' && !inGameSettingsOverlay && <SettingsScreen />}

                {hydrated && (view === 'playing' || inGameSettingsOverlay || inGameShellOverlay) && run && (
                    <GameScreen
                        achievements={newlyUnlockedAchievements}
                        run={run}
                        suppressStatusOverlays={inGameSettingsOverlay || inGameShellOverlay}
                    />
                )}

                {/* Portal: `main` uses CSS `zoom` for UI scale; fixed overlays inside it become positioned
                    relative to the zoomed box and can inflate `data-app-scrollport` scrollHeight (mobile-layout). */}
                {inGameSettingsOverlay &&
                    createPortal(<SettingsScreen presentation="modal" />, document.body)}

                {inGameShellOverlay ? (
                    <div
                        className={`${metaScreenStyles.modalOverlay} ${metaScreenStyles.modalOverlayDesk}`}
                        data-in-run-meta-shell="desk"
                        style={GAMEPLAY_VISUAL_CSS_VARS}
                    >
                        <div className={`${metaScreenStyles.modalInner} ${metaScreenStyles.modalInnerDesk}`}>
                            {view === 'inventory' ? (
                                <InventoryScreen stackedOnGameplay />
                            ) : (
                                <CodexScreen stackedOnGameplay />
                            )}
                        </div>
                    </div>
                ) : null}

                {hydrated && view === 'gameOver' && run?.lastRunSummary && <GameOverScreen run={run} />}
            </main>
        </div>
    );
};

export default App;

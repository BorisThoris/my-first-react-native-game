import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import ChooseYourPathScreen from './components/ChooseYourPathScreen';
import CodexScreen from './components/CodexScreen';
import CollectionScreen from './components/CollectionScreen';
import GameOverScreen from './components/GameOverScreen';
import GameScreen from './components/GameScreen';
import InventoryScreen from './components/InventoryScreen';
import MainMenu from './components/MainMenu';
import SettingsScreen from './components/SettingsScreen';
import metaScreenStyles from './components/MetaScreen.module.css';
import StartupIntro from './components/StartupIntro';
import type { IntroPlaybackState } from './components/startupIntroConfig';
import { VIEWPORT_MOBILE_MAX, VIEWPORT_TABLET_MAX } from './breakpoints';
import { useViewportSize } from './hooks/useViewportSize';
import styles from './styles/App.module.css';
import { buildRendererThemeStyle } from './styles/theme';
import { useAppStore } from './store/useAppStore';

const App = () => {
    const { height, width } = useViewportSize();
    const {
        dismissHowToPlay,
        hydrated,
        hydrate,
        importRunFromClipboard,
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
        startGauntletRun,
        startMeditationRun,
        startMeditationRunWithMutators,
        startPinVowRun,
        startPracticeRun,
        startPuzzleRun,
        startScholarContractRun,
        startWildRun,
        view
    } = useAppStore(
        useShallow((state) => ({
            dismissHowToPlay: state.dismissHowToPlay,
            hydrated: state.hydrated,
            hydrate: state.hydrate,
            importRunFromClipboard: state.importRunFromClipboard,
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
            startGauntletRun: state.startGauntletRun,
            startMeditationRun: state.startMeditationRun,
            startMeditationRunWithMutators: state.startMeditationRunWithMutators,
            startPinVowRun: state.startPinVowRun,
            startPracticeRun: state.startPracticeRun,
            startPuzzleRun: state.startPuzzleRun,
            startScholarContractRun: state.startScholarContractRun,
            startWildRun: state.startWildRun,
            view: state.view
        }))
    );
    const isCompactViewport = width <= VIEWPORT_MOBILE_MAX || height <= VIEWPORT_MOBILE_MAX;
    const safeUiScale = isCompactViewport
        ? 1
        : width <= VIEWPORT_TABLET_MAX
          ? Math.min(settings.uiScale, 1.08)
          : Math.min(settings.uiScale, 1.15);
    const themeStyle = buildRendererThemeStyle(safeUiScale);
    const activeView = hydrated ? view : 'boot';
    const [introPlayback, setIntroPlayback] = useState<Exclude<IntroPlaybackState, 'playing'>>('pending');
    const inGameSettingsOverlay =
        hydrated && view === 'settings' && settingsReturnView === 'playing' && Boolean(run);
    const inGameShellOverlay =
        hydrated &&
        (view === 'inventory' || view === 'codex') &&
        subscreenReturnView === 'playing' &&
        run !== null;
    const visualView = inGameSettingsOverlay || inGameShellOverlay ? 'playing' : activeView;
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

    useEffect(() => {
        void hydrate();
    }, [hydrate]);

    /*
     * OVR-008 — overlay z-index ladder (low → high within .content):
     * 0–1: menu / game shells (App.module.css .menuLayer, .content).
     * 6–8: StartupIntro layers (StartupIntro.module.css).
     * 21: OverlayModal backdrop (pause, floor clear, abandon).
     * 22: Meta in-run modal (inventory/codex over play) — MetaScreen.module.css .modalOverlay.
     * 24: Settings shell modal — SettingsScreen.module.css.
     * Game HUD/toolbar can sit at 3–8 under mobile camera (GameScreen.module.css).
     */
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
            <div className={styles.ambientGlow} />
            <div className={styles.content}>
                {showMenuShell && (
                    <div
                        aria-hidden={introOverlayVisible}
                        className={`${styles.menuLayer} ${menuShellBlurred ? styles.menuLayerIntro : ''}`}
                        data-e2e-menu-pointer={menuShellBlurred ? 'blocked' : 'interactive'}
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
                                onGauntletRun={startGauntletRun}
                                onPuzzleStarter={() => startPuzzleRun('starter_pairs')}
                                onMirrorPuzzleRun={() => startPuzzleRun('mirror_craft')}
                                onPracticeRun={startPracticeRun}
                                onScholarContractRun={startScholarContractRun}
                                onMeditationRun={startMeditationRun}
                                onMeditationRunWithMutators={startMeditationRunWithMutators}
                                onPinVowRun={startPinVowRun}
                                onWildRun={startWildRun}
                                onImportRun={() => {
                                    const raw = window.prompt(
                                        'Paste a Memory Dungeon run JSON (from Copy run seed on game over).'
                                    );
                                    if (raw === null) {
                                        return;
                                    }
                                    const trimmed = raw.trim();
                                    if (!trimmed) {
                                        return;
                                    }
                                    const ok = importRunFromClipboard(trimmed);
                                    if (!ok) {
                                        window.alert('Could not import that payload. Check the JSON and try again.');
                                    }
                                }}
                                showHowToPlay={!saveData.onboardingDismissed}
                            />
                        ) : null}
                    </div>
                )}

                {introOverlayVisible && (
                    <StartupIntro
                        onComplete={() => setIntroPlayback('done')}
                        reduceMotion={settings.reduceMotion}
                    />
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

                {inGameSettingsOverlay && <SettingsScreen presentation="modal" />}

                {inGameShellOverlay ? (
                    <div className={metaScreenStyles.modalOverlay}>
                        <div className={metaScreenStyles.modalInner}>
                            {view === 'inventory' ? <InventoryScreen /> : <CodexScreen />}
                        </div>
                    </div>
                ) : null}

                {hydrated && view === 'gameOver' && run?.lastRunSummary && <GameOverScreen run={run} />}
            </div>
        </div>
    );
};

export default App;

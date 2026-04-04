import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import GameOverScreen from './components/GameOverScreen';
import GameScreen from './components/GameScreen';
import MainMenu from './components/MainMenu';
import SettingsScreen from './components/SettingsScreen';
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
        openSettings,
        run,
        saveData,
        settingsReturnView,
        settings,
        startDailyRun,
        startGauntletRun,
        startMeditationRun,
        startPracticeRun,
        startPuzzleRun,
        startRun,
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
            openSettings: state.openSettings,
            run: state.run,
            saveData: state.saveData,
            settingsReturnView: state.settingsReturnView,
            settings: state.settings,
            startDailyRun: state.startDailyRun,
            startGauntletRun: state.startGauntletRun,
            startMeditationRun: state.startMeditationRun,
            startPracticeRun: state.startPracticeRun,
            startPuzzleRun: state.startPuzzleRun,
            startRun: state.startRun,
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
    const visualView = inGameSettingsOverlay ? 'playing' : activeView;
    const ambientGridState = hydrated && (visualView === 'menu' || visualView === 'playing') ? 'off' : 'on';
    const introOverlayVisible =
        introPlayback === 'pending' && (!hydrated || (hydrated && view === 'menu'));
    const showMainMenu = hydrated && view === 'menu';
    const showMenuShell = showMainMenu || (!hydrated && introPlayback === 'pending');
    const menuShellBlurred = showMainMenu && introOverlayVisible;

    useEffect(() => {
        void hydrate();
    }, [hydrate]);

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
                    >
                        {showMainMenu ? (
                            <MainMenu
                                bestScore={saveData.bestScore}
                                lastRunSummary={saveData.lastRunSummary}
                                saveData={saveData}
                                reduceMotion={settings.reduceMotion}
                                suppressMenuBackgroundFallback={introOverlayVisible}
                                onDismissHowToPlay={dismissHowToPlay}
                                onOpenSettings={() => openSettings('menu')}
                                onPlay={startRun}
                                onDailyRun={startDailyRun}
                                onGauntletRun={startGauntletRun}
                                onPuzzleStarter={() => startPuzzleRun('starter_pairs')}
                                onMirrorPuzzleRun={() => startPuzzleRun('mirror_craft')}
                                onPracticeRun={startPracticeRun}
                                onScholarContractRun={startScholarContractRun}
                                onMeditationRun={startMeditationRun}
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

                {hydrated && view === 'settings' && !inGameSettingsOverlay && <SettingsScreen />}

                {hydrated && (view === 'playing' || inGameSettingsOverlay) && run && (
                    <GameScreen
                        achievements={newlyUnlockedAchievements}
                        run={run}
                        suppressStatusOverlays={inGameSettingsOverlay}
                    />
                )}

                {inGameSettingsOverlay && <SettingsScreen presentation="modal" />}

                {hydrated && view === 'gameOver' && run?.lastRunSummary && <GameOverScreen run={run} />}
            </div>
        </div>
    );
};

export default App;

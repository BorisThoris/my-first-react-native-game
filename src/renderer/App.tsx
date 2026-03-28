import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import GameOverScreen from './components/GameOverScreen';
import GameScreen from './components/GameScreen';
import MainMenu from './components/MainMenu';
import SettingsScreen from './components/SettingsScreen';
import { useViewportSize } from './hooks/useViewportSize';
import styles from './styles/App.module.css';
import { useAppStore } from './store/useAppStore';

const App = () => {
    const { height, width } = useViewportSize();
    const {
        dismissHowToPlay,
        hydrated,
        hydrate,
        newlyUnlockedAchievements,
        openSettings,
        resume,
        run,
        saveData,
        settings,
        startRun,
        steamConnected,
        view
    } = useAppStore(
        useShallow((state) => ({
            dismissHowToPlay: state.dismissHowToPlay,
            hydrated: state.hydrated,
            hydrate: state.hydrate,
            newlyUnlockedAchievements: state.newlyUnlockedAchievements,
            openSettings: state.openSettings,
            resume: state.resume,
            run: state.run,
            saveData: state.saveData,
            settings: state.settings,
            startRun: state.startRun,
            steamConnected: state.steamConnected,
            view: state.view
        }))
    );
    const isCompactViewport = width <= 760 || height <= 760;
    const safeUiScale = isCompactViewport
        ? 1
        : width <= 1220
          ? Math.min(settings.uiScale, 1.08)
          : Math.min(settings.uiScale, 1.15);

    useEffect(() => {
        void hydrate();
    }, [hydrate]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || view !== 'playing' || !run) {
                return;
            }

            if (run.status === 'paused') {
                resume();
            } else if (run.status !== 'levelComplete' && run.status !== 'gameOver') {
                useAppStore.getState().pause();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [resume, run, view]);

    return (
        <div
            className={styles.app}
            data-reduce-motion={settings.reduceMotion ? 'true' : 'false'}
            data-density={isCompactViewport ? 'compact' : 'roomy'}
            data-viewport={width <= 760 ? 'mobile' : width <= 1220 ? 'tablet' : 'desktop'}
            style={{ ['--ui-scale' as string]: safeUiScale }}
        >
            <div className={styles.ambientGlow} />
            <div className={styles.content}>
                {!hydrated && <div className={styles.boot}>Preparing dungeon memory core...</div>}

                {hydrated && view === 'menu' && (
                    <MainMenu
                        bestScore={saveData.bestScore}
                        lastRunSummary={saveData.lastRunSummary}
                        onDismissHowToPlay={dismissHowToPlay}
                        onOpenSettings={() => openSettings('menu')}
                        onPlay={startRun}
                        showHowToPlay={!saveData.onboardingDismissed}
                        steamConnected={steamConnected}
                    />
                )}

                {hydrated && view === 'settings' && <SettingsScreen />}

                {hydrated && view === 'playing' && run && (
                    <GameScreen
                        achievements={newlyUnlockedAchievements}
                        run={run}
                        saveData={saveData}
                        steamConnected={steamConnected}
                    />
                )}

                {hydrated && view === 'gameOver' && run?.lastRunSummary && <GameOverScreen run={run} />}
            </div>
        </div>
    );
};

export default App;

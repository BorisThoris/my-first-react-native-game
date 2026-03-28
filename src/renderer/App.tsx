import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import GameOverScreen from './components/GameOverScreen';
import GameScreen from './components/GameScreen';
import MainMenu from './components/MainMenu';
import SettingsScreen from './components/SettingsScreen';
import styles from './styles/App.module.css';
import { useAppStore } from './store/useAppStore';

const App = () => {
    const { hydrated, hydrate, newlyUnlockedAchievements, openSettings, resume, run, saveData, settings, startRun, steamConnected, view } =
        useAppStore(
            useShallow((state) => ({
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

    useEffect(() => {
        void hydrate();
    }, [hydrate]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || view !== 'playing' || !run) {
                return;
            }

            if (run.status === 'playing') {
                useAppStore.getState().pause();
            } else if (run.status === 'paused') {
                resume();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [resume, run, view]);

    return (
        <div className={styles.app} style={{ ['--ui-scale' as string]: settings.uiScale }}>
            <div className={styles.ambientGlow} />
            <div className={styles.content}>
                {!hydrated && <div className={styles.boot}>Preparing dungeon memory core...</div>}

                {hydrated && view === 'menu' && (
                    <MainMenu
                        bestScore={saveData.bestScore}
                        lastRunSummary={saveData.lastRunSummary}
                        onOpenSettings={() => openSettings('menu')}
                        onPlay={startRun}
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

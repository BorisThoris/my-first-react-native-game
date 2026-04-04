import { ACHIEVEMENTS } from '../../shared/achievements';
import type { AchievementId, RunState } from '../../shared/contracts';
import { canShuffleBoard } from '../../shared/game';
import { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { VIEWPORT_MOBILE_MAX, VIEWPORT_TIGHT_MAX_H, VIEWPORT_TIGHT_MAX_W } from '../breakpoints';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import { StatTile, UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import MainMenuBackground from './MainMenuBackground';
import OverlayModal from './OverlayModal';
import TileBoard, { type TileBoardHandle } from './TileBoard';
import styles from './GameScreen.module.css';

interface GameScreenProps {
    achievements: AchievementId[];
    run: RunState;
    suppressStatusOverlays?: boolean;
}

const FORGIVENESS_HINT =
    'First miss each floor is free. Wrong pairs halve your streak (not zero). Lose a life → extra memorize next floor. Every 2-pair chain earns a shard; 3 shards heal 1 life.';

const BOARD_POWER_HINT =
    'Powers: Shuffle once per run (needs 2+ hidden pairs). Pin up to 3 hidden tiles. Destroy removes a pair for no score — earn charges on clean floors (≤1 miss), then tap Destroy and a tile.';

const getClearLifeBonusLabel = (result: NonNullable<RunState['lastLevelResult']>): string | null => {
    if (result.clearLifeGained !== 1) {
        return null;
    }

    if (result.clearLifeReason === 'perfect') {
        return 'Perfect floor bonus: +1 Life';
    }

    if (result.clearLifeReason === 'clean') {
        return 'Clean floor bonus: +1 Life';
    }

    return null;
};

const PauseIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M8 5.5v13" />
        <path d="M16 5.5v13" />
    </svg>
);

const PlayIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M9 7.25 17 12l-8 4.75V7.25Z" fill="currentColor" stroke="none" />
    </svg>
);

const SettingsIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3.25" />
        <circle cx="12" cy="12" r="6.4" />
        <path d="M12 2.75v2.2" />
        <path d="M12 19.05v2.2" />
        <path d="m4.93 4.93 1.56 1.56" />
        <path d="m17.51 17.51 1.56 1.56" />
        <path d="M2.75 12h2.2" />
        <path d="M19.05 12h2.2" />
        <path d="m4.93 19.07 1.56-1.56" />
        <path d="m17.51 6.49 1.56-1.56" />
    </svg>
);

const FitBoardIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M5 9V5h4" />
        <path d="M15 5h4v4" />
        <path d="M19 15v4h-4" />
        <path d="M9 19H5v-4" />
    </svg>
);

const ShuffleIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M4 8h4l2-3h6" />
        <path d="M4 16h4l2 3h6" />
        <path d="M17 5l3 3-3 3" />
        <path d="M17 19l3-3-3-3" />
    </svg>
);

const PinIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M12 3v8" />
        <path d="M8 11h8l-2 10H10L8 11Z" />
    </svg>
);

const DestroyIcon = () => (
    <svg aria-hidden="true" className={styles.actionIcon} viewBox="0 0 24 24">
        <path d="M6 6l12 12" />
        <path d="M18 6L6 18" />
        <rect height="14" rx="1.5" width="10" x="7" y="5" />
    </svg>
);

const GameScreen = ({ achievements, run, suppressStatusOverlays = false }: GameScreenProps) => {
    const shellRef = useRef<HTMLElement | null>(null);
    const tileBoardRef = useRef<TileBoardHandle>(null);
    const { height, width } = useViewportSize();
    const [viewportResetToken, setViewportResetToken] = useState(0);
    const {
        boardPinMode,
        continueToNextLevel,
        destroyPairArmed,
        goToMenu,
        openSettings,
        pause,
        pressTile,
        resume,
        settings,
        shuffleBoard,
        toggleBoardPinMode,
        toggleDestroyPairArmed,
        triggerDebugReveal
    } = useAppStore(
        useShallow((state) => ({
            boardPinMode: state.boardPinMode,
            continueToNextLevel: state.continueToNextLevel,
            destroyPairArmed: state.destroyPairArmed,
            goToMenu: state.goToMenu,
            openSettings: state.openSettings,
            pause: state.pause,
            pressTile: state.pressTile,
            resume: state.resume,
            settings: state.settings,
            shuffleBoard: state.shuffleBoard,
            toggleBoardPinMode: state.toggleBoardPinMode,
            toggleDestroyPairArmed: state.toggleDestroyPairArmed,
            triggerDebugReveal: state.triggerDebugReveal
        }))
    );
    const { tiltRef: gameFieldTiltRef } = usePlatformTiltField({
        enabled: true,
        reduceMotion: settings.reduceMotion,
        surfaceRef: shellRef,
        strength: 1
    });
    const isCompact = width <= VIEWPORT_MOBILE_MAX || height <= VIEWPORT_MOBILE_MAX;
    const isTight = width <= VIEWPORT_TIGHT_MAX_W || height <= VIEWPORT_TIGHT_MAX_H;
    const cameraViewportMode = true;
    const pauseActionLabel = run.status === 'paused' ? 'Resume' : 'Pause';
    const clearLifeBonusLabel = run.lastLevelResult ? getClearLifeBonusLabel(run.lastLevelResult) : null;

    if (!run.board) {
        return null;
    }

    const unlockedDefinitions = achievements
        .map((achievementId) => ACHIEVEMENTS.find((item) => item.id === achievementId))
        .filter((achievement): achievement is (typeof ACHIEVEMENTS)[number] => Boolean(achievement));
    const cols = run.board.columns;
    const rows = run.board.rows;
    /** Space above the board: single-row HUD + shell / foreground padding (compact rules in GameScreen.module.css). */
    const chromeReserveY = isTight ? 92 : 84;
    /** Horizontal insets: shell + gameForeground padding (see compact rules in GameScreen.module.css). */
    const chromeReserveX = isTight ? 20 : 32;
    const boardHorizontalBudget = Math.max(160, width - chromeReserveX);
    const boardVerticalBudget = Math.max(200, height - chromeReserveY);
    const minTile = isCompact ? 48 : 56;
    const tileFit = Math.floor(Math.min(boardHorizontalBudget / cols, boardVerticalBudget / rows));
    /** No artificial max on small viewports — tiles scale up to fill the playable area. */
    const tileSize = Math.max(minTile, tileFit);
    const boardStyle = {
        ['--board-width' as string]: `${tileSize * cols}px`,
        ['--board-height' as string]: `${tileSize * rows}px`
    };
    const showForgivenessHint =
        run.board.level <= 3 &&
        (run.status === 'memorize' || run.status === 'playing') &&
        run.board.matchedPairs === 0 &&
        run.stats.tries === 0;
    const showBoardPowerBar = run.status === 'playing';
    const shuffleDisabled = !canShuffleBoard(run);
    const shuffleTitle = shuffleDisabled
        ? run.shuffleCharges < 1
            ? 'No shuffle charges'
            : run.board.flippedTileIds.length > 0
              ? 'Finish the current flip first'
              : 'Need at least two hidden pairs to shuffle'
        : 'Shuffle hidden tiles (1 charge this run)';
    const destroyDisabled = run.destroyPairCharges < 1 && !destroyPairArmed;
    return (
        <section
            className={`${styles.shell} ${cameraViewportMode ? styles.mobileCameraShell : ''}`}
            data-mobile-camera-mode={cameraViewportMode ? 'true' : 'false'}
            data-testid="game-shell"
            ref={shellRef}
        >
            <MainMenuBackground
                fieldTiltRef={gameFieldTiltRef}
                height={height}
                reduceMotion={settings.reduceMotion}
                width={width}
            />
            <div className={`${styles.gameForeground} ${cameraViewportMode ? styles.mobileCameraForeground : ''}`}>
                <h1 className={styles.srOnly}>Level {run.board.level}</h1>
                <header
                    className={`${styles.hudRow} ${cameraViewportMode ? styles.mobileCameraHud : ''}`}
                    data-testid="game-hud"
                >
                    <div className={`${styles.floatingDeck} ${styles.statsDeck}`}>
                        <div className={styles.deckCluster}>
                            <div className={styles.floorBadge} title="Current floor">
                                <span className={styles.floorLabel}>Floor</span>
                                <span className={styles.floorValue}>{run.board.level}</span>
                            </div>
                            <div className={styles.statRail} role="group" aria-label="Run stats">
                                <div className={styles.statPill}>
                                    <span className={styles.statKey}>Lives</span>
                                    <span className={styles.statVal}>{run.lives}</span>
                                </div>
                                <div className={styles.statPill}>
                                    <span className={styles.statKey}>Guards</span>
                                    <span className={styles.statVal}>{run.stats.guardTokens}</span>
                                </div>
                                <div className={styles.statPill}>
                                    <span className={styles.statKey}>Shards</span>
                                    <span className={styles.statVal}>{run.stats.comboShards}</span>
                                </div>
                                <div className={styles.statPill}>
                                    <span className={styles.statKey}>Score</span>
                                    <span className={styles.statVal}>{run.stats.totalScore.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.actionControls} role="group" aria-label="Game controls">
                        {cameraViewportMode ? (
                            <button
                                aria-label="Fit board"
                                className={styles.iconAction}
                                onClick={() => {
                                    setViewportResetToken((current) => current + 1);
                                }}
                                title="Fit board"
                                type="button"
                            >
                                <FitBoardIcon />
                            </button>
                        ) : null}
                        <button
                            aria-label={pauseActionLabel}
                            className={styles.iconAction}
                            onClick={run.status === 'paused' ? resume : pause}
                            title={pauseActionLabel}
                            type="button"
                        >
                            {run.status === 'paused' ? <PlayIcon /> : <PauseIcon />}
                        </button>
                        <button
                            aria-label="Settings"
                            className={styles.iconAction}
                            onClick={() => openSettings('playing')}
                            title="Settings"
                            type="button"
                        >
                            <SettingsIcon />
                        </button>
                        {import.meta.env.DEV && settings.debugFlags.showDebugTools && settings.debugFlags.allowBoardReveal && (
                            <UiButton size="sm" variant="debug" onClick={triggerDebugReveal}>
                                Reveal
                            </UiButton>
                        )}
                    </div>
                </header>
                {showBoardPowerBar ? (
                    <div className={styles.powerBar} role="group" aria-label="Board powers">
                        <button
                            aria-label={`Shuffle hidden tiles. Charges: ${run.shuffleCharges}`}
                            aria-pressed={false}
                            className={`${styles.iconAction} ${styles.iconActionWithBadge}`}
                            disabled={shuffleDisabled}
                            onClick={() => {
                                if (shuffleDisabled) {
                                    return;
                                }
                                const handle = tileBoardRef.current;
                                if (handle) {
                                    handle.runShuffleAnimation(() => shuffleBoard());
                                } else {
                                    shuffleBoard();
                                }
                            }}
                            title={shuffleTitle}
                            type="button"
                        >
                            <ShuffleIcon />
                            <span className={styles.powerBadge}>{run.shuffleCharges}</span>
                        </button>
                        <button
                            aria-label={boardPinMode ? 'Exit pin mode' : 'Pin mode — tap tiles to mark'}
                            aria-pressed={boardPinMode}
                            className={`${styles.iconAction} ${boardPinMode ? styles.iconActionActive : ''}`}
                            onClick={() => toggleBoardPinMode()}
                            title="Pin up to 3 hidden tiles for planning"
                            type="button"
                        >
                            <PinIcon />
                        </button>
                        <button
                            aria-label={`Destroy a hidden pair. Charges: ${run.destroyPairCharges}. ${destroyPairArmed ? 'Tap a tile' : 'Arm then tap a tile'}`}
                            aria-pressed={destroyPairArmed}
                            className={`${styles.iconAction} ${styles.iconActionWithBadge} ${destroyPairArmed ? styles.iconActionActive : ''}`}
                            disabled={destroyDisabled}
                            onClick={() => toggleDestroyPairArmed()}
                            title={
                                run.destroyPairCharges < 1
                                    ? 'Earn destroy charges on clean floors (≤1 miss)'
                                    : destroyPairArmed
                                      ? 'Tap a hidden tile to destroy its pair (no score)'
                                      : 'Arm destroy, then tap a hidden tile'
                            }
                            type="button"
                        >
                            <DestroyIcon />
                            <span className={styles.powerBadge}>{run.destroyPairCharges}</span>
                        </button>
                    </div>
                ) : null}
                {showForgivenessHint ? (
                    <div className={styles.ruleHintStack}>
                        <p className={styles.ruleHint} data-testid="forgiveness-hint" role="note">
                            {FORGIVENESS_HINT}
                        </p>
                        <p className={styles.ruleHint} data-testid="board-power-hint" role="note">
                            {BOARD_POWER_HINT}
                        </p>
                    </div>
                ) : null}

                <div className={`${styles.boardStage} ${cameraViewportMode ? styles.boardStageCamera : ''}`}>
                    <div className={styles.boardGlow} aria-hidden="true" />
                    <TileBoard
                        ref={tileBoardRef}
                        board={run.board}
                        debugPeekActive={run.debugPeekActive}
                        interactive={run.status === 'playing'}
                        frameStyle={cameraViewportMode ? undefined : boardStyle}
                        mobileCameraMode={cameraViewportMode}
                        pinnedTileIds={run.pinnedTileIds}
                        onTileSelect={(tileId) => {
                            if (run.status === 'playing') {
                                pressTile(tileId);
                            }
                        }}
                        previewActive={run.status === 'memorize'}
                        reduceMotion={settings.reduceMotion}
                        viewportResetToken={viewportResetToken}
                    />
                    {unlockedDefinitions.length > 0 ? (
                        <div className={`${styles.toastRail} ${cameraViewportMode ? styles.mobileCameraToastRail : ''}`} role="status">
                            {unlockedDefinitions.map((a) => (
                                <div className={styles.toast} key={a.id}>
                                    <span className={styles.toastTitle}>{a.title}</span>
                                    <span className={styles.toastDesc}>{a.description}</span>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>

                {!suppressStatusOverlays && run.status === 'paused' && (
                    <OverlayModal
                        actions={[
                            { label: 'Resume', onClick: resume, variant: 'primary' },
                            { label: 'Retreat', onClick: goToMenu, variant: 'danger' }
                        ]}
                        subtitle="The board, memorize phase, and debug timers are frozen until you return."
                        title="Run Paused"
                    />
                )}

                {!suppressStatusOverlays && run.status === 'levelComplete' && run.lastLevelResult && (
                    <OverlayModal
                        actions={[
                            { label: 'Continue', onClick: continueToNextLevel, variant: 'primary' },
                            { label: 'Main Menu', onClick: goToMenu, variant: 'secondary' }
                        ]}
                        subtitle={`Level ${run.lastLevelResult.level} cleared. Score +${run.lastLevelResult.scoreGained}.`}
                        title="Floor Cleared"
                    >
                        {clearLifeBonusLabel ? <p className={styles.modalNote}>{clearLifeBonusLabel}</p> : null}
                        <div className={styles.modalStats}>
                            <StatTile
                                density="minimal"
                                label="Rating"
                                value={run.lastLevelResult.rating}
                                valueFirst
                            />
                            <StatTile
                                density="minimal"
                                label="Mistakes"
                                value={run.lastLevelResult.mistakes}
                                valueFirst
                            />
                            <StatTile
                                density="minimal"
                                label="Lives"
                                value={run.lastLevelResult.livesRemaining}
                                valueFirst
                            />
                            <StatTile
                                density="minimal"
                                label="Total"
                                value={run.stats.totalScore.toLocaleString()}
                                valueFirst
                            />
                        </div>
                    </OverlayModal>
                )}
            </div>
        </section>
    );
};

export default GameScreen;

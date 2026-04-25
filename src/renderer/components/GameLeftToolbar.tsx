import type { RunState, Settings } from '../../shared/contracts';
import { getPowerVerbTeachingRows } from '../../shared/power-verbs';
import {
    memo,
    useEffect,
    useLayoutEffect,
    useRef,
    type Dispatch,
    type RefObject,
    type SetStateAction
} from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
    handleVerticalToolbarKeyDown,
    syncVerticalToolbarTabIndices
} from '../a11y/toolbarRoving';
import { GAMEPLAY_TOOLBAR_ICONS } from '../assets/ui/icons';
import { UiButton } from '../ui';
import {
    playMenuOpenSfx,
    playUiClickSfx,
    resumeUiSfxContext,
    uiSfxGainFromSettings
} from '../audio/uiSfx';
import { useAppStore } from '../store/useAppStore';
import type { TileBoardHandle } from './TileBoard';
import styles from './GameScreen.module.css';

interface GameLeftToolbarProps {
    cameraViewportMode: boolean;
    run: RunState;
    debugFlags: Settings['debugFlags'];
    showForgivenessHint: boolean;
    rulesHintsExpanded: boolean;
    setRulesHintsExpanded: Dispatch<SetStateAction<boolean>>;
    showBoardPowerBar: boolean;
    shuffleDisabled: boolean;
    shuffleTitle: string;
    regionShuffleDisabled: boolean;
    regionShuffleTitle: string;
    canRegionShuffleRow: (rowIndex: number) => boolean;
    shuffleRegionRow: (rowIndex: number) => void;
    showFlashPairPower: boolean;
    flashPairDisabled: boolean;
    flashPairTitle: string;
    applyFlashPairPower: () => void;
    maxPinnedTiles: number;
    destroyDisabled: boolean;
    tileBoardRef: RefObject<TileBoardHandle | null>;
    onViewportReset: () => void;
    onRequestAbandonRun: () => void;
    openSettingsPlaying: () => void;
    openInventoryFromPlaying: () => void;
    openCodexFromPlaying: () => void;
    shuffleBoard: () => void;
    toggleBoardPinMode: () => void;
    boardPinMode: boolean;
    toggleDestroyPairArmed: () => void;
    destroyPairArmed: boolean;
    togglePeekMode: () => void;
    peekModeArmed: boolean;
    toggleStrayArm: () => void;
    undoResolvingFlip: () => void;
    triggerDebugReveal: () => void;
}

const iconLabel = (label: string) => (
    <span aria-hidden="true" className={styles.toolbarFlyoutLabel}>
        {label}
    </span>
);

const GameLeftToolbar = memo(function GameLeftToolbar({
    cameraViewportMode,
    run,
    debugFlags,
    showForgivenessHint,
    rulesHintsExpanded,
    setRulesHintsExpanded,
    showBoardPowerBar,
    shuffleDisabled,
    shuffleTitle,
    regionShuffleDisabled,
    regionShuffleTitle,
    canRegionShuffleRow,
    shuffleRegionRow,
    showFlashPairPower,
    flashPairDisabled,
    flashPairTitle,
    applyFlashPairPower,
    maxPinnedTiles,
    destroyDisabled,
    tileBoardRef,
    onViewportReset,
    onRequestAbandonRun,
    openSettingsPlaying,
    openInventoryFromPlaying,
    openCodexFromPlaying,
    toggleBoardPinMode,
    boardPinMode,
    toggleDestroyPairArmed,
    destroyPairArmed,
    togglePeekMode,
    peekModeArmed,
    toggleStrayArm,
    undoResolvingFlip,
    triggerDebugReveal,
    shuffleBoard
}: GameLeftToolbarProps) {
    const { masterVolume, sfxVolume } = useAppStore(
        useShallow((state) => ({
            masterVolume: state.settings.masterVolume,
            sfxVolume: state.settings.sfxVolume
        }))
    );
    const asideRef = useRef<HTMLElement | null>(null);
    const controlsToolbarRef = useRef<HTMLDivElement | null>(null);
    const powersToolbarRef = useRef<HTMLDivElement | null>(null);
    const resolveToolbarRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        syncVerticalToolbarTabIndices(controlsToolbarRef.current);
    }, [
        cameraViewportMode,
        run.status,
        debugFlags.allowBoardReveal,
        debugFlags.showDebugTools
    ]);

    useLayoutEffect(() => {
        syncVerticalToolbarTabIndices(powersToolbarRef.current);
    }, [
        boardPinMode,
        destroyDisabled,
        destroyPairArmed,
        flashPairDisabled,
        peekModeArmed,
        regionShuffleDisabled,
        run.board?.rows,
        run.destroyPairCharges,
        run.flashPairCharges,
        run.peekCharges,
        run.regionShuffleCharges,
        run.shuffleCharges,
        run.strayRemoveArmed,
        run.strayRemoveCharges,
        shuffleDisabled,
        showBoardPowerBar,
        showFlashPairPower
    ]);

    useLayoutEffect(() => {
        syncVerticalToolbarTabIndices(resolveToolbarRef.current);
    }, [run.status, run.undoUsesThisFloor]);

    useEffect(() => {
        const aside = asideRef.current;
        if (!aside) {
            return;
        }
        const onFocusIn = (event: FocusEvent): void => {
            const target = event.target;
            if (!(target instanceof HTMLButtonElement)) {
                return;
            }
            const toolbar = target.closest('[role="toolbar"]');
            if (!(toolbar instanceof HTMLElement) || !aside.contains(toolbar)) {
                return;
            }
            syncVerticalToolbarTabIndices(toolbar, target);
        };
        aside.addEventListener('focusin', onFocusIn);
        return () => aside.removeEventListener('focusin', onFocusIn);
    }, []);

    const pinVowCap = run.activeContract?.maxPinsTotalRun;
    const pinTitle =
        pinVowCap != null
            ? `Pin hidden tiles (max ${maxPinnedTiles} on board). Pin vow: ${run.pinsPlacedCountThisRun} of ${pinVowCap} placements used.`
            : `Pin up to ${maxPinnedTiles} hidden tiles for planning`;
    const uiGain = uiSfxGainFromSettings(masterVolume, sfxVolume);
    const playUiClick = (): void => {
        resumeUiSfxContext();
        playUiClickSfx(uiGain);
    };
    const playMenuOpen = (): void => {
        resumeUiSfxContext();
        playMenuOpenSfx(uiGain);
    };
    const powerTeachingRows = getPowerVerbTeachingRows(run);

    return (
        <aside
            aria-label="Game actions"
            className={`${styles.leftToolbar} ${cameraViewportMode ? styles.mobileCameraLeftToolbar : ''}`.trim()}
            data-rail-density={cameraViewportMode ? 'compact' : 'desktop'}
            data-rail-model="icon-rail-with-flyout-labels"
            data-testid="game-left-rail"
            ref={asideRef}
        >
            <div
                aria-label="Game controls"
                aria-orientation="vertical"
                className={styles.toolbarSection}
                onKeyDown={handleVerticalToolbarKeyDown}
                ref={controlsToolbarRef}
                role="toolbar"
            >
                <button
                    aria-label="Fit board"
                    className={styles.iconAction}
                    data-testid="game-toolbar-fit"
                    onClick={() => {
                        playUiClick();
                        onViewportReset();
                    }}
                    title="Fit board"
                    type="button"
                >
                    <img alt="" className={styles.toolbarGlyphImg} src={GAMEPLAY_TOOLBAR_ICONS.fitBoard} />
                    <span aria-hidden="true" className={styles.toolbarFlyoutLabel}>Fit board</span>
                </button>
                <button
                    aria-label="Run settings (toolbar)"
                    className={styles.iconAction}
                    data-testid="game-toolbar-settings"
                    onClick={() => {
                        playMenuOpen();
                        openSettingsPlaying();
                    }}
                    title="Settings"
                    type="button"
                >
                    <img alt="" className={styles.toolbarGlyphImg} src={GAMEPLAY_TOOLBAR_ICONS.settings} />
                    <span aria-hidden="true" className={styles.toolbarFlyoutLabel}>Settings</span>
                </button>
                <button
                    aria-label="Open codex"
                    className={styles.iconAction}
                    data-testid="game-toolbar-codex"
                    onClick={() => {
                        playMenuOpen();
                        openCodexFromPlaying();
                    }}
                    title="Codex"
                    type="button"
                >
                    <img alt="" className={styles.toolbarGlyphImg} src={GAMEPLAY_TOOLBAR_ICONS.codexBook} />
                    <span aria-hidden="true" className={styles.toolbarFlyoutLabel}>Codex</span>
                </button>
                <button
                    aria-label="Open inventory"
                    className={styles.iconAction}
                    data-testid="game-toolbar-inventory"
                    onClick={() => {
                        playMenuOpen();
                        openInventoryFromPlaying();
                    }}
                    title="Inventory"
                    type="button"
                >
                    <img alt="" className={styles.toolbarGlyphImg} src={GAMEPLAY_TOOLBAR_ICONS.inventoryBag} />
                    <span aria-hidden="true" className={styles.toolbarFlyoutLabel}>Inventory</span>
                </button>
                <button
                    aria-label="Return to main menu"
                    className={styles.iconAction}
                    data-testid="game-toolbar-main-menu"
                    onClick={() => {
                        playMenuOpen();
                        onRequestAbandonRun();
                    }}
                    title="Main menu"
                    type="button"
                >
                    <img alt="" className={styles.toolbarGlyphImg} src={GAMEPLAY_TOOLBAR_ICONS.mainMenu} />
                    <span aria-hidden="true" className={styles.toolbarFlyoutLabel}>Main menu</span>
                </button>
                {import.meta.env.DEV && debugFlags.showDebugTools && debugFlags.allowBoardReveal ? (
                    <UiButton className={styles.toolbarDebugBtn} size="sm" variant="debug" onClick={triggerDebugReveal}>
                        Reveal
                    </UiButton>
                ) : null}
            </div>
            {showForgivenessHint ? (
                <div className={styles.toolbarSection}>
                    <button
                        aria-expanded={rulesHintsExpanded}
                        aria-label={rulesHintsExpanded ? 'Hide rule tips' : 'Show rule tips'}
                        className={styles.rulesToggle}
                        onClick={() => {
                            playUiClick();
                            setRulesHintsExpanded((v) => !v);
                        }}
                        type="button"
                    >
                        {rulesHintsExpanded ? 'Hide' : 'Rules'}
                    </button>
                </div>
            ) : null}
            {showBoardPowerBar ? (
                <div
                    aria-label="Board powers"
                    aria-orientation="vertical"
                    className={styles.toolbarSection}
                    onKeyDown={handleVerticalToolbarKeyDown}
                    ref={powersToolbarRef}
                    role="toolbar"
                >
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
                        <img alt="" className={styles.toolbarGlyphImg} src={GAMEPLAY_TOOLBAR_ICONS.shuffle} />
                        <span aria-hidden="true" className={styles.toolbarFlyoutLabel}>
                            Shuffle
                        </span>
                        <span
                            className={`${styles.powerBadge} ${
                                run.shuffleCharges > 0 ? styles.powerBadgeCharged : styles.powerBadgeDepleted
                            }`}
                        >
                            {run.shuffleCharges}
                        </span>
                    </button>
                    <div
                        className={styles.regionShuffleCluster}
                        role="group"
                        aria-label={`Row shuffle. Charges ${run.regionShuffleCharges}.${
                            run.regionShuffleFreeThisFloor && run.relicIds.includes('region_shuffle_free_first')
                                ? ' First row shuffle this floor is free.'
                                : ''
                        }`}
                    >
                        <div className={styles.regionShuffleHeader}>
                            <span className={styles.regionShuffleLabel}>Rows</span>
                            <span
                                className={`${styles.powerBadge} ${styles.powerBadgeInline} ${
                                    run.regionShuffleCharges > 0 ||
                                    (run.regionShuffleFreeThisFloor &&
                                        run.relicIds.includes('region_shuffle_free_first'))
                                        ? styles.powerBadgeCharged
                                        : styles.powerBadgeDepleted
                                }`}
                            >
                                {run.regionShuffleCharges}
                            </span>
                        </div>
                        <div className={styles.regionShuffleRows}>
                            {run.board
                                ? Array.from({ length: run.board.rows }, (_, row) => (
                                      <button
                                          key={row}
                                          aria-label={`Shuffle row ${row + 1}`}
                                          className={styles.regionRowBtn}
                                          disabled={regionShuffleDisabled || !canRegionShuffleRow(row)}
                                          onClick={() => {
                                              if (regionShuffleDisabled || !canRegionShuffleRow(row)) {
                                                  return;
                                              }
                                              const handle = tileBoardRef.current;
                                              if (handle) {
                                                  handle.runShuffleAnimation(() => shuffleRegionRow(row));
                                              } else {
                                                  shuffleRegionRow(row);
                                              }
                                          }}
                                          title={regionShuffleTitle}
                                          type="button"
                                      >
                                          {row + 1}
                                      </button>
                                  ))
                                : null}
                        </div>
                    </div>
                    <button
                        aria-label={boardPinMode ? 'Exit pin mode' : 'Pin mode — tap tiles to mark'}
                        aria-pressed={boardPinMode}
                        className={`${styles.iconAction} ${boardPinMode ? styles.iconActionActive : ''}`}
                        onClick={() => toggleBoardPinMode()}
                        title={pinTitle}
                        type="button"
                    >
                        <img alt="" className={styles.toolbarGlyphImg} src={GAMEPLAY_TOOLBAR_ICONS.pin} />
                        <span aria-hidden="true" className={styles.toolbarFlyoutLabel}>
                            Pin
                        </span>
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
                        <img alt="" className={styles.toolbarGlyphImg} src={GAMEPLAY_TOOLBAR_ICONS.destroy} />
                        <span aria-hidden="true" className={styles.toolbarFlyoutLabel}>
                            Destroy
                        </span>
                        <span
                            className={`${styles.powerBadge} ${
                                run.destroyPairCharges > 0 ? styles.powerBadgeCharged : styles.powerBadgeDepleted
                            }`}
                        >
                            {run.destroyPairCharges}
                        </span>
                    </button>
                    <button
                        aria-label={`Peek one hidden tile. Charges: ${run.peekCharges}. ${peekModeArmed ? 'Tap a tile' : 'Arm peek then tap'}`}
                        aria-pressed={peekModeArmed}
                        className={`${styles.iconAction} ${styles.iconActionWithBadge} ${peekModeArmed ? styles.iconActionActive : ''}`}
                        disabled={run.peekCharges < 1}
                        onClick={() => togglePeekMode()}
                        title={
                            run.peekCharges < 1
                                ? 'No peek charges this floor'
                                : peekModeArmed
                                  ? 'Tap a hidden tile to peek (uses 1 charge)'
                                  : 'Arm peek, then tap a hidden tile'
                        }
                        type="button"
                    >
                        <img alt="" className={styles.toolbarGlyphImg} src={GAMEPLAY_TOOLBAR_ICONS.peek} />
                        <span aria-hidden="true" className={styles.toolbarFlyoutLabel}>
                            Peek
                        </span>
                        <span
                            className={`${styles.powerBadge} ${
                                run.peekCharges > 0 ? styles.powerBadgeCharged : styles.powerBadgeDepleted
                            }`}
                        >
                            {run.peekCharges}
                        </span>
                    </button>
                    {showFlashPairPower ? (
                        <button
                            aria-label={`Flash reveal pair. Charges: ${run.flashPairCharges}`}
                            className={`${styles.iconAction} ${styles.iconActionWithBadge}`}
                            disabled={flashPairDisabled}
                            onClick={() => {
                                if (flashPairDisabled) {
                                    return;
                                }
                                applyFlashPairPower();
                            }}
                            title={flashPairTitle}
                            type="button"
                        >
                            <span className={styles.toolbarFlashGlyph} aria-hidden="true">
                                ⚡
                            </span>
                            <span aria-hidden="true" className={styles.toolbarFlyoutLabel}>
                                Flash
                            </span>
                            <span
                                className={`${styles.powerBadge} ${
                                    run.flashPairCharges > 0 ? styles.powerBadgeCharged : styles.powerBadgeDepleted
                                }`}
                            >
                                {run.flashPairCharges}
                            </span>
                        </button>
                    ) : null}
                    <button
                        aria-label={`Remove one stray tile. Charges: ${run.strayRemoveCharges}. ${run.strayRemoveArmed ? 'Tap a tile' : 'Arm then tap'}`}
                        aria-pressed={run.strayRemoveArmed}
                        className={`${styles.iconAction} ${styles.iconActionWithBadge} ${run.strayRemoveArmed ? styles.iconActionActive : ''}`}
                        disabled={run.strayRemoveCharges < 1}
                        onClick={() => toggleStrayArm()}
                        title={
                            run.strayRemoveCharges < 1
                                ? 'No stray-remove charges'
                                : run.strayRemoveArmed
                                  ? 'Tap a hidden tile to remove it from play'
                                  : 'Arm stray remove, then tap a hidden tile'
                        }
                        type="button"
                    >
                        <img alt="" className={styles.toolbarGlyphImg} src={GAMEPLAY_TOOLBAR_ICONS.stray} />
                        <span aria-hidden="true" className={styles.toolbarFlyoutLabel}>
                            Stray
                        </span>
                        <span
                            className={`${styles.powerBadge} ${
                                run.strayRemoveCharges > 0 ? styles.powerBadgeCharged : styles.powerBadgeDepleted
                            }`}
                        >
                            {run.strayRemoveCharges}
                        </span>
                    </button>
                    <div className={styles.powerTeachingPanel} data-testid="power-teaching-panel">
                        {powerTeachingRows.map((row) => (
                            <div className={styles.powerTeachingRow} key={row.id}>
                                <strong>{row.label}</strong>
                                <span>{row.job}</span>
                                <small>{row.disabledReason ?? row.cost}</small>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
            {run.status === 'resolving' && run.undoUsesThisFloor > 0 ? (
                <div
                    aria-label="Resolve options"
                    aria-orientation="vertical"
                    className={styles.toolbarSection}
                    onKeyDown={handleVerticalToolbarKeyDown}
                    ref={resolveToolbarRef}
                    role="toolbar"
                >
                    <button
                        aria-label="Undo last flip (uses your one undo this floor)"
                        className={styles.iconAction}
                        onClick={() => undoResolvingFlip()}
                        title="Undo the current flip before it resolves"
                        type="button"
                    >
                        <img alt="" className={styles.toolbarGlyphImg} src={GAMEPLAY_TOOLBAR_ICONS.undo} />
                        <span aria-hidden="true" className={styles.toolbarFlyoutLabel}>Undo</span>
                    </button>
                </div>
            ) : null}
        </aside>
    );
});

GameLeftToolbar.displayName = 'GameLeftToolbar';

export default GameLeftToolbar;

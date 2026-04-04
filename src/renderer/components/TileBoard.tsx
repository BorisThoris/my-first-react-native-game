import { Canvas } from '@react-three/fiber';
import {
    Component,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type MouseEvent,
    type PointerEvent as ReactPointerEvent,
    type ReactNode
} from 'react';
import { flushSync } from 'react-dom';
import type { BoardState, Tile } from '../../shared/contracts';
import { useCoarsePointer } from '../hooks/useCoarsePointer';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import styles from './TileBoard.module.css';
import { getTileFieldAmplification } from './tileFieldTilt';
import TileBoardPostFx from './TileBoardPostFx';
import TileBoardScene, { type TileBoardSceneHandle, type TileHoverTiltState } from './TileBoardScene';
import {
    COMPACT_BOARD_FIT_MARGIN,
    MOBILE_CAMERA_FIT_MARGIN,
    ROOMY_BOARD_FIT_MARGIN,
    carryBoardViewportForward,
    clampBoardZoom,
    clampBoardViewport,
    createFittedBoardViewport,
    getBoardFitZoom,
    screenPointToWorld,
    type TileBoardViewportMetrics,
    type TileBoardViewportState
} from './tileBoardViewport';
import { TILE_SPACING } from './tileShatter';
import {
    captureTileRects,
    computeShuffleMotionBudgetMs,
    runShuffleFlipFromRects
} from './shuffleFlipAnimation';

export type TileBoardHandle = {
    runShuffleAnimation: (applyShuffle: () => void) => void;
};

interface TileBoardProps {
    board: BoardState;
    debugPeekActive: boolean;
    interactive: boolean;
    mobileCameraMode: boolean;
    pinnedTileIds?: string[];
    previewActive: boolean;
    reduceMotion: boolean;
    viewportResetToken: number;
    frameStyle?: CSSProperties;
    onTileSelect: (tileId: string, event?: MouseEvent<HTMLButtonElement>) => void;
}

interface TileBoardFallbackProps {
    board: BoardState;
    debugPeekActive: boolean;
    interactive: boolean;
    onHoverLeave: (tileId: string, event: ReactPointerEvent<HTMLButtonElement>) => void;
    onHoverMove: (tileId: string, event: ReactPointerEvent<HTMLButtonElement>) => void;
    pinnedTileIds: string[];
    previewActive: boolean;
    onTileSelect: (tileId: string, event?: MouseEvent<HTMLButtonElement>) => void;
    tileGridStyle: CSSProperties;
}

interface StageWorldViewport {
    height: number;
    width: number;
}

interface TouchPoint {
    clientX: number;
    clientY: number;
}

interface TouchGestureSnapshot {
    anchorBoardX: number;
    anchorBoardY: number;
    pointerIds: [number, number];
    startDistance: number;
    startZoom: number;
}

interface MouseDragSnapshot {
    dragActive: boolean;
    pickOnRelease: boolean;
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startPanX: number;
    startPanY: number;
    startWorldX: number;
    startWorldY: number;
}

const MOUSE_PAN_DRAG_THRESHOLD_PX = 8;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const normalizeHoverPoint = (
    event: ReactPointerEvent<HTMLButtonElement>
): {
    x: number;
    y: number;
} => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);

    return { x, y };
};

const canUseWebGL = (): boolean => {
    if (typeof document === 'undefined') {
        return false;
    }

    try {
        const canvas = document.createElement('canvas');
        return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl'));
    } catch {
        return false;
    }
};

const getTileClassName = (tile: Tile, faceUp: boolean, locked: boolean, isPinned: boolean): string =>
    [
        styles.fallbackTile,
        faceUp ? styles.faceUp : '',
        tile.state === 'matched' ? styles.matched : '',
        locked && tile.state === 'hidden' ? styles.locked : '',
        isPinned && tile.state === 'hidden' ? styles.fallbackTilePinned : ''
    ]
        .filter(Boolean)
        .join(' ');

const buildTileGridStyle = (board: BoardState): CSSProperties => ({
    gridTemplateColumns: `repeat(${board.columns}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${board.rows}, minmax(0, 1fr))`
});

const getTilePosition = (index: number, columns: number): { row: number; column: number } => ({
    row: Math.floor(index / columns) + 1,
    column: (index % columns) + 1
});

const getTileAriaLabel = (tile: Tile, faceUp: boolean, row: number, column: number): string =>
    faceUp ? `Tile ${tile.label}, row ${row}, column ${column}` : `Hidden tile, row ${row}, column ${column}`;

const getTouchCentroid = (first: TouchPoint, second: TouchPoint): TouchPoint => ({
    clientX: (first.clientX + second.clientX) / 2,
    clientY: (first.clientY + second.clientY) / 2
});

const getTouchDistance = (first: TouchPoint, second: TouchPoint): number =>
    Math.max(1, Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY));

const TileBoardFallback = ({
    board,
    debugPeekActive,
    interactive,
    onHoverLeave,
    onHoverMove,
    pinnedTileIds,
    previewActive,
    onTileSelect,
    tileGridStyle
}: TileBoardFallbackProps) => {
    const locked = board.flippedTileIds.length === 2;
    const pinnedSet = useMemo(() => new Set(pinnedTileIds), [pinnedTileIds]);

    return (
        <div className={styles.fallbackBoard} data-testid="tile-board-fallback" style={tileGridStyle}>
            {board.tiles.map((tile, index) => {
                const disabled = tile.state === 'matched' || !interactive || (locked && tile.state === 'hidden');
                const faceUp = tile.state !== 'hidden' || debugPeekActive || previewActive;
                const isPinned = pinnedSet.has(tile.id);
                const { row, column } = getTilePosition(index, board.columns);
                const labelText = tile.label.toUpperCase();
                const showFrontLabel = labelText !== tile.symbol.toUpperCase();

                const fieldAmp = getTileFieldAmplification(index, board.columns, board.rows);

                return (
                    <button
                        aria-label={getTileAriaLabel(tile, faceUp, row, column)}
                        className={getTileClassName(tile, faceUp, locked, isPinned)}
                        data-tile-id={tile.id}
                        disabled={disabled}
                        key={tile.id}
                        onClick={() => onTileSelect(tile.id)}
                        onPointerEnter={(event) => onHoverMove(tile.id, event)}
                        onPointerLeave={(event) => onHoverLeave(tile.id, event)}
                        onPointerMove={(event) => onHoverMove(tile.id, event)}
                        style={{ ['--field-amp' as string]: String(fieldAmp) }}
                        type="button"
                    >
                        <span className={styles.tileFace}>
                            <span className={styles.pulseGlow} />
                            {faceUp ? (
                                <span className={styles.cardBack} data-testid="tile-card-face">
                                    <span className={styles.tileSymbol}>{tile.symbol}</span>
                                    {showFrontLabel ? <span className={styles.cardFaceLabel}>{labelText}</span> : null}
                                </span>
                            ) : (
                                <span aria-hidden="true" className={styles.cardBack} data-testid="tile-card-face" />
                            )}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

class TileBoardErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
    state = { hasError: false };

    static getDerivedStateFromError(): { hasError: boolean } {
        return { hasError: true };
    }

    render(): ReactNode {
        return this.state.hasError ? this.props.fallback : this.props.children;
    }
}

const TileBoard = forwardRef<TileBoardHandle, TileBoardProps>(function TileBoard(
    {
        board,
        debugPeekActive,
        interactive,
        mobileCameraMode,
        pinnedTileIds = [],
        previewActive,
        reduceMotion,
        viewportResetToken,
        frameStyle,
        onTileSelect
    },
    ref
) {
    const { height, width } = useViewportSize();
    const compact = width <= 760 || height <= 760;
    const touchPrimary = useCoarsePointer();
    const threeEnabled = useMemo(() => canUseWebGL(), []);
    const cameraViewportMode = mobileCameraMode && threeEnabled;
    const touchGestureMode = cameraViewportMode && touchPrimary;
    const desktopCameraMode = cameraViewportMode && !touchPrimary;
    const frameRef = useRef<HTMLDivElement>(null);
    const shuffleClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [shuffleAnimating, setShuffleAnimating] = useState(false);
    const [shuffleMotionDeadlineMs, setShuffleMotionDeadlineMs] = useState(0);
    const sceneHandleRef = useRef<TileBoardSceneHandle | null>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const hoverTiltRef = useRef<TileHoverTiltState>({ tileId: null, x: 0, y: 0 });
    const activeTouchPointsRef = useRef<Map<number, TouchPoint>>(new Map());
    const gestureSnapshotRef = useRef<TouchGestureSnapshot | null>(null);
    const mouseDragSnapshotRef = useRef<MouseDragSnapshot | null>(null);
    const gestureActiveRef = useRef(false);
    const selectionSuppressedRef = useRef(false);
    const [gestureActive, setGestureActive] = useState(false);
    const [selectionSuppressed, setSelectionSuppressed] = useState(false);
    const [stageWorldViewport, setStageWorldViewport] = useState<StageWorldViewport>({ height: 0, width: 0 });
    const [viewportState, setViewportState] = useState<TileBoardViewportState>(() => createFittedBoardViewport(1));
    const viewportStateRef = useRef<TileBoardViewportState>(viewportState);
    const viewportMetricsRef = useRef<TileBoardViewportMetrics | null>(null);
    const viewportResetTokenRef = useRef(viewportResetToken);
    const { tiltRef: fieldTiltRef, permission, requestMotionPermission } = usePlatformTiltField({
        enabled: true,
        reduceMotion,
        surfaceRef: frameRef,
        strength: 1,
        suspended: gestureActive
    });
    const mergedFrameStyle = useMemo(
        () => ({
            ...frameStyle,
            ['--board-aspect' as string]: `${board.columns} / ${board.rows}`
        }),
        [board.columns, board.rows, frameStyle]
    );

    useImperativeHandle(ref, () => ({
        runShuffleAnimation: (applyShuffle: () => void) => {
            if (reduceMotion) {
                if (shuffleClearTimeoutRef.current) {
                    clearTimeout(shuffleClearTimeoutRef.current);
                    shuffleClearTimeoutRef.current = null;
                }
                setShuffleMotionDeadlineMs(0);
                applyShuffle();
                return;
            }

            const root = frameRef.current;
            const beforeMap = root ? captureTileRects(root) : new Map<string, DOMRect>();
            const tileCountForBudget = beforeMap.size > 0 ? beforeMap.size : board.tiles.length;
            const motionBudgetMs = computeShuffleMotionBudgetMs(tileCountForBudget);

            if (shuffleClearTimeoutRef.current) {
                clearTimeout(shuffleClearTimeoutRef.current);
                shuffleClearTimeoutRef.current = null;
            }

            const deadline = performance.now() + motionBudgetMs;
            setShuffleMotionDeadlineMs(deadline);
            shuffleClearTimeoutRef.current = setTimeout(() => {
                setShuffleMotionDeadlineMs(0);
                shuffleClearTimeoutRef.current = null;
            }, motionBudgetMs + 100);

            flushSync(() => {
                applyShuffle();
            });

            if (root && beforeMap.size > 0) {
                setShuffleAnimating(true);
                void runShuffleFlipFromRects(root, beforeMap).finally(() => {
                    setShuffleAnimating(false);
                });
            } else {
                setShuffleAnimating(false);
            }
        }
    }), [board.tiles.length, reduceMotion]);

    useEffect(
        () => () => {
            if (shuffleClearTimeoutRef.current) {
                clearTimeout(shuffleClearTimeoutRef.current);
            }
        },
        []
    );
    const tileGridStyle = buildTileGridStyle(board);
    const deviceDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    /** Cap DPR for GPU cost; slightly higher caps = sharper cards on dense displays. */
    const dpr = Math.min(deviceDpr, compact ? 2.35 : 2.1);
    /** With SMAA post-pass, skip default framebuffer MSAA to avoid redundant cost. */
    const glAntialias = reduceMotion;
    const boardWorldWidth = useMemo(() => (board.columns - 1) * TILE_SPACING + 1, [board.columns]);
    const boardWorldHeight = useMemo(() => (board.rows - 1) * TILE_SPACING + 1, [board.rows]);
    const fitMargin = cameraViewportMode ? MOBILE_CAMERA_FIT_MARGIN : compact ? COMPACT_BOARD_FIT_MARGIN : ROOMY_BOARD_FIT_MARGIN;
    const fitZoom = useMemo(
        () =>
            getBoardFitZoom({
                boardHeight: boardWorldHeight,
                boardWidth: boardWorldWidth,
                margin: fitMargin,
                viewportHeight: stageWorldViewport.height,
                viewportWidth: stageWorldViewport.width
            }),
        [boardWorldHeight, boardWorldWidth, fitMargin, stageWorldViewport.height, stageWorldViewport.width]
    );
    const renderedViewportState = useMemo(() => {
        if (!cameraViewportMode) {
            return createFittedBoardViewport(fitZoom);
        }

        return clampBoardViewport({
            boardHeight: boardWorldHeight,
            boardWidth: boardWorldWidth,
            fitZoom,
            panX: viewportState.panX,
            panY: viewportState.panY,
            viewportHeight: stageWorldViewport.height,
            viewportWidth: stageWorldViewport.width,
            zoom: viewportState.zoom
        });
    }, [
        boardWorldHeight,
        boardWorldWidth,
        fitZoom,
        cameraViewportMode,
        stageWorldViewport.height,
        stageWorldViewport.width,
        viewportState.panX,
        viewportState.panY,
        viewportState.zoom
    ]);

    const syncGestureActive = (active: boolean): void => {
        gestureActiveRef.current = active;
        setGestureActive((current) => (current === active ? current : active));
    };

    const syncSelectionSuppressed = (suppressed: boolean): void => {
        selectionSuppressedRef.current = suppressed;
        setSelectionSuppressed((current) => (current === suppressed ? current : suppressed));
    };

    const clearTouchGestureState = (clearSuppression: boolean): void => {
        activeTouchPointsRef.current.clear();
        gestureSnapshotRef.current = null;
        syncGestureActive(false);
        if (clearSuppression) {
            syncSelectionSuppressed(false);
        }
    };

    const handleTileSelect = (tileId: string): void => {
        if (selectionSuppressedRef.current) {
            return;
        }

        onTileSelect(tileId);
    };

    const clearHoverTilt = (tileId: string, event: ReactPointerEvent<HTMLButtonElement>): void => {
        if (hoverTiltRef.current.tileId === tileId) {
            hoverTiltRef.current = { tileId: null, x: 0, y: 0 };
        }

        event.currentTarget.style.setProperty('--hover-x', '0');
        event.currentTarget.style.setProperty('--hover-y', '0');
    };

    const updateHoverTilt = (tileId: string, event: ReactPointerEvent<HTMLButtonElement>): void => {
        if (reduceMotion || event.pointerType === 'touch' || event.pointerType === 'pen') {
            clearHoverTilt(tileId, event);
            return;
        }

        const { x, y } = normalizeHoverPoint(event);
        hoverTiltRef.current = { tileId, x, y };
        event.currentTarget.style.setProperty('--hover-x', x.toFixed(4));
        event.currentTarget.style.setProperty('--hover-y', y.toFixed(4));
    };

    const handleStageViewportChange = useCallback((nextViewport: StageWorldViewport): void => {
        setStageWorldViewport((current) =>
            Math.abs(current.width - nextViewport.width) < 0.0001 && Math.abs(current.height - nextViewport.height) < 0.0001
                ? current
                : nextViewport
        );
    }, []);

    useEffect(() => {
        viewportStateRef.current = renderedViewportState;
        viewportMetricsRef.current = {
            boardHeight: boardWorldHeight,
            boardWidth: boardWorldWidth,
            fitZoom,
            viewportHeight: stageWorldViewport.height,
            viewportWidth: stageWorldViewport.width
        };
    }, [
        renderedViewportState,
        boardWorldHeight,
        boardWorldWidth,
        fitZoom,
        stageWorldViewport.height,
        stageWorldViewport.width
    ]);

    useEffect(() => {
        hoverTiltRef.current = { tileId: null, x: 0, y: 0 };
    }, [board.level, board.tiles.length, reduceMotion, selectionSuppressed]);

    useEffect(() => {
        const resetRequested = viewportResetToken !== viewportResetTokenRef.current;
        const previousViewport = viewportStateRef.current;
        const previousMetrics = viewportMetricsRef.current;
        const nextMetrics: TileBoardViewportMetrics = {
            boardHeight: boardWorldHeight,
            boardWidth: boardWorldWidth,
            fitZoom,
            viewportHeight: stageWorldViewport.height,
            viewportWidth: stageWorldViewport.width
        };

        viewportResetTokenRef.current = viewportResetToken;

        if (!cameraViewportMode || stageWorldViewport.width <= 0 || stageWorldViewport.height <= 0) {
            const nextViewport = createFittedBoardViewport(fitZoom);
            viewportStateRef.current = nextViewport;
            viewportMetricsRef.current = nextMetrics;
            setViewportState(nextViewport);
            clearTouchGestureState(true);
            return;
        }

        const nextViewport =
            resetRequested || !previousMetrics
                ? createFittedBoardViewport(fitZoom)
                : carryBoardViewportForward({
                      nextMetrics,
                      previousMetrics,
                      previousViewport
                  });

        viewportStateRef.current = nextViewport;
        viewportMetricsRef.current = nextMetrics;
        setViewportState(nextViewport);
        clearTouchGestureState(true);
    }, [
        board.columns,
        board.level,
        board.rows,
        boardWorldHeight,
        boardWorldWidth,
        fitZoom,
        cameraViewportMode,
        stageWorldViewport.height,
        stageWorldViewport.width,
        viewportResetToken
    ]);

    useEffect(() => {
        if (!touchGestureMode) {
            clearTouchGestureState(true);
            return;
        }

        const stageNode = stageRef.current;

        if (!stageNode) {
            return;
        }

        const stopGestureEvent = (event: globalThis.PointerEvent): void => {
            event.preventDefault();
            event.stopPropagation();
        };

        const getTrackedGestureTouches = (): [TouchPoint, TouchPoint] | null => {
            const snapshot = gestureSnapshotRef.current;

            if (snapshot) {
                const first = activeTouchPointsRef.current.get(snapshot.pointerIds[0]);
                const second = activeTouchPointsRef.current.get(snapshot.pointerIds[1]);

                if (first && second) {
                    return [first, second];
                }
            }

            const touches = Array.from(activeTouchPointsRef.current.values()).slice(0, 2);

            return touches.length === 2 ? [touches[0], touches[1]] : null;
        };

        const beginGestureSession = (): void => {
            const touches = Array.from(activeTouchPointsRef.current.entries()).slice(0, 2);

            if (touches.length < 2 || stageWorldViewport.width <= 0 || stageWorldViewport.height <= 0) {
                return;
            }

            const [[firstPointerId, firstTouch], [secondPointerId, secondTouch]] = touches;
            const stageRect = stageNode.getBoundingClientRect();
            const centroid = getTouchCentroid(firstTouch, secondTouch);
            const centroidWorld = screenPointToWorld(centroid, stageRect, stageWorldViewport.width, stageWorldViewport.height);
            const activeViewport = viewportStateRef.current;
            const activeScale = Math.max(activeViewport.fitZoom * activeViewport.zoom, 0.0001);

            gestureSnapshotRef.current = {
                anchorBoardX: (centroidWorld.panX - activeViewport.panX) / activeScale,
                anchorBoardY: (centroidWorld.panY - activeViewport.panY) / activeScale,
                pointerIds: [firstPointerId, secondPointerId],
                startDistance: getTouchDistance(firstTouch, secondTouch),
                startZoom: activeViewport.zoom
            };

            syncGestureActive(true);
            syncSelectionSuppressed(true);
        };

        const updateGestureViewport = (): void => {
            const snapshot = gestureSnapshotRef.current;
            const trackedTouches = getTrackedGestureTouches();

            if (!snapshot || !trackedTouches) {
                return;
            }

            const [firstTouch, secondTouch] = trackedTouches;
            const stageRect = stageNode.getBoundingClientRect();
            const centroid = getTouchCentroid(firstTouch, secondTouch);
            const centroidWorld = screenPointToWorld(centroid, stageRect, stageWorldViewport.width, stageWorldViewport.height);
            const nextZoom = snapshot.startZoom * (getTouchDistance(firstTouch, secondTouch) / snapshot.startDistance);
            const nextPanX = centroidWorld.panX - snapshot.anchorBoardX * fitZoom * nextZoom;
            const nextPanY = centroidWorld.panY - snapshot.anchorBoardY * fitZoom * nextZoom;

            setViewportState((current) => {
                const nextViewport = clampBoardViewport({
                    boardHeight: boardWorldHeight,
                    boardWidth: boardWorldWidth,
                    fitZoom,
                    panX: nextPanX,
                    panY: nextPanY,
                    viewportHeight: stageWorldViewport.height,
                    viewportWidth: stageWorldViewport.width,
                    zoom: nextZoom
                });

                viewportStateRef.current = nextViewport;
                return current.panX === nextViewport.panX &&
                    current.panY === nextViewport.panY &&
                    current.zoom === nextViewport.zoom &&
                    current.fitZoom === nextViewport.fitZoom
                    ? current
                    : nextViewport;
            });
        };

        const handlePointerDown = (event: globalThis.PointerEvent): void => {
            if (event.pointerType !== 'touch') {
                return;
            }

            activeTouchPointsRef.current.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });

            if (activeTouchPointsRef.current.size >= 2) {
                beginGestureSession();
                stopGestureEvent(event);
            }
        };

        const handlePointerMove = (event: globalThis.PointerEvent): void => {
            if (!activeTouchPointsRef.current.has(event.pointerId)) {
                return;
            }

            activeTouchPointsRef.current.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });

            if (activeTouchPointsRef.current.size >= 2 && gestureSnapshotRef.current) {
                updateGestureViewport();
                stopGestureEvent(event);
                return;
            }

            if (selectionSuppressedRef.current) {
                stopGestureEvent(event);
            }
        };

        const handlePointerEnd = (event: globalThis.PointerEvent): void => {
            const wasTracked = activeTouchPointsRef.current.delete(event.pointerId);

            if (!wasTracked && !selectionSuppressedRef.current) {
                return;
            }

            if (selectionSuppressedRef.current) {
                stopGestureEvent(event);
            }

            if (activeTouchPointsRef.current.size >= 2) {
                beginGestureSession();
                return;
            }

            gestureSnapshotRef.current = null;
            syncGestureActive(false);

            if (activeTouchPointsRef.current.size === 0) {
                syncSelectionSuppressed(false);
            }
        };

        stageNode.addEventListener('pointerdown', handlePointerDown, true);
        stageNode.addEventListener('pointermove', handlePointerMove, true);
        stageNode.addEventListener('pointerup', handlePointerEnd, true);
        stageNode.addEventListener('pointercancel', handlePointerEnd, true);

        return () => {
            stageNode.removeEventListener('pointerdown', handlePointerDown, true);
            stageNode.removeEventListener('pointermove', handlePointerMove, true);
            stageNode.removeEventListener('pointerup', handlePointerEnd, true);
            stageNode.removeEventListener('pointercancel', handlePointerEnd, true);
            clearTouchGestureState(true);
        };
    }, [
        boardWorldHeight,
        boardWorldWidth,
        fitZoom,
        touchGestureMode,
        stageWorldViewport.height,
        stageWorldViewport.width
    ]);

    useEffect(() => {
        if (!desktopCameraMode) {
            mouseDragSnapshotRef.current = null;
            return;
        }

        const stageNode = stageRef.current;

        if (!stageNode) {
            return;
        }

        const stopMouseEvent = (event: globalThis.MouseEvent | globalThis.WheelEvent | globalThis.PointerEvent): void => {
            event.preventDefault();
            event.stopPropagation();
        };

        const handleWheel = (event: WheelEvent): void => {
            if (stageWorldViewport.width <= 0 || stageWorldViewport.height <= 0) {
                return;
            }

            stopMouseEvent(event);

            const stageRect = stageNode.getBoundingClientRect();
            const pointerWorld = screenPointToWorld(
                { clientX: event.clientX, clientY: event.clientY },
                stageRect,
                stageWorldViewport.width,
                stageWorldViewport.height
            );
            const currentViewport = viewportStateRef.current;
            const currentScale = Math.max(currentViewport.fitZoom * currentViewport.zoom, 0.0001);
            const nextZoom = clampBoardZoom(currentViewport.zoom * Math.exp(-event.deltaY * 0.0016));
            const anchorBoardX = (pointerWorld.panX - currentViewport.panX) / currentScale;
            const anchorBoardY = (pointerWorld.panY - currentViewport.panY) / currentScale;
            const nextPanX = pointerWorld.panX - anchorBoardX * currentViewport.fitZoom * nextZoom;
            const nextPanY = pointerWorld.panY - anchorBoardY * currentViewport.fitZoom * nextZoom;

            setViewportState((current) => {
                const nextViewport = clampBoardViewport({
                    boardHeight: boardWorldHeight,
                    boardWidth: boardWorldWidth,
                    fitZoom,
                    panX: nextPanX,
                    panY: nextPanY,
                    viewportHeight: stageWorldViewport.height,
                    viewportWidth: stageWorldViewport.width,
                    zoom: nextZoom
                });

                viewportStateRef.current = nextViewport;
                return current.panX === nextViewport.panX &&
                    current.panY === nextViewport.panY &&
                    current.zoom === nextViewport.zoom &&
                    current.fitZoom === nextViewport.fitZoom
                    ? current
                    : nextViewport;
            });
        };

        const handlePointerDown = (event: globalThis.PointerEvent): void => {
            const dragButton = event.button === 0 || event.button === 1 || event.button === 2;

            if (event.pointerType !== 'mouse' || !dragButton || stageWorldViewport.width <= 0 || stageWorldViewport.height <= 0) {
                return;
            }

            const stageRect = stageNode.getBoundingClientRect();
            const startWorld = screenPointToWorld(
                { clientX: event.clientX, clientY: event.clientY },
                stageRect,
                stageWorldViewport.width,
                stageWorldViewport.height
            );
            const currentViewport = viewportStateRef.current;

            mouseDragSnapshotRef.current = {
                dragActive: event.button !== 0,
                pickOnRelease: event.button === 0,
                pointerId: event.pointerId,
                startClientX: event.clientX,
                startClientY: event.clientY,
                startPanX: currentViewport.panX,
                startPanY: currentViewport.panY,
                startWorldX: startWorld.panX,
                startWorldY: startWorld.panY
            };

            stageNode.setPointerCapture(event.pointerId);

            if (event.button !== 0) {
                syncGestureActive(true);
                syncSelectionSuppressed(true);
            }

            stopMouseEvent(event);
        };

        const handlePointerMove = (event: globalThis.PointerEvent): void => {
            const snapshot = mouseDragSnapshotRef.current;

            if (!snapshot || event.pointerId !== snapshot.pointerId) {
                return;
            }

            if (!snapshot.dragActive) {
                const dragDistance = Math.hypot(event.clientX - snapshot.startClientX, event.clientY - snapshot.startClientY);

                if (dragDistance < MOUSE_PAN_DRAG_THRESHOLD_PX) {
                    return;
                }

                snapshot.dragActive = true;
                syncGestureActive(true);
                syncSelectionSuppressed(true);
            }

            const stageRect = stageNode.getBoundingClientRect();
            const currentWorld = screenPointToWorld(
                { clientX: event.clientX, clientY: event.clientY },
                stageRect,
                stageWorldViewport.width,
                stageWorldViewport.height
            );
            const nextPanX = snapshot.startPanX + (currentWorld.panX - snapshot.startWorldX);
            const nextPanY = snapshot.startPanY + (currentWorld.panY - snapshot.startWorldY);

            setViewportState((current) => {
                const nextViewport = clampBoardViewport({
                    boardHeight: boardWorldHeight,
                    boardWidth: boardWorldWidth,
                    fitZoom,
                    panX: nextPanX,
                    panY: nextPanY,
                    viewportHeight: stageWorldViewport.height,
                    viewportWidth: stageWorldViewport.width,
                    zoom: current.zoom
                });

                viewportStateRef.current = nextViewport;
                return current.panX === nextViewport.panX &&
                    current.panY === nextViewport.panY &&
                    current.zoom === nextViewport.zoom &&
                    current.fitZoom === nextViewport.fitZoom
                    ? current
                    : nextViewport;
            });

            stopMouseEvent(event);
        };

        const handlePointerEnd = (event: globalThis.PointerEvent): void => {
            const snapshot = mouseDragSnapshotRef.current;

            if (!snapshot || event.pointerId !== snapshot.pointerId) {
                return;
            }

            const shouldPick = event.type === 'pointerup' && snapshot.pickOnRelease && !snapshot.dragActive;
            mouseDragSnapshotRef.current = null;
            syncGestureActive(false);
            syncSelectionSuppressed(false);
            if (stageNode.hasPointerCapture(event.pointerId)) {
                stageNode.releasePointerCapture(event.pointerId);
            }
            stopMouseEvent(event);

            if (shouldPick) {
                sceneHandleRef.current?.pickTileAtClientPoint(event.clientX, event.clientY);
            }
        };

        const handleContextMenu = (event: globalThis.MouseEvent): void => {
            stopMouseEvent(event);
        };

        stageNode.addEventListener('wheel', handleWheel, { passive: false });
        stageNode.addEventListener('pointerdown', handlePointerDown, true);
        stageNode.addEventListener('pointermove', handlePointerMove, true);
        stageNode.addEventListener('pointerup', handlePointerEnd, true);
        stageNode.addEventListener('pointercancel', handlePointerEnd, true);
        stageNode.addEventListener('contextmenu', handleContextMenu);

        return () => {
            stageNode.removeEventListener('wheel', handleWheel);
            stageNode.removeEventListener('pointerdown', handlePointerDown, true);
            stageNode.removeEventListener('pointermove', handlePointerMove, true);
            stageNode.removeEventListener('pointerup', handlePointerEnd, true);
            stageNode.removeEventListener('pointercancel', handlePointerEnd, true);
            stageNode.removeEventListener('contextmenu', handleContextMenu);
            mouseDragSnapshotRef.current = null;
            syncGestureActive(false);
            syncSelectionSuppressed(false);
        };
    }, [
        boardWorldHeight,
        boardWorldWidth,
        desktopCameraMode,
        fitZoom,
        stageWorldViewport.height,
        stageWorldViewport.width
    ]);

    const showMotionChip = touchPrimary && !reduceMotion && (permission === 'prompt' || permission === 'denied');

    const fallback = (
        <TileBoardFallback
            board={board}
            debugPeekActive={debugPeekActive}
            interactive={interactive}
            onHoverLeave={clearHoverTilt}
            onHoverMove={updateHoverTilt}
            pinnedTileIds={pinnedTileIds}
            onTileSelect={handleTileSelect}
            previewActive={previewActive}
            tileGridStyle={tileGridStyle}
        />
    );

    return (
        <div
            className={`${styles.frame} ${cameraViewportMode ? styles.frameMobileCamera : ''} ${
                shuffleAnimating ? styles.frameShuffleAnimating : ''
            }`}
            data-board-pan-x={renderedViewportState.panX.toFixed(4)}
            data-board-pan-y={renderedViewportState.panY.toFixed(4)}
            data-board-zoom={renderedViewportState.zoom.toFixed(4)}
            data-gesture-active={gestureActive ? 'true' : 'false'}
            data-mobile-camera-mode={cameraViewportMode ? 'true' : 'false'}
            data-selection-suppressed={selectionSuppressed ? 'true' : 'false'}
            data-testid="tile-board-frame"
            ref={frameRef}
            style={mergedFrameStyle}
        >
            <div
                className={`${styles.stage} ${cameraViewportMode ? styles.stageMobileCamera : ''} ${threeEnabled ? styles.stageWebglPicking : ''}`}
                data-testid="tile-board-stage-shell"
                ref={stageRef}
            >
                {threeEnabled ? (
                    <TileBoardErrorBoundary fallback={fallback}>
                        <div className={styles.scene} data-testid="tile-board-stage">
                            <Canvas
                                className={styles.canvas}
                                dpr={dpr}
                                key={reduceMotion ? 'tile-board-reduced-motion' : 'tile-board-smaa'}
                                gl={{
                                    alpha: true,
                                    antialias: glAntialias,
                                    powerPreference: 'high-performance',
                                    premultipliedAlpha: false
                                }}
                                shadows={false}
                                camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0, 10.5] }}
                            >
                                <TileBoardScene
                                    board={board}
                                    boardViewport={renderedViewportState}
                                    compact={compact}
                                    debugPeekActive={debugPeekActive}
                                    fieldTiltRef={fieldTiltRef}
                                    hoverTiltRef={hoverTiltRef}
                                    interactionSuppressed={selectionSuppressed}
                                    interactive={interactive}
                                    key={board.level}
                                    onTilePick={handleTileSelect}
                                    onViewportMetricsChange={handleStageViewportChange}
                                    pinnedTileIds={pinnedTileIds}
                                    previewActive={previewActive}
                                    ref={sceneHandleRef}
                                    reduceMotion={reduceMotion}
                                    shuffleMotionDeadlineMs={shuffleMotionDeadlineMs}
                                />
                                <TileBoardPostFx reduceMotion={reduceMotion} />
                            </Canvas>
                        </div>

                        <div className={styles.interactionLayer} style={tileGridStyle}>
                            {board.tiles.map((tile, index) => {
                                const locked = board.flippedTileIds.length === 2;
                                const faceUp = tile.state !== 'hidden' || debugPeekActive || previewActive;
                                const disabled = tile.state === 'matched' || !interactive || (locked && tile.state === 'hidden');
                                const isPinned = pinnedTileIds.includes(tile.id);
                                const { row, column } = getTilePosition(index, board.columns);

                                return (
                                    <button
                                        aria-label={getTileAriaLabel(tile, faceUp, row, column)}
                                        className={`${styles.hitButton} ${faceUp ? styles.hitButtonFaceUp : ''} ${
                                            tile.state === 'matched' ? styles.hitButtonMatched : ''
                                        } ${isPinned && tile.state === 'hidden' ? styles.hitButtonPinned : ''}`}
                                        data-tile-id={tile.id}
                                        disabled={disabled}
                                        key={tile.id}
                                        onClick={() => handleTileSelect(tile.id)}
                                        type="button"
                                    />
                                );
                            })}
                        </div>
                    </TileBoardErrorBoundary>
                ) : (
                    fallback
                )}
                {showMotionChip ? (
                    <button
                        className={styles.motionChip}
                        onClick={(event) => {
                            event.stopPropagation();
                            void requestMotionPermission();
                        }}
                        onPointerDown={(event) => {
                            event.stopPropagation();
                        }}
                        type="button"
                    >
                        Enable motion
                    </button>
                ) : null}
            </div>
        </div>
    );
});

TileBoard.displayName = 'TileBoard';

export default TileBoard;

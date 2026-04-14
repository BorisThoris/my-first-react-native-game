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
    type FocusEvent,
    type ReactNode
} from 'react';
import { flushSync } from 'react-dom';
import type { BoardScreenSpaceAA, BoardState, GraphicsQualityPreset, RunStatus, Tile } from '../../shared/contracts';
import { getBoardDprCap } from '../../shared/graphicsQuality';
import { isNarrowShortLandscapeForMenuStack, VIEWPORT_MOBILE_MAX } from '../breakpoints';
import { useCoarsePointer } from '../hooks/useCoarsePointer';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import styles from './TileBoard.module.css';
import { isTilePickable } from './tileBoardPick';
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
import { computeShuffleMotionBudgetMs } from './shuffleFlipAnimation';

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
    /** When `auto`, matches legacy: SMAA when motion is on, MSAA when Reduce Motion is on. */
    boardScreenSpaceAA?: BoardScreenSpaceAA;
    graphicsQuality?: GraphicsQualityPreset;
    boardBloomEnabled?: boolean;
    viewportResetToken: number;
    frameStyle?: CSSProperties;
    /** Hidden tiles to dim when focus-assist is on (2D fallback and WebGL scene). */
    dimmedTileIds?: ReadonlySet<string>;
    peekRevealedTileIds?: string[];
    allowGambitThirdFlip?: boolean;
    wideRecallInPlay?: boolean;
    silhouetteDuringPlay?: boolean;
    nBackAnchorPairKey?: string | null;
    nBackMutatorActive?: boolean;
    /** Memorize-phase marker for the cursed pair objective (non-color-only ring). */
    cursedPairKey?: string | null;
    /** `shifting_spotlight`: current ward pair (lower match score if matched now). */
    wardPairKey?: string | null;
    /** `shifting_spotlight`: current bounty pair (bonus if matched now). */
    bountyPairKey?: string | null;
    runStatus?: RunStatus;
    /**
     * When false, hides early-tutorial **pair marker** chrome (inset pair-index ring on face-down DOM tiles).
     * WebGL path has no equivalent overlay.
     */
    showTutorialPairMarkers?: boolean;
    onTileSelect: (tileId: string) => void;
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

const getTilePosition = (index: number, columns: number): { row: number; column: number } => ({
    row: Math.floor(index / columns) + 1,
    column: (index % columns) + 1
});

const getTileAriaLabel = (tile: Tile, faceUp: boolean, row: number, column: number): string => {
    const base = faceUp ? `Tile ${tile.label}, row ${row}, column ${column}` : `Hidden tile, row ${row}, column ${column}`;
    const findableNote =
        tile.findableKind && faceUp && tile.state !== 'matched' ? ' Bonus pickup on this pair.' : '';
    return `${base}${findableNote}`;
};

const getTouchCentroid = (first: TouchPoint, second: TouchPoint): TouchPoint => ({
    clientX: (first.clientX + second.clientX) / 2,
    clientY: (first.clientY + second.clientY) / 2
});

const getTouchDistance = (first: TouchPoint, second: TouchPoint): number =>
    Math.max(1, Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY));

const getPickableTileIds = (board: BoardState, interactive: boolean, allowGambitThirdFlip: boolean): string[] => {
    const flippedN = board.flippedTileIds.length;
    const flipLocked = flippedN >= 2 && !(allowGambitThirdFlip && flippedN === 2);
    const ids: string[] = [];
    for (const tile of board.tiles) {
        if (tile.state === 'removed') {
            continue;
        }
        if (isTilePickable(tile, interactive, flipLocked)) {
            ids.push(tile.id);
        }
    }
    return ids;
};

const gridIndexFromTileId = (board: BoardState, tileId: string): number => {
    const i = board.tiles.findIndex((t) => t.id === tileId);
    return i >= 0 ? i : 0;
};

const moveFocusInGrid = (
    board: BoardState,
    fromId: string | null,
    dir: 'up' | 'down' | 'left' | 'right',
    interactive: boolean,
    allowGambitThirdFlip: boolean
): string | null => {
    const pickable = new Set(getPickableTileIds(board, interactive, allowGambitThirdFlip));
    if (pickable.size === 0) {
        return null;
    }
    const cols = board.columns;
    const rows = board.rows;
    let startIdx = 0;
    if (fromId && pickable.has(fromId)) {
        startIdx = gridIndexFromTileId(board, fromId);
    } else {
        const firstPickable = board.tiles.find((t) => pickable.has(t.id));
        startIdx = firstPickable ? gridIndexFromTileId(board, firstPickable.id) : 0;
    }
    let r = Math.floor(startIdx / cols);
    let c = startIdx % cols;
    const dr = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
    const dc = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    let nr = r + dr;
    let nc = c + dc;
    while (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const t = board.tiles[nr * cols + nc];
        if (t.state !== 'removed' && pickable.has(t.id)) {
            return t.id;
        }
        nr += dr;
        nc += dc;
    }
    return fromId;
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

// FX-016 matrix: docs/new_design/FX_REDUCE_MOTION_MATRIX.md
const TileBoard = forwardRef<TileBoardHandle, TileBoardProps>(function TileBoard(
    {
        board,
        debugPeekActive,
        interactive,
        mobileCameraMode,
        pinnedTileIds = [],
        previewActive,
        reduceMotion,
        boardScreenSpaceAA = 'auto',
        graphicsQuality = 'medium',
        boardBloomEnabled = false,
        viewportResetToken,
        frameStyle,
        dimmedTileIds,
        peekRevealedTileIds = [],
        allowGambitThirdFlip = false,
        wideRecallInPlay: _wideRecallInPlay = false,
        silhouetteDuringPlay: _silhouetteDuringPlay = false,
        nBackAnchorPairKey: _nBackAnchorPairKey = null,
        nBackMutatorActive: _nBackMutatorActive = false,
        cursedPairKey = null,
        wardPairKey = null,
        bountyPairKey = null,
        runStatus = 'playing',
        showTutorialPairMarkers: _showTutorialPairMarkers = true,
        onTileSelect
    },
    ref
) {
    const { height, width } = useViewportSize();
    const peekSet = useMemo(() => new Set(peekRevealedTileIds), [peekRevealedTileIds]);
    const compact =
        width <= VIEWPORT_MOBILE_MAX || isNarrowShortLandscapeForMenuStack(width, height);
    const touchPrimary = useCoarsePointer();
    const baselineWebGl = useMemo(() => canUseWebGL(), []);
    const [gpuSurfaceLost, setGpuSurfaceLost] = useState(false);
    const boardGraphicsOk = baselineWebGl && !gpuSurfaceLost;
    const cameraViewportMode = mobileCameraMode && boardGraphicsOk;
    const touchGestureMode = cameraViewportMode && touchPrimary;
    /**
     * Mouse wheel / drag pan on the stage: wide (non-compact) viewports always get it with WebGL; compact shell keeps
     * the previous rule (mouse only) so touch-first phones stay on pinch/pan gestures.
     */
    const desktopCameraMode = boardGraphicsOk && (!mobileCameraMode || !touchPrimary);
    const frameRef = useRef<HTMLDivElement>(null);
    const boardAppRef = useRef<HTMLDivElement>(null);
    const shuffleClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [shuffleAnimating, setShuffleAnimating] = useState(false);
    const [shuffleMotionDeadlineMs, setShuffleMotionDeadlineMs] = useState(0);
    /** Mirrors FLIP motion budget for WebGL FX-013 staggered deal-Z (0 = inactive). */
    const [shuffleMotionBudgetMs, setShuffleMotionBudgetMs] = useState(0);
    const [shuffleStaggerTileCount, setShuffleStaggerTileCount] = useState(0);
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
    const [focusedTileId, setFocusedTileId] = useState<string | null>(null);
    /** When false, no tile should show the keyboard focus ring (avoids a permanent “hover” on first pickable tile). */
    const [boardApplicationFocused, setBoardApplicationFocused] = useState(false);
    const [boardLiveMessage, setBoardLiveMessage] = useState('');
    const { tiltRef: fieldTiltRef, permission, requestMotionPermission } = usePlatformTiltField({
        enabled: true,
        reduceMotion,
        surfaceRef: frameRef,
        strength: 1,
        suspended: gestureActive
    });
    const mergedFrameStyle = useMemo(() => ({ ...frameStyle }), [frameStyle]);

    const hiddenTileCount = useMemo(
        () => board.tiles.filter((t) => t.state === 'hidden').length,
        [board.tiles]
    );

    /** Row,col pairs for tiles still hidden — used by e2e (canvas picking has no per-tile DOM). */
    const hiddenSlotsAttr = useMemo(
        () =>
            board.tiles
                .map((tile, index) => {
                    if (tile.state !== 'hidden') {
                        return null;
                    }
                    const row = Math.floor(index / board.columns) + 1;
                    const col = (index % board.columns) + 1;
                    return `${row},${col}`;
                })
                .filter((v): v is string => v != null)
                .join(';'),
        [board.columns, board.tiles]
    );

    useEffect(() => {
        const pickable = getPickableTileIds(board, interactive, allowGambitThirdFlip);
        setFocusedTileId((cur) => {
            if (pickable.length === 0) {
                return null;
            }
            if (cur && pickable.includes(cur)) {
                return cur;
            }
            return null;
        });
    }, [board, interactive, allowGambitThirdFlip]);

    const focusedTileLabel = useMemo(() => {
        if (!focusedTileId) {
            return '';
        }
        const idx = board.tiles.findIndex((t) => t.id === focusedTileId);
        if (idx < 0) {
            return '';
        }
        const tile = board.tiles[idx];
        const faceUp =
            tile.state !== 'hidden' || debugPeekActive || previewActive || peekSet.has(tile.id);
        const { row, column } = getTilePosition(idx, board.columns);
        return getTileAriaLabel(tile, faceUp, row, column);
    }, [board.tiles, board.columns, focusedTileId, debugPeekActive, previewActive, peekSet]);

    useEffect(() => {
        if (!focusedTileLabel) {
            setBoardLiveMessage('');
            return;
        }
        setBoardLiveMessage(`Focus: ${focusedTileLabel}`);
    }, [focusedTileLabel]);

    useImperativeHandle(ref, () => ({
        runShuffleAnimation: (applyShuffle: () => void) => {
            if (reduceMotion) {
                if (shuffleClearTimeoutRef.current) {
                    clearTimeout(shuffleClearTimeoutRef.current);
                    shuffleClearTimeoutRef.current = null;
                }
                setShuffleMotionDeadlineMs(0);
                setShuffleMotionBudgetMs(0);
                setShuffleStaggerTileCount(0);
                applyShuffle();
                return;
            }

            const tileCountForBudget = board.tiles.filter((t) => t.state !== 'removed').length;
            const motionBudgetMs = computeShuffleMotionBudgetMs(tileCountForBudget);

            if (shuffleClearTimeoutRef.current) {
                clearTimeout(shuffleClearTimeoutRef.current);
                shuffleClearTimeoutRef.current = null;
            }

            const deadline = performance.now() + motionBudgetMs;
            setShuffleMotionDeadlineMs(deadline);
            shuffleClearTimeoutRef.current = setTimeout(() => {
                setShuffleMotionDeadlineMs(0);
                setShuffleMotionBudgetMs(0);
                setShuffleStaggerTileCount(0);
                setShuffleAnimating(false);
                shuffleClearTimeoutRef.current = null;
            }, motionBudgetMs + 100);

            setShuffleMotionBudgetMs(motionBudgetMs);
            setShuffleStaggerTileCount(tileCountForBudget);
            setShuffleAnimating(true);

            flushSync(() => {
                applyShuffle();
            });
        }
    }), [board.tiles, reduceMotion]);

    useEffect(
        () => () => {
            if (shuffleClearTimeoutRef.current) {
                clearTimeout(shuffleClearTimeoutRef.current);
            }
        },
        []
    );
    const deviceDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    /** Cap DPR for GPU cost (PERF-001 `graphicsQuality` + compact layout). */
    const dpr = Math.min(deviceDpr, getBoardDprCap(graphicsQuality, compact));
    const bloomEffective = boardBloomEnabled && graphicsQuality !== 'low';
    const resolvedBoardAa = useMemo((): 'smaa' | 'msaa' | 'off' => {
        if (boardScreenSpaceAA === 'auto') {
            return reduceMotion ? 'msaa' : 'smaa';
        }
        return boardScreenSpaceAA;
    }, [boardScreenSpaceAA, reduceMotion]);
    /** MSAA on the default framebuffer; off when using SMAA post-pass or AA off. */
    const glAntialias = resolvedBoardAa === 'msaa';
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
        if (!cameraViewportMode && !desktopCameraMode) {
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
        desktopCameraMode,
        stageWorldViewport.height,
        stageWorldViewport.width,
        viewportState.panX,
        viewportState.panY,
        viewportState.zoom
    ]);

    const syncGestureActive = useCallback((active: boolean): void => {
        gestureActiveRef.current = active;
        setGestureActive((current) => (current === active ? current : active));
    }, [setGestureActive]);

    const syncSelectionSuppressed = useCallback((suppressed: boolean): void => {
        selectionSuppressedRef.current = suppressed;
        setSelectionSuppressed((current) => (current === suppressed ? current : suppressed));
    }, [setSelectionSuppressed]);

    const clearTouchGestureState = useCallback(
        (clearSuppression: boolean): void => {
            activeTouchPointsRef.current.clear();
            gestureSnapshotRef.current = null;
            syncGestureActive(false);
            if (clearSuppression) {
                syncSelectionSuppressed(false);
            }
        },
        [syncGestureActive, syncSelectionSuppressed]
    );

    const handleTileSelect = useCallback(
        (tileId: string): void => {
            if (selectionSuppressedRef.current) {
                return;
            }

            onTileSelect(tileId);
        },
        [onTileSelect]
    );

    const handleBoardApplicationFocus = useCallback((): void => {
        setBoardApplicationFocused(true);
        setFocusedTileId((cur) => {
            const pickable = getPickableTileIds(board, interactive, allowGambitThirdFlip);
            if (pickable.length === 0) {
                return null;
            }
            if (cur && pickable.includes(cur)) {
                return cur;
            }
            return pickable[0];
        });
    }, [board, interactive, allowGambitThirdFlip]);

    const handleBoardApplicationBlur = useCallback((event: FocusEvent<HTMLDivElement>): void => {
        const related = event.relatedTarget;
        if (related instanceof Node && boardAppRef.current?.contains(related)) {
            return;
        }
        setBoardApplicationFocused(false);
        setFocusedTileId(null);
    }, []);

    const handleBoardApplicationKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>): void => {
            if (!boardGraphicsOk || !interactive) {
                return;
            }
            const pickable = getPickableTileIds(board, interactive, allowGambitThirdFlip);
            if (pickable.length === 0) {
                return;
            }
            let dir: 'up' | 'down' | 'left' | 'right' | null = null;
            if (event.key === 'ArrowUp') dir = 'up';
            else if (event.key === 'ArrowDown') dir = 'down';
            else if (event.key === 'ArrowLeft') dir = 'left';
            else if (event.key === 'ArrowRight') dir = 'right';
            else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (focusedTileId) {
                    handleTileSelect(focusedTileId);
                }
                return;
            }
            if (dir) {
                event.preventDefault();
                const next = moveFocusInGrid(board, focusedTileId, dir, interactive, allowGambitThirdFlip);
                if (next && next !== focusedTileId) {
                    setFocusedTileId(next);
                }
            }
        },
        [allowGambitThirdFlip, board, boardGraphicsOk, focusedTileId, handleTileSelect, interactive]
    );

    const handleStageViewportChange = useCallback((nextViewport: StageWorldViewport): void => {
        setStageWorldViewport((current) =>
            Math.abs(current.width - nextViewport.width) < 0.0001 && Math.abs(current.height - nextViewport.height) < 0.0001
                ? current
                : nextViewport
        );
    }, [setStageWorldViewport]);

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

    /* eslint-disable react-hooks/set-state-in-effect -- viewport React state must track fitted board geometry when the stage or board changes */
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

        if (
            (!cameraViewportMode && !desktopCameraMode) ||
            stageWorldViewport.width <= 0 ||
            stageWorldViewport.height <= 0
        ) {
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
        desktopCameraMode,
        stageWorldViewport.height,
        stageWorldViewport.width,
        viewportResetToken,
        clearTouchGestureState
    ]);
    /* eslint-enable react-hooks/set-state-in-effect */

    useEffect(() => {
        if (!touchGestureMode) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- reset gesture UI when leaving two-finger mode
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
        stageWorldViewport.width,
        clearTouchGestureState,
        syncGestureActive,
        syncSelectionSuppressed
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
        stageWorldViewport.width,
        syncGestureActive,
        syncSelectionSuppressed
    ]);

    const showMotionChip = touchPrimary && !reduceMotion && (permission === 'prompt' || permission === 'denied');

    const sceneErrorFallback = (
        <div className={styles.webglSceneError} data-testid="tile-board-scene-error" role="alert">
            Board graphics encountered an error. Try reloading the page.
        </div>
    );

    return (
        <div
            className={`${styles.frame} ${cameraViewportMode ? styles.frameMobileCamera : ''} ${
                shuffleAnimating ? styles.frameShuffleAnimating : ''
            }`}
            data-board-columns={board.columns}
            data-board-rows={board.rows}
            data-board-run-status={runStatus}
            data-hidden-tile-count={hiddenTileCount}
            data-hidden-slots={hiddenSlotsAttr}
            data-shuffle-animating={shuffleAnimating ? 'true' : 'false'}
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
            <div className={styles.srBoardLive} aria-live="polite">
                {boardLiveMessage}
            </div>
            {!baselineWebGl ? (
                <div className={styles.webglRequired} data-testid="tile-board-webgl-required">
                    This game requires WebGL. Enable hardware acceleration or update your browser, then reload.
                </div>
            ) : gpuSurfaceLost ? (
                <div className={styles.webglSceneError} data-testid="tile-board-gpu-lost" role="status">
                    Graphics surface was lost. If this persists, reload the page or update your GPU drivers.
                </div>
            ) : (
                <div
                    aria-label="Memory tile board. Use arrow keys to move focus, Enter or Space to flip."
                    className={styles.boardCanvasApplication}
                    data-testid="tile-board-application"
                    onBlur={handleBoardApplicationBlur}
                    onFocus={handleBoardApplicationFocus}
                    onKeyDown={handleBoardApplicationKeyDown}
                    ref={boardAppRef}
                    role="application"
                    tabIndex={0}
                >
                    <div className={styles.stage} data-testid="tile-board-stage-shell" ref={stageRef}>
                        <TileBoardErrorBoundary fallback={sceneErrorFallback}>
                            <div className={styles.scene} data-testid="tile-board-stage">
                                <Canvas
                                    className={styles.canvas}
                                    dpr={dpr}
                                    key={`tile-board-aa-${resolvedBoardAa}`}
                                    gl={{
                                        alpha: true,
                                        antialias: glAntialias,
                                        powerPreference: 'high-performance',
                                        premultipliedAlpha: false
                                    }}
                                    onCreated={({ gl }) => {
                                        const canvas = gl.domElement as HTMLCanvasElement;
                                        const onLost = (event: Event): void => {
                                            event.preventDefault();
                                            setGpuSurfaceLost(true);
                                        };
                                        const onRestored = (): void => {
                                            setGpuSurfaceLost(false);
                                        };
                                        canvas.addEventListener('webglcontextlost', onLost);
                                        canvas.addEventListener('webglcontextrestored', onRestored);
                                    }}
                                    shadows={false}
                                    camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0, 10.5] }}
                                >
                                    <TileBoardScene
                                        allowGambitThirdFlip={allowGambitThirdFlip}
                                        board={board}
                                        boardViewport={renderedViewportState}
                                        compact={compact}
                                        cursedPairKey={cursedPairKey}
                                        dimmedTileIds={dimmedTileIds}
                                        focusedTileId={boardApplicationFocused ? focusedTileId : null}
                                        graphicsQuality={graphicsQuality}
                                        wardPairKey={wardPairKey}
                                        bountyPairKey={bountyPairKey}
                                        debugPeekActive={debugPeekActive}
                                        fieldTiltRef={fieldTiltRef}
                                        hoverTiltRef={hoverTiltRef}
                                        interactionSuppressed={selectionSuppressed}
                                        interactive={interactive}
                                        onTilePick={handleTileSelect}
                                        onViewportMetricsChange={handleStageViewportChange}
                                        peekRevealedTileIds={peekRevealedTileIds}
                                        pinnedTileIds={pinnedTileIds}
                                        previewActive={previewActive}
                                        ref={sceneHandleRef}
                                        reduceMotion={reduceMotion}
                                        runStatus={runStatus}
                                        shuffleMotionBudgetMs={shuffleMotionBudgetMs}
                                        shuffleMotionDeadlineMs={shuffleMotionDeadlineMs}
                                        shuffleStaggerTileCount={shuffleStaggerTileCount}
                                    />
                                    <TileBoardPostFx
                                        bloomEnabled={bloomEffective}
                                        smaaEnabled={resolvedBoardAa === 'smaa'}
                                    />
                                </Canvas>
                            </div>
                        </TileBoardErrorBoundary>
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
            )}
        </div>
    );
});

TileBoard.displayName = 'TileBoard';

export default TileBoard;

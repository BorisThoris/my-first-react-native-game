import { Canvas } from '@react-three/fiber';
import {
    Component,
    useEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type MouseEvent,
    type PointerEvent,
    type ReactNode
} from 'react';
import type { BoardState, Tile } from '../../shared/contracts';
import { useViewportSize } from '../hooks/useViewportSize';
import { usePlatformTiltField } from '../platformTilt/usePlatformTiltField';
import styles from './TileBoard.module.css';
import { getTileFieldAmplification } from './tileFieldTilt';
import TileBoardScene, { type TileHoverTiltState } from './TileBoardScene';

interface TileBoardProps {
    board: BoardState;
    debugPeekActive: boolean;
    interactive: boolean;
    previewActive: boolean;
    reduceMotion: boolean;
    frameStyle?: CSSProperties;
    onTileSelect: (tileId: string, event?: MouseEvent<HTMLButtonElement>) => void;
}

interface TileBoardFallbackProps {
    board: BoardState;
    debugPeekActive: boolean;
    interactive: boolean;
    onHoverLeave: (tileId: string, event: PointerEvent<HTMLButtonElement>) => void;
    onHoverMove: (tileId: string, event: PointerEvent<HTMLButtonElement>) => void;
    previewActive: boolean;
    onTileSelect: (tileId: string, event?: MouseEvent<HTMLButtonElement>) => void;
    tileGridStyle: CSSProperties;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const normalizeHoverPoint = (
    event: PointerEvent<HTMLButtonElement>
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

const getTileClassName = (tile: Tile, faceUp: boolean, locked: boolean): string =>
    [
        styles.fallbackTile,
        faceUp ? styles.faceUp : '',
        tile.state === 'matched' ? styles.matched : '',
        locked && tile.state === 'hidden' ? styles.locked : ''
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

const TileBoardFallback = ({
    board,
    debugPeekActive,
    interactive,
    onHoverLeave,
    onHoverMove,
    previewActive,
    onTileSelect,
    tileGridStyle
}: TileBoardFallbackProps) => {
    const locked = board.flippedTileIds.length === 2;

    return (
        <div className={styles.fallbackBoard} data-testid="tile-board-fallback" style={tileGridStyle}>
            {board.tiles.map((tile, index) => {
                const disabled = tile.state === 'matched' || !interactive || (locked && tile.state === 'hidden');
                const faceUp = tile.state !== 'hidden' || debugPeekActive || previewActive;
                const { row, column } = getTilePosition(index, board.columns);
                const labelText = tile.label.toUpperCase();
                const showFrontLabel = labelText !== tile.symbol.toUpperCase();

                const fieldAmp = getTileFieldAmplification(index, board.columns, board.rows);

                return (
                    <button
                        aria-label={getTileAriaLabel(tile, faceUp, row, column)}
                        className={getTileClassName(tile, faceUp, locked)}
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

const TileBoard = ({
    board,
    debugPeekActive,
    interactive,
    previewActive,
    reduceMotion,
    frameStyle,
    onTileSelect
}: TileBoardProps) => {
    const { height, width } = useViewportSize();
    const compact = width <= 760 || height <= 760;
    const threeEnabled = useMemo(() => canUseWebGL(), []);
    const frameRef = useRef<HTMLDivElement>(null);
    const { tiltRef: fieldTiltRef, permission, requestMotionPermission } = usePlatformTiltField({
        enabled: true,
        reduceMotion,
        surfaceRef: frameRef,
        strength: 1
    });
    const [touchPrimary, setTouchPrimary] = useState(false);
    const hoverTiltRef = useRef<TileHoverTiltState>({ tileId: null, x: 0, y: 0 });
    const mergedFrameStyle = useMemo(
        () => ({
            ...frameStyle,
            ['--board-aspect' as string]: `${board.columns} / ${board.rows}`
        }),
        [board.columns, board.rows, frameStyle]
    );
    const tileGridStyle = buildTileGridStyle(board);
    const dpr = compact ? 1 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.75);
    const handleTileSelect = (tileId: string): void => onTileSelect(tileId);
    const clearHoverTilt = (tileId: string, event: PointerEvent<HTMLButtonElement>): void => {
        if (hoverTiltRef.current.tileId === tileId) {
            hoverTiltRef.current = { tileId: null, x: 0, y: 0 };
        }

        event.currentTarget.style.setProperty('--hover-x', '0');
        event.currentTarget.style.setProperty('--hover-y', '0');
    };
    const updateHoverTilt = (tileId: string, event: PointerEvent<HTMLButtonElement>): void => {
        if (reduceMotion || event.pointerType === 'touch' || event.pointerType === 'pen') {
            clearHoverTilt(tileId, event);
            return;
        }

        const { x, y } = normalizeHoverPoint(event);
        hoverTiltRef.current = { tileId, x, y };
        event.currentTarget.style.setProperty('--hover-x', x.toFixed(4));
        event.currentTarget.style.setProperty('--hover-y', y.toFixed(4));
    };

    useEffect(() => {
        hoverTiltRef.current = { tileId: null, x: 0, y: 0 };
    }, [board.level, board.tiles.length, reduceMotion]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const mq = window.matchMedia('(pointer: coarse)');
        const sync = (): void => {
            setTouchPrimary(mq.matches);
        };

        sync();
        mq.addEventListener('change', sync);

        return () => {
            mq.removeEventListener('change', sync);
        };
    }, []);

    const showMotionChip = touchPrimary && !reduceMotion && (permission === 'prompt' || permission === 'denied');

    const fallback = (
        <TileBoardFallback
            board={board}
            debugPeekActive={debugPeekActive}
            interactive={interactive}
            onHoverLeave={clearHoverTilt}
            onHoverMove={updateHoverTilt}
            onTileSelect={handleTileSelect}
            previewActive={previewActive}
            tileGridStyle={tileGridStyle}
        />
    );

    return (
        <div className={styles.frame} ref={frameRef} style={mergedFrameStyle}>
            <div className={`${styles.stage} ${threeEnabled ? styles.stageWebglPicking : ''}`}>
                {threeEnabled ? (
                    <TileBoardErrorBoundary fallback={fallback}>
                        <div className={styles.scene} data-testid="tile-board-stage">
                                <Canvas
                                    className={styles.canvas}
                                    dpr={dpr}
                                    gl={{
                                        alpha: true,
                                        antialias: !compact,
                                        powerPreference: 'high-performance',
                                        premultipliedAlpha: false
                                    }}
                                    shadows={false}
                                    camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0, 10.5] }}
                                >
                                    <TileBoardScene
                                        board={board}
                                        compact={compact}
                                        key={board.level}
                                        debugPeekActive={debugPeekActive}
                                        fieldTiltRef={fieldTiltRef}
                                        hoverTiltRef={hoverTiltRef}
                                        interactive={interactive}
                                        onTilePick={handleTileSelect}
                                        previewActive={previewActive}
                                        reduceMotion={reduceMotion}
                                    />
                            </Canvas>
                        </div>

                        <div className={styles.interactionLayer} style={tileGridStyle}>
                            {board.tiles.map((tile, index) => {
                                const locked = board.flippedTileIds.length === 2;
                                const faceUp = tile.state !== 'hidden' || debugPeekActive || previewActive;
                                const disabled = tile.state === 'matched' || !interactive || (locked && tile.state === 'hidden');
                                const { row, column } = getTilePosition(index, board.columns);

                                return (
                                    <button
                                        aria-label={getTileAriaLabel(tile, faceUp, row, column)}
                                        className={`${styles.hitButton} ${faceUp ? styles.hitButtonFaceUp : ''} ${
                                            tile.state === 'matched' ? styles.hitButtonMatched : ''
                                        }`}
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
};

export default TileBoard;

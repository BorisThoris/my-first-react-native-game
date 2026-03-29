import { Canvas } from '@react-three/fiber';
import { Component, useMemo, type CSSProperties, type ReactNode } from 'react';
import type { BoardState, Tile } from '../../shared/contracts';
import { useViewportSize } from '../hooks/useViewportSize';
import styles from './TileBoard.module.css';
import TileBoardScene from './TileBoardScene';

interface TileBoardProps {
    board: BoardState;
    debugPeekActive: boolean;
    interactive: boolean;
    previewActive: boolean;
    reduceMotion: boolean;
    frameStyle?: CSSProperties;
    onTileSelect: (tileId: string) => void;
}

interface TileBoardFallbackProps {
    board: BoardState;
    debugPeekActive: boolean;
    interactive: boolean;
    previewActive: boolean;
    onTileSelect: (tileId: string) => void;
    tileGridStyle: CSSProperties;
}

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
        styles.legacyTile,
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

const TileBoardFallback = ({ board, debugPeekActive, interactive, previewActive, onTileSelect, tileGridStyle }: TileBoardFallbackProps) => {
    const locked = board.flippedTileIds.length === 2;

    return (
        <div className={styles.legacyBoard} style={tileGridStyle}>
            {board.tiles.map((tile) => {
                const disabled = tile.state === 'matched' || !interactive || (locked && tile.state === 'hidden');
                const faceUp = tile.state !== 'hidden' || debugPeekActive || previewActive;

                return (
                    <button
                        aria-label={faceUp ? `Tile ${tile.label}` : 'Hidden tile'}
                        className={getTileClassName(tile, faceUp, locked)}
                        disabled={disabled}
                        key={tile.id}
                        onClick={() => onTileSelect(tile.id)}
                        tabIndex={-1}
                        type="button"
                    >
                        <span className={styles.legacyInner}>
                            <span className={styles.tileGlow} />
                            <span className={styles.symbol}>{faceUp ? tile.symbol : '?'}</span>
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

const TileBoard = ({ board, debugPeekActive, interactive, previewActive, reduceMotion, frameStyle, onTileSelect }: TileBoardProps) => {
    const { height, width } = useViewportSize();
    const compact = width <= 760 || height <= 760;
    const threeEnabled = useMemo(() => canUseWebGL(), []);
    const mergedFrameStyle = useMemo(
        () => ({
            ...frameStyle,
            ['--board-aspect' as string]: `${board.columns} / ${board.rows}`
        }),
        [board.columns, board.rows, frameStyle]
    );
    const tileGridStyle = buildTileGridStyle(board);
    const dpr = compact ? 1 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.75);

    const fallback = (
        <TileBoardFallback
            board={board}
            debugPeekActive={debugPeekActive}
            interactive={interactive}
            onTileSelect={onTileSelect}
            previewActive={previewActive}
            tileGridStyle={tileGridStyle}
        />
    );

    return (
        <div className={styles.frame} style={mergedFrameStyle}>
            <div className={styles.stage}>
                {threeEnabled ? (
                    <TileBoardErrorBoundary fallback={fallback}>
                        <div className={styles.scene}>
                                <Canvas
                                    className={styles.canvas}
                                    dpr={dpr}
                                    gl={{
                                        antialias: !compact,
                                        alpha: true,
                                        powerPreference: 'high-performance'
                                    }}
                                shadows={!compact && !reduceMotion}
                                    camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0, 10.5] }}
                                >
                                <TileBoardScene
                                    board={board}
                                    compact={compact}
                                    debugPeekActive={debugPeekActive}
                                    previewActive={previewActive}
                                    reduceMotion={reduceMotion}
                                />
                            </Canvas>
                        </div>

                        <div className={styles.interactionLayer} style={tileGridStyle}>
                            {board.tiles.map((tile) => {
                                const locked = board.flippedTileIds.length === 2;
                                const faceUp = tile.state !== 'hidden' || debugPeekActive || previewActive;
                                const disabled = tile.state === 'matched' || !interactive || (locked && tile.state === 'hidden');

                                return (
                                    <button
                                        aria-label={faceUp ? `Tile ${tile.label}` : 'Hidden tile'}
                                        className={styles.hitButton}
                                        disabled={disabled}
                                        key={tile.id}
                                        onClick={() => onTileSelect(tile.id)}
                                        tabIndex={-1}
                                        type="button"
                                    />
                                );
                            })}
                        </div>
                    </TileBoardErrorBoundary>
                ) : (
                    fallback
                )}
            </div>
        </div>
    );
};

export default TileBoard;

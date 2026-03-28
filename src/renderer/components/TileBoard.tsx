import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import type { BoardState, Tile } from '../../shared/contracts';
import styles from './TileBoard.module.css';

interface TileBoardProps {
    board: BoardState;
    debugPeekActive: boolean;
    interactive: boolean;
    previewActive: boolean;
    frameStyle?: CSSProperties;
    onTileSelect: (tileId: string) => void;
}

const getTileClassName = (tile: Tile, faceUp: boolean, locked: boolean): string =>
    [
        styles.tile,
        faceUp ? styles.faceUp : '',
        tile.state === 'matched' ? styles.matched : '',
        locked && tile.state === 'hidden' ? styles.locked : ''
    ]
        .filter(Boolean)
        .join(' ');

const TileBoard = ({ board, debugPeekActive, interactive, previewActive, frameStyle, onTileSelect }: TileBoardProps) => {
    const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const locked = board.flippedTileIds.length === 2;

    const disabledIndexes = useMemo(
        () =>
            new Set(
                board.tiles.flatMap((tile, index) =>
                    tile.state === 'matched' || !interactive || (locked && tile.state === 'hidden') ? [index] : []
                )
            ),
        [board.tiles, interactive, locked]
    );
    const firstEnabledIndex = useMemo(
        () => board.tiles.findIndex((_tile, index) => !disabledIndexes.has(index)),
        [board.tiles, disabledIndexes]
    );
    const activeIndex = disabledIndexes.has(focusedIndex) && firstEnabledIndex >= 0 ? firstEnabledIndex : focusedIndex;

    useEffect(() => {
        if (!interactive || disabledIndexes.has(activeIndex)) {
            return;
        }

        tileRefs.current[activeIndex]?.focus();
    }, [activeIndex, disabledIndexes, interactive]);

    const moveFocus = (startIndex: number, rowDelta: number, columnDelta: number): void => {
        let nextIndex = startIndex;

        while (true) {
            const currentRow = Math.floor(nextIndex / board.columns);
            const currentColumn = nextIndex % board.columns;
            const targetRow = currentRow + rowDelta;
            const targetColumn = currentColumn + columnDelta;

            if (
                targetRow < 0 ||
                targetColumn < 0 ||
                targetColumn >= board.columns ||
                targetRow >= Math.ceil(board.tiles.length / board.columns)
            ) {
                return;
            }

            nextIndex = targetRow * board.columns + targetColumn;

            if (nextIndex >= board.tiles.length) {
                return;
            }

            if (!disabledIndexes.has(nextIndex)) {
                setFocusedIndex(nextIndex);
                return;
            }
        }
    };

    return (
        <div className={styles.frame} style={frameStyle}>
            <div className={styles.board} style={{ gridTemplateColumns: `repeat(${board.columns}, minmax(0, 1fr))` }}>
                {board.tiles.map((tile, index) => {
                    const disabled = disabledIndexes.has(index);
                    const faceUp = tile.state !== 'hidden' || debugPeekActive || previewActive;

                    return (
                        <button
                            aria-label={faceUp ? `Tile ${tile.label}` : 'Hidden tile'}
                            className={getTileClassName(tile, faceUp, locked)}
                            disabled={disabled}
                            key={tile.id}
                            onClick={() => onTileSelect(tile.id)}
                            onFocus={() => setFocusedIndex(index)}
                            onKeyDown={(event) => {
                                switch (event.key) {
                                    case 'ArrowUp':
                                        event.preventDefault();
                                        moveFocus(index, -1, 0);
                                        break;
                                    case 'ArrowDown':
                                        event.preventDefault();
                                        moveFocus(index, 1, 0);
                                        break;
                                    case 'ArrowLeft':
                                        event.preventDefault();
                                        moveFocus(index, 0, -1);
                                        break;
                                    case 'ArrowRight':
                                        event.preventDefault();
                                        moveFocus(index, 0, 1);
                                        break;
                                    case 'Enter':
                                    case ' ':
                                        if (!disabled) {
                                            event.preventDefault();
                                            onTileSelect(tile.id);
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            }}
                            ref={(element) => {
                                tileRefs.current[index] = element;
                            }}
                            tabIndex={interactive && !disabled && activeIndex === index ? 0 : -1}
                            type="button"
                        >
                            <span className={styles.inner}>
                                <span className={styles.tileGlow} />
                                <span className={styles.symbol}>{faceUp ? tile.symbol : '?'}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TileBoard;

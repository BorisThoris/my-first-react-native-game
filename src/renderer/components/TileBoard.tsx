import type { BoardState, Tile } from '../../shared/contracts';
import styles from './TileBoard.module.css';

interface TileBoardProps {
    board: BoardState;
    debugPeekActive: boolean;
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

const TileBoard = ({ board, debugPeekActive, onTileSelect }: TileBoardProps) => {
    const locked = board.flippedTileIds.length === 2;

    return (
        <div className={styles.frame}>
            <div className={styles.board} style={{ gridTemplateColumns: `repeat(${board.columns}, minmax(0, 1fr))` }}>
                {board.tiles.map((tile) => {
                    const faceUp = tile.state !== 'hidden' || debugPeekActive;

                    return (
                        <button
                            aria-label={faceUp ? `Tile ${tile.symbol}` : 'Hidden tile'}
                            className={getTileClassName(tile, faceUp, locked)}
                            disabled={tile.state === 'matched' || (locked && tile.state === 'hidden')}
                            key={tile.id}
                            onClick={() => onTileSelect(tile.id)}
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

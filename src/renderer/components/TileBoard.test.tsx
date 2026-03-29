import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { BoardState } from '../../shared/contracts';
import TileBoard from './TileBoard';

const board: BoardState = {
    level: 1,
    pairCount: 2,
    columns: 2,
    rows: 2,
    matchedPairs: 0,
    flippedTileIds: [],
    tiles: [
        { id: 'a1', pairKey: 'A', symbol: 'A', label: 'A', state: 'hidden' },
        { id: 'a2', pairKey: 'A', symbol: 'A', label: 'A', state: 'hidden' },
        { id: 'b1', pairKey: 'B', symbol: 'B', label: 'B', state: 'hidden' },
        { id: 'b2', pairKey: 'B', symbol: 'B', label: 'B', state: 'hidden' }
    ]
};

describe('TileBoard touch and click controls', () => {
    it('flips a tile when clicked', () => {
        const onTileSelect = vi.fn();

        render(
            <TileBoard
                board={board}
                debugPeekActive={false}
                interactive={true}
                onTileSelect={onTileSelect}
                previewActive={false}
                reduceMotion={false}
            />
        );

        const hiddenTiles = screen.getAllByRole('button', { name: /hidden tile/i });
        fireEvent.click(hiddenTiles[1]);

        expect(onTileSelect).toHaveBeenCalledWith('a2');
    });

    it('reveals the board during the memorize preview', () => {
        render(
            <TileBoard
                board={board}
                debugPeekActive={false}
                interactive={true}
                onTileSelect={vi.fn()}
                previewActive={true}
                reduceMotion={false}
            />
        );

        expect(screen.getAllByRole('button', { name: /tile/i })).toHaveLength(4);
    });

    it('falls back to the DOM board when WebGL support is unavailable', () => {
        const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);
        try {
            render(
                <TileBoard
                    board={board}
                    debugPeekActive={false}
                    interactive={true}
                    onTileSelect={vi.fn()}
                    previewActive={false}
                    reduceMotion={false}
                />
            );

            expect(screen.getAllByRole('button', { name: /hidden tile/i })).toHaveLength(4);
        } finally {
            getContext.mockRestore();
        }
    });
});

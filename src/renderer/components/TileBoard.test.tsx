import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

describe('TileBoard keyboard controls', () => {
    it('moves focus with arrow keys and flips with Enter', async () => {
        const onTileSelect = vi.fn();

        render(
            <TileBoard
                board={board}
                debugPeekActive={false}
                interactive={true}
                onTileSelect={onTileSelect}
                previewActive={false}
            />
        );

        const hiddenTiles = screen.getAllByRole('button', { name: /hidden tile/i });

        await waitFor(() => {
            expect(hiddenTiles[0]).toHaveFocus();
        });

        fireEvent.keyDown(hiddenTiles[0], { key: 'ArrowRight' });

        await waitFor(() => {
            expect(hiddenTiles[1]).toHaveFocus();
        });

        fireEvent.keyDown(hiddenTiles[1], { key: 'Enter' });

        expect(onTileSelect).toHaveBeenCalledWith('a2');
    });
});

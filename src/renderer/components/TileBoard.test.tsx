import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BoardState } from '../../shared/contracts';
import { PlatformTiltProvider } from '../platformTilt/PlatformTiltProvider';
import TileBoard from './TileBoard';

const renderBoard = (props: {
    board: BoardState;
    debugPeekActive: boolean;
    interactive: boolean;
    onTileSelect: (id: string) => void;
    previewActive: boolean;
    reduceMotion: boolean;
}): ReturnType<typeof render> =>
    render(
        <PlatformTiltProvider>
            <TileBoard {...props} />
        </PlatformTiltProvider>
    );

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
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('flips a tile when clicked on the DOM fallback board', () => {
        const onTileSelect = vi.fn();
        const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);

        try {
            renderBoard({
                board,
                debugPeekActive: false,
                interactive: true,
                onTileSelect,
                previewActive: false,
                reduceMotion: false
            });

            const hiddenTiles = screen.getAllByRole('button', { name: /hidden tile/i });
            fireEvent.click(hiddenTiles[1]);

            expect(onTileSelect).toHaveBeenCalledWith('a2');
        } finally {
            getContext.mockRestore();
        }
    });

    it('reveals the board during the memorize preview', () => {
        renderBoard({
            board,
            debugPeekActive: false,
            interactive: true,
            onTileSelect: vi.fn(),
            previewActive: true,
            reduceMotion: false
        });

        expect(screen.getAllByRole('button', { name: /tile/i })).toHaveLength(4);
    });

    it('falls back to the DOM board when WebGL support is unavailable', () => {
        const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);
        try {
            renderBoard({
                board,
                debugPeekActive: false,
                interactive: true,
                onTileSelect: vi.fn(),
                previewActive: false,
                reduceMotion: false
            });

            expect(screen.getAllByRole('button', { name: /hidden tile/i })).toHaveLength(4);
        } finally {
            getContext.mockRestore();
        }
    });

    it('writes nonzero field tilt CSS on the frame after viewport pointer move', async () => {
        const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);

        try {
            const { container } = renderBoard({
                board,
                debugPeekActive: false,
                interactive: true,
                onTileSelect: vi.fn(),
                previewActive: false,
                reduceMotion: false
            });

            const frame = container.firstElementChild as HTMLElement;

            fireEvent.pointerMove(window, {
                clientX: Math.round(window.innerWidth * 0.84),
                clientY: Math.round(window.innerHeight * 0.22),
                pointerType: 'mouse'
            });

            await waitFor(() => {
                const tx = frame.style.getPropertyValue('--tilt-x').trim();

                expect(tx).not.toBe('');
                expect(Math.abs(Number.parseFloat(tx))).toBeGreaterThan(0.01);
            });
        } finally {
            getContext.mockRestore();
        }
    });

    it('does not set field tilt CSS when reduced motion is enabled', async () => {
        const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null);

        try {
            const { container } = renderBoard({
                board,
                debugPeekActive: false,
                interactive: true,
                onTileSelect: vi.fn(),
                previewActive: false,
                reduceMotion: true
            });

            const frame = container.firstElementChild as HTMLElement;

            fireEvent.pointerMove(window, {
                clientX: Math.round(window.innerWidth * 0.84),
                clientY: Math.round(window.innerHeight * 0.22),
                pointerType: 'mouse'
            });

            await new Promise((r) => {
                setTimeout(r, 30);
            });

            expect(frame.style.getPropertyValue('--tilt-x')).toBe('');
        } finally {
            getContext.mockRestore();
        }
    });
});

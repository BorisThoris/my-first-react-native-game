import { describe, expect, it } from 'vitest';
import {
    MOBILE_CAMERA_MAX_ZOOM,
    MOBILE_CAMERA_MIN_ZOOM,
    clampBoardViewport,
    createFittedBoardViewport,
    getBoardFitZoom,
    screenPointToWorld
} from './tileBoardViewport';

describe('tile board viewport math', () => {
    it('computes the fit baseline from board and viewport dimensions', () => {
        const fitZoom = getBoardFitZoom({
            boardHeight: 5,
            boardWidth: 8,
            margin: 0.9,
            viewportHeight: 6,
            viewportWidth: 10
        });

        expect(fitZoom).toBeCloseTo(1.08);
    });

    it('clamps zoom and pan to the reachable board bounds', () => {
        const clamped = clampBoardViewport({
            boardHeight: 6,
            boardWidth: 8,
            fitZoom: 1,
            panX: 99,
            panY: -99,
            viewportHeight: 4,
            viewportWidth: 4,
            zoom: MOBILE_CAMERA_MAX_ZOOM + 1
        });

        expect(clamped.zoom).toBe(MOBILE_CAMERA_MAX_ZOOM);
        expect(clamped.panX).toBeCloseTo(9.2);
        expect(clamped.panY).toBeCloseTo(-6.4);
    });

    it('resets to the centered fit view', () => {
        expect(createFittedBoardViewport(1.34)).toEqual({
            fitZoom: 1.34,
            panX: 0,
            panY: 0,
            zoom: MOBILE_CAMERA_MIN_ZOOM
        });
    });

    it('maps screen coordinates to board world coordinates', () => {
        const point = screenPointToWorld(
            { clientX: 150, clientY: 50 },
            { height: 100, left: 0, top: 0, width: 200 },
            8,
            4
        );

        expect(point.panX).toBeCloseTo(2);
        expect(point.panY).toBeCloseTo(0);
    });
});

import { useCallback, useMemo } from 'react';
import { TILE_RESET_DELAY } from '../gameUtils';

export const useProcessTiles = ({ dispatch, gameState, incrementTries, triggerShakeEffect }) => {
    // Destructure gameState properties
    const { cheated, flippedTiles, matchedTiles, tiles } = gameState;

    // Reset flipped tiles after a delay
    const resetFlippedTiles = useCallback(() => {
        dispatch({ type: 'RESET_FLIPPED_TILES' });
    }, [dispatch]);

    // Handle tile matching logic
    const processTileMatch = useCallback(
        (isMatch, firstIndex, secondIndex) => {
            if (isMatch) {
                dispatch({ payload: [firstIndex, secondIndex], type: 'MATCH_TILES' });
            } else {
                incrementTries();
                dispatch({ type: 'MISMATCH_TILES' });
                triggerShakeEffect();
            }

            resetFlippedTiles();
        },
        [dispatch, incrementTries, triggerShakeEffect, resetFlippedTiles]
    );

    // Evaluate whether the flipped tiles are a match
    const evaluateFlippedTiles = useCallback(() => {
        const [firstFlippedIndex, secondFlippedIndex] = flippedTiles;
        const firstTileId = tiles[firstFlippedIndex]?.id;
        const secondTileId = tiles[secondFlippedIndex]?.id;

        // Determine if the two flipped tiles are a match
        const isMatch = firstTileId === secondTileId;
        processTileMatch(isMatch, firstFlippedIndex, secondFlippedIndex);
    }, [flippedTiles, tiles, processTileMatch]);

    // Check if the tile can be flipped
    const isTileFlippable = useCallback(
        (index) => {
            const lessThanTwoFlippedTiles = flippedTiles.length < 2;
            const isNotFlippedAlready = !flippedTiles.includes(index);
            const isNotAlreadyMatched = !matchedTiles.includes(index);

            // Tile is flippable if there are fewer than two flipped, and it's neither flipped nor matched
            return lessThanTwoFlippedTiles && isNotFlippedAlready && isNotAlreadyMatched;
        },
        [flippedTiles, matchedTiles]
    );

    // Handle tile flipping
    const handleFlip = useCallback(
        (index) => {
            const canFlipTile = isTileFlippable(index) && !cheated;

            if (canFlipTile) {
                dispatch({ payload: index, type: 'FLIP_TILE' });
            }
        },
        [cheated, isTileFlippable, dispatch]
    );

    return useMemo(() => {
        return { evaluateFlippedTiles, handleFlip };
    }, [evaluateFlippedTiles, handleFlip]);
};

export default useProcessTiles;

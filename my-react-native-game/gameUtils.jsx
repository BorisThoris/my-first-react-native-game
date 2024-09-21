import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const TILE_MARGIN = 5;
export const MAX_TILE_SIZE = 100;
export const SCREEN_PADDING = 20;
export const INITIAL_LIVES = 5;
export const TILE_RESET_DELAY = 1000;

/**
 * Generates a random emoji, number, or letter to use as a tile shape.
 * Can be used when we run out of predefined shapes.
 *
 * @returns {string} - A randomly generated shape.
 */
const generateRandomShape = () => {
    const emojis = ['🔴', '🔷', '🔺', '⭐', '⚪', '⬛', '🔶', '⬜', '💎', '🍀', '🔥', '🌊'];
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    // Randomly pick an emoji, letter, or number
    const randomType = Math.floor(Math.random() * 3); // 0 = emoji, 1 = letter, 2 = number
    switch (randomType) {
        case 0: // Pick an emoji
            return emojis[Math.floor(Math.random() * emojis.length)];
        case 1: // Pick a letter
            return letters[Math.floor(Math.random() * letters.length)];
        case 2: // Pick a number
            return numbers[Math.floor(Math.random() * numbers.length)];
        default:
            return '?'; // Fallback, though this should never occur
    }
};

/**
 * Initializes an array of tiles based on the total number of pairs.
 * Each pair will have the same shape.
 * If we run out of predefined shapes, it generates new shapes dynamically.
 *
 * @param {number} totalPairs - The total number of pairs in the game.
 * @returns {Array} - An array of tiles with matching pairs.
 */
export const initializeTiles = (totalPairs) => {
    const predefinedShapes = ['🔴', '🔷', '🔺', '⭐', '⚪', '⬛', '🔶', '⬜', '💎', '🍀', '🔥', '🌊'];

    return Array.from({ length: totalPairs }, (_, i) => {
        // Use predefined shapes or generate a random one if we're out of predefined shapes
        const shape = predefinedShapes[i] || generateRandomShape();
        return [
            { id: i * 2, shape }, // First tile of the pair
            { id: i * 2, shape } // Second tile of the pair
        ];
    }).flat();
};

/**
 * Shuffles the array of tiles.
 *
 * @param {Array} tiles - The array of tiles to shuffle.
 * @returns {Array} - The shuffled array of tiles.
 */
export const shuffleTiles = (tiles) => {
    return tiles
        .map((tile) => ({ ...tile, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map((tile) => ({ id: tile.id, shape: tile.shape }));
};

/**
 * Calculates the tile size based on the grid size and screen width.
 *
 * @param {number} gridSize - The number of tiles per row/column.
 * @returns {number} - The calculated tile size.
 */
export const getTileSize = (gridSize) => {
    return Math.min((SCREEN_WIDTH - SCREEN_PADDING) / gridSize - TILE_MARGIN * 2, MAX_TILE_SIZE);
};

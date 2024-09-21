export const initialGameState = {
    cheated: false,
    flippedTiles: [],
    level: 1,
    lives: 5,
    matchedTiles: [],
    tiles: []
};

export const gameReducer = (state, action) => {
    switch (action.type) {
        case 'SET_TILES':
            return {
                ...state,
                tiles: action.payload
            };
        case 'FLIP_TILE':
            return {
                ...state,
                flippedTiles: [...state.flippedTiles, action.payload]
            };
        case 'MATCH_TILES':
            return {
                ...state,
                lives: state.lives < 5 ? state.lives + 1 : state.lives,
                matchedTiles: [...state.matchedTiles, ...action.payload]
            };
        case 'MISMATCH_TILES':
            return {
                ...state,
                lives: state.lives - 1
            };
        case 'RESET_FLIPPED_TILES':
            return {
                ...state,
                flippedTiles: []
            };
        case 'START_NEW_LEVEL':
            return {
                ...state,
                cheated: false,
                flippedTiles: [],
                level: state.level + 1,
                matchedTiles: [],
                tiles: action.payload.tiles
            };
        case 'RESET_GAME':
            return {
                ...initialGameState,
                level: 1,
                lives: 5
            };
        case 'TOGGLE_CHEAT':
            return {
                ...state,
                cheated: !state.cheated,
                flippedTiles: !state.cheated ? state.tiles.map((_, i) => i) : state.matchedTiles
            };
        case 'START_GAME':
            return {
                ...initialGameState,
                level: 2,
                tiles: action.payload.tiles
            };
        default:
            return state;
    }
};

export default gameReducer;

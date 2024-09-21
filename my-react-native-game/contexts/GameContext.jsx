import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { getTileSize, initializeTiles, shuffleTiles } from '../gameUtils';
import { useModal } from '../hooks/useModal';
import { useProcessTiles } from '../hooks/useProcessTiles';
import { useScore } from '../hooks/useScore';
import { useVisualEffects } from '../hooks/useVisualEffects';
import gameReducer, { initialGameState } from '../reducers/gameReducer';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
    const [userName, setUserName] = useState(false);
    const prevLevel = useRef(gameState.level);
    const [hasStarted, setHasStarter] = useState(false);

    // Custom hooks
    const { shakeAnim, triggerShakeEffect } = useVisualEffects();
    const { completeLevel, currentLevelScore, incrementTries, rating, resetScores, resetTries, totalScore } = useScore(
        gameState.level
    );
    const { hideModal, modalMessage, modalVisible, showModal } = useModal();

    const { evaluateFlippedTiles, handleFlip } = useProcessTiles({
        dispatch,
        gameState,
        incrementTries,
        triggerShakeEffect
    });

    // Derived values
    const generateLevel = useCallback((lvl) => {
        const basePairs = 1;
        const additionalPairs = lvl;
        const gridSize = (basePairs + additionalPairs) * 2;

        return {
            gridSize,
            totalPairs: basePairs + additionalPairs
        };
    }, []);

    const currentLevel = useMemo(() => generateLevel(gameState.level), [generateLevel, gameState.level]);
    const TILE_SIZE = getTileSize(currentLevel.gridSize || 0);

    // Game handlers
    const handleCheat = useCallback(() => {
        dispatch({ type: 'TOGGLE_CHEAT' });
    }, []);

    const resetGameState = useCallback(() => {
        dispatch({ type: 'RESET_GAME' });
    }, []);

    const startNewLevel = useCallback(() => {
        const newLevel = generateLevel(gameState.level);

        completeLevel();
        dispatch({
            payload: { tiles: shuffleTiles(initializeTiles(newLevel.totalPairs)) },
            type: 'START_NEW_LEVEL'
        });
    }, [generateLevel, gameState.level, completeLevel]);

    const onHideModal = useCallback(() => {
        hideModal();

        startNewLevel();
    }, [hideModal, startNewLevel]);

    // Effect hooks
    useEffect(() => {
        if (prevLevel.current !== gameState.level) {
            resetTries();
            prevLevel.current = gameState.level;
        }
    }, [gameState.level, resetTries]);

    useEffect(() => {
        if (gameState.flippedTiles.length === 2) evaluateFlippedTiles();
    }, [evaluateFlippedTiles, gameState.flippedTiles]);

    useEffect(() => {
        if (!hasStarted) {
            const newLevel = generateLevel(gameState.level);

            dispatch({
                payload: {
                    tiles: shuffleTiles(initializeTiles(newLevel.totalPairs)) // Initialize tiles for the first level
                },
                type: 'START_GAME'
            });

            setHasStarter(true); // Set the game as started
        }
    }, [gameState.tiles.length, hasStarted, generateLevel, dispatch, gameState.level]);

    useEffect(() => {
        if (gameState.lives === 0) {
            showModal('Game Over', `You've run out of lives! Total score: ${totalScore}.`);
            resetScores();
            resetGameState();
        }
    }, [gameState.lives, resetGameState, resetScores, showModal, startNewLevel, totalScore]);

    useEffect(() => {
        if (gameState.matchedTiles.length === gameState.tiles.length && gameState.tiles.length > 0 && !modalVisible) {
            showModal('Success', `You've completed the level! Score for this level: ${currentLevelScore}`);
        }
    }, [gameState.matchedTiles, gameState.tiles.length, modalVisible, showModal, currentLevelScore]);

    // Memoized context value
    const contextValue = useMemo(
        () => ({
            cheated: gameState.cheated,
            currentLevelScore,
            flippedTiles: gameState.flippedTiles,
            handleCheat,
            handleFlip,
            hideModal: onHideModal,
            lives: gameState.lives,
            matchedTiles: gameState.matchedTiles,
            modalMessage,
            modalVisible,
            rating,
            setUserName,
            shakeAnim,
            TILE_SIZE,
            tiles: gameState.tiles,
            totalScore,
            userName
        }),
        [
            gameState.cheated,
            gameState.flippedTiles,
            gameState.matchedTiles,
            gameState.tiles,
            gameState.lives,
            currentLevelScore,
            handleCheat,
            handleFlip,
            onHideModal,
            modalMessage,
            modalVisible,
            rating,
            shakeAnim,
            TILE_SIZE,
            totalScore,
            userName
        ]
    );

    return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGameContext = () => useContext(GameContext);

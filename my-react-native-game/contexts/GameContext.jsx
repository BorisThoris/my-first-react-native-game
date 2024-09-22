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
    const { cheated, flippedTiles, level, lives, matchedTiles, tiles } = gameState; // Destructure gameState
    const [userName, setUserName] = useState(false);
    const prevLevel = useRef(level);
    const [hasStarted, setHasStarter] = useState(false);

    // Custom hooks
    const { shakeAnim, triggerShakeEffect } = useVisualEffects();
    const { completeLevel, currentLevelScore, incrementTries, rating, resetScores, resetTries, totalScore } =
        useScore(level);
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

    const currentLevel = useMemo(() => generateLevel(level), [generateLevel, level]);
    const TILE_SIZE = getTileSize(currentLevel.gridSize || 0);

    // Game handlers
    const handleCheat = useCallback(() => {
        dispatch({ type: 'TOGGLE_CHEAT' });
    }, []);

    const resetGameState = useCallback(() => {
        dispatch({ type: 'RESET_GAME' });
    }, []);

    const startNewLevel = useCallback(() => {
        const newLevel = generateLevel(level);

        completeLevel();
        dispatch({
            payload: { tiles: shuffleTiles(initializeTiles(newLevel.totalPairs)) },
            type: 'START_NEW_LEVEL'
        });
    }, [generateLevel, level, completeLevel]);

    const onHideModal = useCallback(() => {
        hideModal();

        startNewLevel();
    }, [hideModal, startNewLevel]);

    // Effect hooks
    useEffect(() => {
        if (prevLevel.current !== level) {
            resetTries();
            prevLevel.current = level;
        }
    }, [level, resetTries]);

    useEffect(() => {
        if (flippedTiles.length === 2) evaluateFlippedTiles();
    }, [evaluateFlippedTiles, flippedTiles]);

    useEffect(() => {
        if (!hasStarted) {
            const newLevel = generateLevel(level);

            dispatch({
                payload: {
                    tiles: shuffleTiles(initializeTiles(newLevel.totalPairs))
                },
                type: 'START_GAME'
            });

            setHasStarter(true);
        }
    }, [tiles.length, hasStarted, generateLevel, dispatch, level]);

    useEffect(() => {
        if (lives === 0) {
            showModal('Game Over', `You've run out of lives! Total score: ${totalScore}.`);
            resetScores();
            resetGameState();
        }
    }, [lives, resetGameState, resetScores, showModal, startNewLevel, totalScore]);

    useEffect(() => {
        if (matchedTiles.length === tiles.length && tiles.length > 0 && !modalVisible && !cheated) {
            showModal('Success', `You've completed the level! Score for this level: ${currentLevelScore}`);
        }
    }, [matchedTiles, tiles.length, modalVisible, showModal, currentLevelScore, cheated]);

    // Memoized context value
    const contextValue = useMemo(
        () => ({
            cheated,
            currentLevelScore,
            flippedTiles,
            handleCheat,
            handleFlip,
            hideModal: onHideModal,
            lives,
            matchedTiles,
            modalMessage,
            modalVisible,
            rating,
            setUserName,
            shakeAnim,
            TILE_SIZE,
            tiles,
            totalScore,
            userName
        }),
        [
            cheated,
            flippedTiles,
            matchedTiles,
            tiles,
            lives,
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

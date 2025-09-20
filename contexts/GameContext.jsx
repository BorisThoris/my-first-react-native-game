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
  const [hasStarted, setHasStarted] = useState(false);

  // Custom hooks
  const { shakeAnim, triggerShakeEffect } = useVisualEffects();
  const { completeLevel, currentLevelScore, incrementTries, rating, resetScores, resetTries, totalScore } =
    useScore(level);
  const { hideModal, modalMessage, modalVisible, showModal } = useModal();

  const { evaluateFlippedTiles, handleFlip } = useProcessTiles({
    dispatch,
    gameState,
    incrementTries,
    triggerShakeEffect,
  });

  // Derived values
  const generateLevel = useCallback((lvl) => {
    const basePairs = 1;
    const additionalPairs = lvl;
    const gridSize = (basePairs + additionalPairs) * 2;

    return {
      gridSize,
      totalPairs: basePairs + additionalPairs,
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
    const nextLevel = level + 1;
    const newLevel = generateLevel(nextLevel);

    completeLevel();
    dispatch({
      payload: { tiles: shuffleTiles(initializeTiles(newLevel.totalPairs)) },
      type: 'START_NEW_LEVEL',
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
    if (!hasStarted && tiles.length === 0) {
      const newLevel = generateLevel(1); // Start with level 1

      dispatch({
        payload: {
          tiles: shuffleTiles(initializeTiles(newLevel.totalPairs)),
        },
        type: 'START_GAME',
      });

      setHasStarted(true);
    }
  }, [hasStarted, generateLevel, dispatch, tiles.length]);

  useEffect(() => {
    if (lives === 0 && hasStarted) {
      showModal('Game Over', `You've run out of lives! Total score: ${totalScore}.`);
      resetScores();
      resetGameState();
      setHasStarted(false);
    }
  }, [lives, resetGameState, resetScores, showModal, totalScore, hasStarted]);

  useEffect(() => {
    if (
      matchedTiles.length === tiles.length &&
      tiles.length > 0 &&
      !modalVisible &&
      !cheated &&
      hasStarted &&
      flippedTiles.length === 0
    ) {
      showModal('Success', `You've completed the level! Score for this level: ${currentLevelScore}`);
    }
  }, [
    matchedTiles,
    tiles.length,
    modalVisible,
    showModal,
    currentLevelScore,
    cheated,
    hasStarted,
    flippedTiles.length,
  ]);

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
      userName,
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
      userName,
    ]
  );

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

export const useGameContext = () => useContext(GameContext);

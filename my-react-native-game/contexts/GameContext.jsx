import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';

const GameContext = createContext();

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_MARGIN = 5;
const MAX_TILE_SIZE = 100;
const SCREEN_PADDING = 20;
const INITIAL_LIVES = 5;

const levels = [
    { gridSize: 2, totalPairs: 2 },
    { gridSize: 3, totalPairs: 4 },
    { gridSize: 4, totalPairs: 8 },
    { gridSize: 5, totalPairs: 12 }
];

export const GameProvider = ({ children }) => {
    const [level, setLevel] = useState(1);
    const [tiles, setTiles] = useState([]);
    const [flippedTiles, setFlippedTiles] = useState([]);
    const [matchedTiles, setMatchedTiles] = useState([]);
    const [lives, setLives] = useState(INITIAL_LIVES);
    const [cheated, setCheated] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const titleScale = useRef(new Animated.Value(1)).current;
    const cheatButtonScale = useRef(new Animated.Value(1)).current;
    const tileScale = useRef([]).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    // Dynamically calculate TILE_SIZE based on grid size and screen width
    const TILE_SIZE = Math.min(
        (SCREEN_WIDTH - SCREEN_PADDING) / levels[level - 1].gridSize - TILE_MARGIN * 2,
        MAX_TILE_SIZE
    );

    useEffect(() => {
        startNewLevel();
        animateElement(titleScale);
    }, [level]);

    const startNewLevel = () => {
        setTiles(shuffleTiles(initializeTiles(levels[level - 1].totalPairs)));
        resetGameState();
        animateTiles();
    };

    const resetGameState = () => {
        setFlippedTiles([]);
        setMatchedTiles([]);
        setLives(INITIAL_LIVES);
        setCheated(false);
    };

    const handleFlip = (index) => {
        if (!cheated && isTileFlippable(index)) {
            setFlippedTiles((prevFlipped) => [...prevFlipped, index]);
        }
    };

    const isTileFlippable = (index) => {
        return flippedTiles.length < 2 && !flippedTiles.includes(index) && !matchedTiles.includes(index);
    };

    useEffect(() => {
        if (flippedTiles.length === 2) evaluateFlippedTiles();
    }, [flippedTiles]);

    const evaluateFlippedTiles = () => {
        const [firstIndex, secondIndex] = flippedTiles;
        if (tiles[firstIndex].id === tiles[secondIndex].id) {
            setMatchedTiles((prevMatched) => [...prevMatched, firstIndex, secondIndex]);
        } else {
            setLives((prevLives) => prevLives - 1);
            triggerShakeEffect();
        }
        setTimeout(() => setFlippedTiles([]), 1000);
    };

    useEffect(() => {
        if (lives === 0) handleGameOver();
    }, [lives]);

    useEffect(() => {
        if (matchedTiles.length === tiles.length && tiles.length > 0) {
            level < levels.length
                ? showModal('Success', "You've completed the level!")
                : showModal('You won', "Congratulations! You've completed all levels!");
        }
    }, [matchedTiles]);

    const handleGameOver = () => {
        showModal('Game Over', "You've run out of lives! Restarting level...");
        setLevel(1);
    };

    const showModal = (title, message) => {
        setModalMessage(`${title}: ${message}`);
        setModalVisible(true);
    };

    const hideModal = () => {
        setModalVisible(false);
        setLevel(level < levels.length ? level + 1 : 1);
    };

    const handleCheat = () => {
        setFlippedTiles(cheated ? matchedTiles : tiles.map((_, index) => index));
        setCheated(!cheated);
    };

    const animateElement = (animatedValue, toValue = 1.1, duration = 1000) => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    duration,
                    easing: Easing.inOut(Easing.ease),
                    toValue,
                    useNativeDriver: true
                }),
                Animated.timing(animatedValue, {
                    duration,
                    easing: Easing.inOut(Easing.ease),
                    toValue: 1,
                    useNativeDriver: true
                })
            ])
        ).start();
    };

    const animateTiles = () => {
        tiles.forEach((_, index) => {
            tileScale[index] = new Animated.Value(1);
            Animated.sequence([
                Animated.timing(tileScale[index], {
                    duration: 300,
                    easing: Easing.bounce,
                    toValue: 1.2,
                    useNativeDriver: true
                }),
                Animated.timing(tileScale[index], {
                    duration: 300,
                    easing: Easing.bounce,
                    toValue: 1,
                    useNativeDriver: true
                })
            ]).start();
        });
    };

    const triggerShakeEffect = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, {
                duration: 100,
                toValue: 1,
                useNativeDriver: true
            }),
            Animated.timing(shakeAnim, {
                duration: 100,
                toValue: 0,
                useNativeDriver: true
            })
        ]).start();
    };

    const contextValue = {
        cheatButtonScale,
        cheated,
        flippedTiles,
        handleCheat,
        handleFlip,
        hideModal,
        level,
        lives,
        matchedTiles,
        modalMessage,
        modalVisible,
        setLevel,
        shakeAnim,
        TILE_SIZE,
        tiles,
        tileScale,
        titleScale
    };

    return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};

// Utility functions
const initializeTiles = (totalPairs) => {
    const shapes = ['🔴', '🔷', '🔺', '⭐', '⚪', '⬛', '🔶', '⬜', '💎', '🍀', '🔥', '🌊'];
    return Array.from({ length: totalPairs }, (_, i) => [
        { id: i, shape: shapes[i] },
        { id: i, shape: shapes[i] }
    ]).flat();
};

const shuffleTiles = (tiles) => {
    return tiles
        .map((tile) => ({ ...tile, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map((tile) => ({ id: tile.id, shape: tile.shape }));
};

export const useGameContext = () => useContext(GameContext);

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Button, StyleSheet, Text, Vibration } from 'react-native';

// Конфигурация на играта
const GAME_CONFIG = {
    backgroundColorRange: ['#f5f5f5', '#ff0000'],
    cooldownTime: 500,
    emojiStates: ['😐', '🙂', '😊', '😁', '😅', '🤯', '🤖'],
    gameDuration: 10,
    maxScale: 2.0,
    scalingFactor: 0.05,
    vibrationDuration: 50
};

const styles = StyleSheet.create({
    animatedView: (scaleValue) => ({
        transform: [{ scale: scaleValue }]
    }),
    bestScore: {
        color: 'green',
        fontSize: 18,
        fontWeight: 'bold',
        position: 'absolute',
        right: 20,
        top: 50
    },
    container: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center'
    },
    emoji: {
        fontSize: 50,
        marginBottom: 20
    },
    score: {
        fontSize: 20,
        marginBottom: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    }
});

export default function FastestTapperGame() {
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.gameDuration);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tapSpeed, setTapSpeed] = useState(0);
    const [lastTapTime, setLastTapTime] = useState(0);
    const [emojiIndex, setEmojiIndex] = useState(0);
    const scaleValue = useState(new Animated.Value(1))[0];
    const backgroundColor = useState(new Animated.Value(0))[0];
    const timerRef = useRef(null);

    // Анимиране на бутона
    const animateButton = useCallback(
        (scale, intensity) => {
            Animated.sequence([
                Animated.timing(scaleValue, {
                    duration: 100,
                    toValue: scale,
                    useNativeDriver: true
                }),
                Animated.timing(scaleValue, {
                    duration: 100,
                    toValue: 1,
                    useNativeDriver: true
                })
            ]).start();

            Animated.timing(backgroundColor, {
                duration: 200,
                toValue: intensity,
                useNativeDriver: false
            }).start();
        },
        [scaleValue, backgroundColor]
    );

    const handleTap = useCallback(() => {
        if (isPlaying) {
            const now = new Date().getTime();
            const newScore = score + 1;
            const newSpeed = (1 / (now - tapSpeed)) * 1000;

            setScore(newScore);
            setTapSpeed(now);
            setLastTapTime(now);

            Vibration.vibrate(GAME_CONFIG.vibrationDuration);

            const animationScale = Math.min(1.2 + newSpeed * GAME_CONFIG.scalingFactor, GAME_CONFIG.maxScale);
            const backgroundIntensity = Math.min(newSpeed * 0.1, 1);

            const emojiStateIndex = Math.min(Math.floor(newSpeed / 5), GAME_CONFIG.emojiStates.length - 1);
            setEmojiIndex(emojiStateIndex);

            animateButton(animationScale, backgroundIntensity);
        }
    }, [animateButton, isPlaying, score, tapSpeed]);

    const startGame = useCallback(() => {
        setScore(0);
        setIsPlaying(true);
        setTimeLeft(GAME_CONFIG.gameDuration);
        setTapSpeed(new Date().getTime());
        setLastTapTime(new Date().getTime());
        setEmojiIndex(0);

        timerRef.current = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timerRef.current);
                    setIsPlaying(false);
                    if (score > bestScore) {
                        setBestScore(score);
                    }
                }
                return prevTime - 1;
            });
        }, 1000);
    }, [bestScore, score]);

    useEffect(() => {
        return () => {
            clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                const now = new Date().getTime();
                const timeSinceLastTap = now - lastTapTime;

                if (timeSinceLastTap > GAME_CONFIG.cooldownTime) {
                    const newEmojiIndex = Math.max(emojiIndex - 1, 0);
                    setEmojiIndex(newEmojiIndex);

                    Animated.timing(backgroundColor, {
                        duration: 500,
                        toValue: 0,
                        useNativeDriver: false
                    }).start();
                }
            }, 500);

            return () => clearInterval(interval);
        }
    }, [lastTapTime, emojiIndex, backgroundColor, isPlaying]);

    const interpolatedColor = backgroundColor.interpolate({
        inputRange: [0, 1],
        outputRange: GAME_CONFIG.backgroundColorRange
    });

    const dynamicStyles = useMemo(() => {
        return [styles.container, { backgroundColor: interpolatedColor }];
    }, [interpolatedColor]);

    return (
        <Animated.View style={dynamicStyles}>
            <Text style={styles.bestScore}>Най-добър резултат: {bestScore}</Text>

            {isPlaying ? (
                <>
                    <Text style={styles.title}>Оставащо време: {timeLeft} сек</Text>
                    <Text style={styles.emoji}>{GAME_CONFIG.emojiStates[emojiIndex]}</Text>
                    <Text style={styles.score}>Натискания: {score}</Text>
                    <Animated.View style={styles.animatedView(scaleValue)}>
                        <Button title="Натисни ме!" onPress={handleTap} />
                    </Animated.View>
                </>
            ) : (
                <>
                    <Text style={styles.title}>Твоят резултат: {score} натискания!</Text>
                    <Button title="Старт на играта" onPress={startGame} />
                </>
            )}
        </Animated.View>
    );
}

import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import styles from './styles';

const ANIMATION_DURATION = 1000;

const GameTitle = () => {
    const titleScale = useRef(new Animated.Value(1)).current;

    const animateElement = useCallback((animValue, toValue = 1.1, duration = ANIMATION_DURATION) => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animValue, {
                    duration,
                    easing: Easing.inOut(Easing.ease),
                    toValue,
                    useNativeDriver: true
                }),
                Animated.timing(animValue, {
                    duration,
                    easing: Easing.inOut(Easing.ease),
                    toValue: 1,
                    useNativeDriver: true
                })
            ])
        ).start();
    }, []);

    const transformStyle = useMemo(() => ({ transform: [{ scale: titleScale }] }), [titleScale]);
    const titleStyle = useMemo(() => [styles.title, transformStyle], [transformStyle]);

    return <Animated.Text style={titleStyle}>Memory Game</Animated.Text>;
};

export default GameTitle;

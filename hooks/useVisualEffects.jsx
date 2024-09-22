import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';

const SHAKE_DURATION = 100;

export const useVisualEffects = () => {
    const shakeAnim = useRef(new Animated.Value(0)).current;

    // Shake effect for incorrect actions
    const triggerShakeEffect = useCallback(() => {
        Animated.sequence([
            Animated.timing(shakeAnim, {
                duration: SHAKE_DURATION,
                toValue: 1,
                useNativeDriver: true
            }),
            Animated.timing(shakeAnim, {
                duration: SHAKE_DURATION,
                toValue: 0,
                useNativeDriver: true
            })
        ]).start();
    }, [shakeAnim]);

    return {
        shakeAnim,
        triggerShakeEffect
    };
};

export default useVisualEffects;

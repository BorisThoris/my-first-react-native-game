import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface HelperEffectProps {
    type: 'extraLife' | 'tileFlip' | 'hint' | 'timeExtension';
    isActive: boolean;
    onComplete?: () => void;
}

const HelperEffect: React.FC<HelperEffectProps> = ({ type, isActive, onComplete }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        if (isActive) {
            // Start animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }),
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.2,
                        duration: 150,
                        useNativeDriver: true
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 150,
                        useNativeDriver: true
                    })
                ])
            ]).start(() => {
                // Hide after animation
                setTimeout(() => {
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true
                    }).start(() => {
                        if (onComplete) onComplete();
                    });
                }, 1000);
            });
        }
    }, [isActive]);

    if (!isActive) return null;

    const getEffectIcon = () => {
        switch (type) {
            case 'extraLife':
                return '💖';
            case 'tileFlip':
                return '🎯';
            case 'hint':
                return '💡';
            case 'timeExtension':
                return '⏰';
            default:
                return '✨';
        }
    };

    const getEffectText = () => {
        switch (type) {
            case 'extraLife':
                return 'Extra Life!';
            case 'tileFlip':
                return 'Tiles Flipped!';
            case 'hint':
                return 'Hint Revealed!';
            case 'timeExtension':
                return 'Time Extended!';
            default:
                return 'Helper Used!';
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}
        >
            <Text style={styles.icon}>{getEffectIcon()}</Text>
            <Text style={styles.text}>{getEffectText()}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -75 }, { translateY: -25 }],
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#4CAF50',
        zIndex: 1000,
        alignItems: 'center'
    },
    icon: {
        fontSize: 32,
        marginBottom: 5
    },
    text: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    }
});

export default HelperEffect;

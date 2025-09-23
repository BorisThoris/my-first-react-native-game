import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import useGameStore from '../../stores/gameStore';

const StreakCelebration: React.FC = () => {
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationText, setCelebrationText] = useState('');
    const [fadeAnim] = useState(new Animated.Value(0));
    const { playerStats } = useGameStore();

    useEffect(() => {
        const streak = playerStats.streak;

        // Check for streak milestones
        if (streak === 3) {
            setCelebrationText('🔥 3 STREAK! Extra life gained + helpers unlocked!');
            showCelebrationMessage();
        } else if (streak === 5) {
            setCelebrationText('⚡ 5 STREAK! More helpers available!');
            showCelebrationMessage();
        } else if (streak === 7) {
            setCelebrationText('🌟 7 STREAK! Extra life gained + time extension unlocked!');
            showCelebrationMessage();
        } else if (streak === 10) {
            setCelebrationText('💎 10 STREAK! 2 extra lives + ALL HELPERS UNLOCKED!');
            showCelebrationMessage();
        } else if (streak === 15) {
            setCelebrationText('👑 15 STREAK! LEGENDARY PERFORMANCE!');
            showCelebrationMessage();
        }
    }, [playerStats.streak]);

    const showCelebrationMessage = () => {
        setShowCelebration(true);

        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true
            }),
            Animated.delay(2000),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true
            })
        ]).start(() => {
            setShowCelebration(false);
        });
    };

    if (!showCelebration) {
        return null;
    }

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Text style={styles.celebrationText}>{celebrationText}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -150 }, { translateY: -50 }],
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 20,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#FFD700',
        zIndex: 1000
    },
    celebrationText: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2
    }
});

export default StreakCelebration;

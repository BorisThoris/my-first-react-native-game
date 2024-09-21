import React, { useMemo } from 'react';
import { Animated } from 'react-native';
import { useGameContext } from '../../../../contexts/GameContext';
import styles from './styles';

const ShakeContainer = ({ children }) => {
    const { shakeAnim } = useGameContext();

    const transformStyle = useMemo(
        () => ({
            transform: [
                {
                    translateX: shakeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 10]
                    })
                }
            ]
        }),
        [shakeAnim]
    );

    const containerStyle = useMemo(() => [styles.container, transformStyle], [transformStyle]);

    return <Animated.View style={containerStyle}>{children}</Animated.View>;
};

export default ShakeContainer;

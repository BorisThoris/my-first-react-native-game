// Tile.js
import React, { useMemo } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';
import { useGameContext } from '../../../contexts/GameContext';
import styles from '../styles';

const Tile = ({ index, tile }) => {
    const { cheated, flippedTiles, handleFlip, matchedTiles, TILE_SIZE, tileScale } = useGameContext();

    const isFlipped = flippedTiles.includes(index) || matchedTiles.includes(index);

    const animatedStyle = useMemo(
        () => ({
            transform: [{ scale: tileScale[index] || 1 }]
        }),
        [tileScale, index]
    );

    const tileStyle = useMemo(
        () => [
            styles.tile,
            isFlipped ? styles.flippedTile : styles.hiddenTile,
            { height: TILE_SIZE, width: TILE_SIZE }
        ],
        [isFlipped, TILE_SIZE]
    );

    const handlePress = useMemo(() => () => handleFlip(index), [handleFlip, index]);

    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity style={tileStyle} onPress={handlePress} disabled={isFlipped || cheated}>
                {isFlipped && <Text style={styles.tileText}>{tile.shape}</Text>}
            </TouchableOpacity>
        </Animated.View>
    );
};

export default Tile;

import React from 'react';
import { View } from 'react-native';
import { useGameContext } from '../../../contexts/GameContext';
import styles from '../styles';
import Tile from './Tile';

const TileGrid = () => {
    const { tiles } = useGameContext();

    return (
        <View style={styles.gridContainer}>
            <View style={styles.grid}>
                {tiles.map((tile, index) => (
                    <Tile key={index} index={index} tile={tile} />
                ))}
            </View>
        </View>
    );
};

export default TileGrid;

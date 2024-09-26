import React from 'react';
import { ScrollView, View } from 'react-native';
import { useGameContext } from '../../../../contexts/GameContext';
import Tile from '../Tile/Tile';
import styles from './styles';

const TileGrid = () => {
    const { tiles } = useGameContext();

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.grid}>
                {tiles.map((tile, index) => (
                    <Tile key={index} index={index} tile={tile} />
                ))}
            </View>
        </ScrollView>
    );
};

export default TileGrid;

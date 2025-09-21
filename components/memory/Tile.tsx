import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TileStates, Tile as TileType } from '../../types/gameTypes';
import { useTileMatching } from '../../hooks/useTileMatching';

interface TileProps {
    tile: TileType;
    size: number;
}

const Tile: React.FC<TileProps> = ({ tile, size }) => {
    const { handleTilePress, flippedTiles, matchedTiles } = useTileMatching();

    const isFlipped = flippedTiles.includes(tile.id);
    const isMatched = matchedTiles.includes(tile.id);

    const getTileState = (): string => {
        if (isMatched) return TileStates.MATCHED;
        if (isFlipped) return TileStates.FLIPPED;
        return TileStates.HIDDEN;
    };

    const tileState = getTileState();

    return (
        <TouchableOpacity
            style={[
                styles.tile,
                { width: size, height: size },
                tileState === TileStates.HIDDEN && styles.hidden,
                tileState === TileStates.FLIPPED && styles.flipped,
                tileState === TileStates.MATCHED && styles.matched
            ]}
            onPress={() => handleTilePress(tile.id)}
        >
            {(tileState === TileStates.FLIPPED || tileState === TileStates.MATCHED) && (
                <Text style={styles.text}>{tile.shape}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tile: {
        backgroundColor: '#444',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#666',
        margin: 2
    },
    hidden: {
        backgroundColor: '#333',
        borderColor: '#555'
    },
    flipped: {
        backgroundColor: '#2a5a2a',
        borderColor: '#4CAF50'
    },
    matched: {
        backgroundColor: '#1a5a1a',
        borderColor: '#2E7D32',
        opacity: 0.7
    },
    text: {
        fontSize: 24,
        color: '#fff'
    }
});

export default Tile;


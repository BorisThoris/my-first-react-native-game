import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Tile from './Tile';
import { Room } from '../../types/gameTypes';
import useGameStore from '../../stores/gameStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TileGridProps {
    room: Room;
    onRoomComplete?: () => void;
}

const TileGrid: React.FC<TileGridProps> = ({ room, onRoomComplete }) => {
    const { isRoomCompleted } = useGameStore();

    if (!room || !room.tiles) return null;

    const gridSize = room.gridSize;

    // Check for room completion
    useEffect(() => {
        if (isRoomCompleted() && onRoomComplete) {
            onRoomComplete();
        }
    }, [isRoomCompleted, onRoomComplete]);

    // Calculate optimal tile size based on screen dimensions
    const availableWidth = SCREEN_WIDTH - 100; // Account for padding
    const availableHeight = SCREEN_HEIGHT - 500; // Account for header, stats, helper panel, and footer
    const maxTileSize = Math.min(availableWidth, availableHeight) / gridSize;
    const tileSize = Math.min(maxTileSize, 70); // Cap at 70px per tile to leave more space

    // Create a proper 2D grid layout using absolute positioning
    const renderGrid = (): React.ReactElement[] => {
        const tiles: React.ReactElement[] = [];

        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const tileIndex = y * gridSize + x;
                const tile = room.tiles[tileIndex];

                if (tile) {
                    const left = x * tileSize;
                    const top = y * tileSize;

                    tiles.push(
                        <View
                            key={tile.id}
                            style={[
                                styles.tileContainer,
                                {
                                    left,
                                    top,
                                    width: tileSize,
                                    height: tileSize
                                }
                            ]}
                        >
                            <Tile tile={tile} size={tileSize - 4} />
                        </View>
                    );
                }
            }
        }

        return tiles;
    };

    const gridWidth = tileSize * gridSize;
    const gridHeight = tileSize * gridSize;

    return (
        <View style={styles.container}>
            <View style={[styles.gridContainer, { width: gridWidth, height: gridHeight }]}>{renderGrid()}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    gridContainer: {
        position: 'relative',
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        padding: 8,
        borderWidth: 2,
        borderColor: '#444'
    },
    tileContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export default TileGrid;

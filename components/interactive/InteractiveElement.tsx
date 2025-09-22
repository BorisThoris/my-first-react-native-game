import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { InteractiveElement, InteractiveType } from '../../types/interactiveTypes';
import useGameStore from '../../stores/gameStore';

interface InteractiveElementProps {
    element: InteractiveElement;
    onInteract: (element: InteractiveElement) => void;
}

const InteractiveElementComponent: React.FC<InteractiveElementProps> = ({ element, onInteract }) => {
    const { playerStats, useKey, useBomb } = useGameStore();

    const canInteract = () => {
        const { keys, bombs } = playerStats;
        const { requirements } = element;

        if (requirements.keys && keys < requirements.keys) return false;
        if (requirements.bombs && bombs < requirements.bombs) return false;

        return true;
    };

    const handlePress = () => {
        if (!canInteract()) return;

        // Consume resources
        if (element.requirements.keys) {
            useKey();
        }
        if (element.requirements.bombs) {
            useBomb();
        }

        onInteract(element);
    };

    const getButtonText = () => {
        if (element.state === 'destroyed' || element.state === 'opened') {
            return 'Used';
        }

        if (element.requirements.keys) {
            return `🔑 Use Key`;
        }
        if (element.requirements.bombs) {
            return `💣 Use Bomb`;
        }

        return 'Interact';
    };

    const getElementStyle = () => {
        switch (element.type) {
            case InteractiveType.BOMBABLE_WALL:
                return styles.bombableWall;
            case InteractiveType.SECRET_PASSAGE:
                return styles.secretPassage;
            case InteractiveType.TREASURE_CHEST:
                return styles.treasureChest;
            case InteractiveType.LOCKED_DOOR:
                return styles.lockedDoor;
            default:
                return styles.default;
        }
    };

    if (element.state === 'hidden') return null;

    return (
        <View style={[styles.container, getElementStyle()]}>
            <Text style={styles.icon}>{element.icon}</Text>
            <Text style={styles.description}>{element.description}</Text>
            <TouchableOpacity
                style={[
                    styles.button,
                    (!canInteract() || element.state === 'destroyed' || element.state === 'opened') &&
                        styles.disabledButton
                ]}
                onPress={handlePress}
                disabled={!canInteract() || element.state === 'destroyed' || element.state === 'opened'}
            >
                <Text style={styles.buttonText}>{getButtonText()}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        padding: 10,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#666',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        minWidth: 120,
        alignItems: 'center'
    },
    icon: {
        fontSize: 24,
        marginBottom: 5
    },
    description: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 8
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#45a049'
    },
    disabledButton: {
        backgroundColor: '#666',
        borderColor: '#555'
    },
    buttonText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold'
    },
    bombableWall: {
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.2)'
    },
    secretPassage: {
        borderColor: '#9c27b0',
        backgroundColor: 'rgba(156, 39, 176, 0.2)'
    },
    treasureChest: {
        borderColor: '#ffd700',
        backgroundColor: 'rgba(255, 215, 0, 0.2)'
    },
    lockedDoor: {
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.2)'
    },
    default: {
        borderColor: '#666',
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
    }
});

export default InteractiveElementComponent;



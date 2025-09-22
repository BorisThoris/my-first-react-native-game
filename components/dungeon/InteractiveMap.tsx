import React from 'react';
import { View, StyleSheet } from 'react-native';
import InteractiveElementComponent from '../interactive/InteractiveElement';
import { InteractiveElement } from '../../types/interactiveTypes';
import useGameStore from '../../stores/gameStore';

interface InteractiveMapProps {
    interactives: InteractiveElement[];
    onInteract: (element: InteractiveElement) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ interactives, onInteract }) => {
    const { addItem, addKeys, addBombs, addPoints } = useGameStore();

    const handleInteract = (element: InteractiveElement) => {
        // Apply rewards
        if (element.rewards) {
            if (element.rewards.points) {
                addPoints(element.rewards.points);
            }
            if (element.rewards.keys) {
                addKeys(element.rewards.keys);
            }
            if (element.rewards.bombs) {
                addBombs(element.rewards.bombs);
            }
            if (element.rewards.items) {
                // Add items to inventory
                element.rewards.items.forEach((itemId) => {
                    // This would need to be implemented with actual item lookup
                    console.log(`Rewarded item: ${itemId}`);
                });
            }
        }

        onInteract(element);
    };

    return (
        <View style={styles.container}>
            {interactives.map((element) => (
                <InteractiveElementComponent key={element.id} element={element} onInteract={handleInteract} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'box-none'
    }
});

export default InteractiveMap;




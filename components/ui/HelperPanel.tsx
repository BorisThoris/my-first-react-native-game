import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import useGameStore from '../../stores/gameStore';
import {
    getHelperConfigForRoom,
    isHelperAllowed,
    getMaxUsesForHelper,
    getCustomMessage
} from '../../utils/helperConfig';
import { Room } from '../../types/gameTypes';
import HelperEffect from './HelperEffect';

interface HelperPanelProps {
    room?: Room;
    onTimeExtension?: (seconds: number) => void;
    onHint?: (tileIds: string[]) => void;
}

const HelperPanel: React.FC<HelperPanelProps> = ({ room, onTimeExtension, onHint }) => {
    const { playerStats, availableHelpers, helperUses, useHelper, showHint, updateAvailableHelpers } = useGameStore();

    const [hintTiles, setHintTiles] = useState<string[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeEffect, setActiveEffect] = useState<{
        type: 'extraLife' | 'tileFlip' | 'hint' | 'timeExtension';
        isActive: boolean;
    }>({ type: 'extraLife', isActive: false });

    // Get room-specific helper configuration
    const helperConfig = room ? getHelperConfigForRoom(room.type) : getHelperConfigForRoom('memory-chamber');

    useEffect(() => {
        updateAvailableHelpers();
    }, [playerStats.streak, playerStats.roomsCompleted]);

    const handleHelperPress = (helperType: 'extraLife' | 'tileFlip' | 'hint' | 'timeExtension') => {
        // Check if helpers are enabled for this room
        if (!helperConfig.enabled) {
            Alert.alert('Helpers Disabled', 'Helper abilities are not available in this room type.');
            return;
        }

        // Check if this specific helper is allowed
        if (!isHelperAllowed(room?.type || 'memory-chamber', helperType)) {
            Alert.alert('Helper Not Allowed', `${helperType} is not available in this room type.`);
            return;
        }

        // Check if player has uses remaining
        if (helperUses[helperType] <= 0) {
            Alert.alert('No Uses Left', `You don't have any ${helperType} uses remaining.`);
            return;
        }

        // Check room-specific max uses
        const maxUses = getMaxUsesForHelper(room?.type || 'memory-chamber', helperType);
        if (maxUses && helperUses[helperType] > maxUses) {
            Alert.alert('Max Uses Reached', `You've reached the maximum uses for ${helperType} in this room.`);
            return;
        }

        const success = useHelper(helperType);

        if (success) {
            // Show visual effect
            setActiveEffect({ type: helperType, isActive: true });

            // Get custom message or use default
            const customMessage = getCustomMessage(room?.type || 'memory-chamber', helperType);

            switch (helperType) {
                case 'extraLife':
                    Alert.alert('💖 Extra Life!', customMessage || 'You gained an extra life!');
                    break;
                case 'tileFlip':
                    Alert.alert('🎯 Tile Flip!', customMessage || 'Two random tiles have been flipped for you!');
                    break;
                case 'hint':
                    const hintTiles = showHint();
                    if (hintTiles.length > 0) {
                        setHintTiles(hintTiles);
                        Alert.alert('💡 Hint!', customMessage || 'A matching pair has been highlighted!');
                        if (onHint) onHint(hintTiles);
                    } else {
                        Alert.alert('No Hint Available', 'No matching pairs found to hint.');
                    }
                    break;
                case 'timeExtension':
                    Alert.alert('⏰ Time Extension!', customMessage || 'You gained 30 seconds!');
                    if (onTimeExtension) onTimeExtension(30);
                    break;
            }
        }
    };

    const getHelperIcon = (helperType: string) => {
        switch (helperType) {
            case 'extraLife':
                return '💖';
            case 'tileFlip':
                return '🎯';
            case 'hint':
                return '💡';
            case 'timeExtension':
                return '⏰';
            default:
                return '❓';
        }
    };

    const getHelperName = (helperType: string) => {
        switch (helperType) {
            case 'extraLife':
                return 'Extra Life';
            case 'tileFlip':
                return 'Tile Flip';
            case 'hint':
                return 'Hint';
            case 'timeExtension':
                return 'Time Extension';
            default:
                return 'Unknown';
        }
    };

    const getHelperDescription = (helperType: string) => {
        switch (helperType) {
            case 'extraLife':
                return 'Gain an extra life';
            case 'tileFlip':
                return 'Flip 2 random tiles';
            case 'hint':
                return 'Show a matching pair';
            case 'timeExtension':
                return 'Add 30 seconds';
            default:
                return 'Unknown helper';
        }
    };

    // Don't show if helpers are disabled for this room
    if (!helperConfig.enabled) {
        return null;
    }

    // Check if any helpers are available and allowed
    const hasAvailableHelpers = Object.entries(availableHelpers).some(([helperType, available]) => {
        return available && isHelperAllowed(room?.type || 'memory-chamber', helperType as any);
    });

    if (!hasAvailableHelpers) {
        return null;
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.header} onPress={() => setIsCollapsed(!isCollapsed)}>
                <Text style={styles.title}>🎮 Helper Abilities</Text>
                <Text style={styles.collapseIcon}>{isCollapsed ? '▼' : '▲'}</Text>
            </TouchableOpacity>

            {!isCollapsed && (
                <>
                    <Text style={styles.subtitle}>
                        Streak: {playerStats.streak} | Rooms: {playerStats.roomsCompleted}
                    </Text>

                    <View style={styles.helpersGrid}>
                        {Object.entries(availableHelpers).map(([helperType, available]) => {
                            if (!available) return null;

                            // Check if this helper is allowed in this room
                            if (!isHelperAllowed(room?.type || 'memory-chamber', helperType as any)) {
                                return null;
                            }

                            const uses = helperUses[helperType as keyof typeof helperUses];
                            const maxUses = getMaxUsesForHelper(room?.type || 'memory-chamber', helperType as any);
                            const isDisabled = uses <= 0 || (maxUses && uses > maxUses);

                            return (
                                <TouchableOpacity
                                    key={helperType}
                                    style={[styles.helperButton, isDisabled && styles.helperButtonDisabled]}
                                    onPress={() => handleHelperPress(helperType as any)}
                                    disabled={isDisabled}
                                >
                                    <Text style={styles.helperIcon}>{getHelperIcon(helperType)}</Text>
                                    <Text style={[styles.helperName, isDisabled && styles.helperNameDisabled]}>
                                        {getHelperName(helperType)}
                                    </Text>
                                    <Text style={[styles.helperUses, isDisabled && styles.helperUsesDisabled]}>
                                        {uses} uses{maxUses ? `/${maxUses}` : ''}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.helperDescription,
                                            isDisabled && styles.helperDescriptionDisabled
                                        ]}
                                    >
                                        {getHelperDescription(helperType)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {hintTiles.length > 0 && (
                        <View style={styles.hintContainer}>
                            <Text style={styles.hintText}>💡 Hint: Look for matching tiles!</Text>
                        </View>
                    )}
                </>
            )}

            <HelperEffect
                type={activeEffect.type}
                isActive={activeEffect.isActive}
                onComplete={() => setActiveEffect({ type: 'extraLife', isActive: false })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#2a2a2a',
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#444',
        flexShrink: 0 // Prevent shrinking
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    collapseIcon: {
        color: '#ccc',
        fontSize: 16,
        fontWeight: 'bold'
    },
    subtitle: {
        color: '#ccc',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 15
    },
    helpersGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around'
    },
    helperButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 8,
        margin: 5,
        minWidth: 80,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#45a049'
    },
    helperButtonDisabled: {
        backgroundColor: '#666',
        borderColor: '#444'
    },
    helperIcon: {
        fontSize: 24,
        marginBottom: 5
    },
    helperName: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 2
    },
    helperNameDisabled: {
        color: '#999'
    },
    helperUses: {
        color: '#FFD700',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2
    },
    helperUsesDisabled: {
        color: '#666'
    },
    helperDescription: {
        color: '#ccc',
        fontSize: 9,
        textAlign: 'center'
    },
    helperDescriptionDisabled: {
        color: '#666'
    },
    hintContainer: {
        backgroundColor: '#FFD700',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center'
    },
    hintText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold'
    }
});

export default HelperPanel;

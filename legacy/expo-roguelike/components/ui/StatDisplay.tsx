import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatDisplayProps {
    label: string;
    value: number;
    color?: string;
}

const StatDisplay: React.FC<StatDisplayProps> = ({ label, value, color = '#4CAF50' }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}:</Text>
            <Text style={[styles.value, { color }]}>{value}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    label: {
        color: '#fff',
        fontSize: 14,
        marginRight: 5
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default StatDisplay;


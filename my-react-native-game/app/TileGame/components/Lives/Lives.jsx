import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const MAX_LIVES = 5;

const Lives = ({ lives }) => {
    return (
        <View style={styles.livesContainer}>
            {Array.from({ length: MAX_LIVES }, (_, i) => (
                <Text key={i} style={styles.heart}>
                    {i < lives ? '❤️' : '💔'}
                </Text>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    heart: {
        fontSize: 24,
        marginHorizontal: 5
    },
    livesContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10
    }
});

export default Lives;

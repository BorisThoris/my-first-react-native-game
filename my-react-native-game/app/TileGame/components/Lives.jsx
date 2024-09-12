// Lives.js
import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles';


const Lives = ({ lives }) => {
  return (
    <View style={styles.livesContainer}>
      {Array.from({ length: lives }, (_, i) => (
        <Text key={i} style={styles.star}>
          ⭐
        </Text>
      ))}
    </View>
  );
};

export default Lives;

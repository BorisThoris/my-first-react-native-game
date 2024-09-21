import React from 'react';
import { Text } from 'react-native';
import styles from './styles';

const CheaterText = ({ cheated }) => (cheated ? <Text style={styles.cheaterText}>Cheater :(</Text> : null);

export default CheaterText;

import React from 'react';
import { Button, Modal, Text, TextInput, View } from 'react-native';
import { useGameContext } from '../../../../contexts/GameContext';
import styles from './styles';

const UserNameModal = ({ isVisible, onClose }) => {
    const { setUserName, userName } = useGameContext();

    return (
        <Modal animationType="slide" transparent visible={isVisible} onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={styles.modal}>
                    <Text>What's your name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter username"
                        value={userName}
                        onChangeText={setUserName}
                    />
                    <Button title="Submit" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
};

export default UserNameModal;

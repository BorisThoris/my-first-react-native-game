// GameModal.js
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useGameContext } from '../../../../contexts/GameContext';
import styles from './styles';

const GameModal = () => {
    const { hideModal, modalMessage, modalVisible } = useGameContext();

    return (
        <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={hideModal}>
            <View style={styles.modalContainer}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>{modalMessage}</Text>
                    <TouchableOpacity style={styles.modalButton} onPress={hideModal}>
                        <Text style={styles.modalButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default GameModal;

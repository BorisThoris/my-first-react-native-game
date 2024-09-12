// GameModal.js
import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import styles from "../styles";
import { useGameContext } from "../../../contexts/GameContext";

const GameModal = () => {
  const {
    modalVisible,
    modalMessage,
    hideModal,
  } = useGameContext();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={hideModal}
    >
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

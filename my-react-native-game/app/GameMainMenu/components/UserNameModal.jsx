import React, { useContext } from "react";
import { Modal, View, Text, TextInput, Button } from "react-native";
import GlobalContext from "../../../contexts/GlobalStorage";

const UserNameModal = ({ isVisible, onClose }) => {
  const { userName, updateUserName } = useContext(GlobalContext); 

  const handleSetUserName = () => {
    onClose(); 
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            width: "80%",
            alignItems: "center",
          }}
        >
          <Text>Please enter your username</Text>
          <TextInput
            style={{
              borderColor: "gray",
              borderWidth: 1,
              padding: 8,
              width: "100%",
              marginVertical: 10,
            }}
            placeholder="Enter username"
            value={userName}
            onChangeText={updateUserName}
          />
          <Button title="Submit" onPress={handleSetUserName} />
        </View>
      </View>
    </Modal>
  );
};

export default UserNameModal;

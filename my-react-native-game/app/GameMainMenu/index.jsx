import React, { useContext, useState, useRef } from "react";
import { Text, View, Image,  Animated, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import doYouWantToPlayImage from "../../assets/images/doYouWantToPlay.jpg";
import GlobalContext from "../../contexts/GlobalStorage";
import UserNameModal from "./components/UserNameModal";
import ButtonComponent from "./components/ButtonComponent";

export default function GameScreen() {
  const { userName } = useContext(GlobalContext);
  const [isModalVisible, setModalVisible] = useState(false);
  const [noSelected, setNoSelected] = useState(false);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const handleNoAction = async () => {
    setNoSelected(true);
    const shakeValues = [15, -15, 0];
    const animations = shakeValues.map((value) =>
      Animated.timing(shakeAnimation, {
        toValue: value,
        duration: 100,
        useNativeDriver: true,
      })
    );
    Animated.sequence(animations).start();
  };

  const handleYesAction = () => {
    router.push("/TileGame"); // Navigate to TileGame when "Yes" is pressed
  };

  if (!userName) {
    setTimeout(() => {
      setModalVisible(true);
    }, 0);
  }

  return (
    <View style={styles.container}>
      <UserNameModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />

      {userName && (
        <>
          <Text style={styles.greetingText}>Hello, {userName}!</Text>
          <Animated.View
            style={[
              styles.imageContainer,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            <Image source={doYouWantToPlayImage} style={styles.image} />
          </Animated.View>

          <View style={styles.buttonContainer}>
            <ButtonComponent text="Yes" onPress={handleYesAction} />
            {!noSelected ? (
              <ButtonComponent text="No" onPress={handleNoAction} isNoButton />
            ) : (
              <ButtonComponent text="Yes" onPress={handleYesAction} />
            )}
          </View>

          {noSelected && (
            <Text style={styles.noOptionText}>No was never an option</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  imageContainer: {},
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginVertical: 20,
  },
  noOptionText: {
    marginTop: 20,
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
  },
});

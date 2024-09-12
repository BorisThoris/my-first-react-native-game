import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function ButtonComponent({ text, onPress, isNoButton = false }) {
  return (
    <TouchableOpacity
      style={[styles.button, isNoButton && styles.noButton]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4CAF50", // Default green button
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  noButton: {
    backgroundColor: "red", // Red for 'No' button
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

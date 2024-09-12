import { useRouter } from "expo-router";
import { View, Text, Button, StyleSheet } from "react-native";

const HomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Navigation Test Screen</Text>
      <Text style={styles.subtitle}>This is a test for navigating between screens.</Text>
      <Button
        title="Go to our game"
        onPress={() => router.push("/GameMainMenu")}
        color="#6200ea" // Styled button color
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
});

export default HomeScreen;

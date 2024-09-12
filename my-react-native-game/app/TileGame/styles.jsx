import { StyleSheet } from "react-native";

const TILE_MARGIN = 5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    paddingVertical: 20, // Prevents title clipping
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 20,
    textAlign: "center",
  },
  livesText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff3333",
    marginBottom: 20,
    textAlign: "center",
  },
  gridContainer: {
    flex: 0.3,
    width: "90%", // Limits the grid container width
    justifyContent: "center",
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  tile: {
    justifyContent: "center",
    alignItems: "center",
    margin: TILE_MARGIN,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  hiddenTile: {
    backgroundColor: "#6b8e23",
  },
  flippedTile: {
    backgroundColor: "#FFD700",
  },
  tileText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
  },
  cheaterText: {
    fontSize: 24,
    color: "red",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 20,
  },
  livesContainer: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "center",
  },
  star: {
    fontSize: 30,
    color: "#FFD700",
    marginRight: 5,
  },
  cheatButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default styles;

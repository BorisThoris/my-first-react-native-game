// app/_layout.js
import { Slot } from "expo-router";
import { GlobalProvider } from "../contexts/GlobalStorage";
import { GameProvider } from "../contexts/GameContext";

export default function Layout() {
  return (
    <GlobalProvider>
      <GameProvider>
        <Slot />
      </GameProvider>
    </GlobalProvider>
  );
}

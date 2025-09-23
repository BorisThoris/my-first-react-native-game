// Main App component for Memory Dungeon
const React = require('react');
const { Platform } = require('react-native');

// For web, we'll use a custom setup
if (Platform.OS === 'web') {
  // Web-specific setup
  const App = () => {
    // Import the game component directly for web
    const GameController = require('./app/DungeonExplorer/GameController').default;
    return React.createElement(GameController);
  };
  
  module.exports = App;
} else {
  // Mobile setup using Expo Router
  const { ExpoRoot } = require('expo-router');
  const App = () => {
    return React.createElement(ExpoRoot);
  };
  
  module.exports = App;
}


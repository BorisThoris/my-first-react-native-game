import { View, Text } from 'react-native';
import { useGameContext } from '../../contexts/GameContext';
import ShakeContainer from './components/ShakeContainer/ShakeContainer';
import GameTitle from './components/GameTitle/GameTitle';
import Player from './components/Player/Player';
import Lives from './components/Lives/Lives';
import TileGrid from './components/TileGrid/TileGrid';
import CheaterText from './components/CheaterText/CheaterText';
import CheatButton from './components/CheatButton/CheatButton';
import GameModal from './components/GameModal/GameModal';
import styles from './styles';

const TileGame = () => {
  const { currentLevelScore, lives, rating, tiles, totalScore } = useGameContext();

  return (
    <ShakeContainer>
      <GameTitle />

      <View style={styles.currentScoreContainer}>
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{rating}</Text>
        </View>

        <Text style={styles.currentScoreText}>Current Level Score: {currentLevelScore}</Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Total Score: {totalScore}</Text>
      </View>

      <View style={styles.playerContainer}>
        <Player />
      </View>

      <View style={styles.livesContainer}>
        <Lives lives={lives} />
      </View>

      <TileGrid tiles={tiles} />
      <CheaterText />
      <CheatButton />
      <GameModal />
    </ShakeContainer>
  );
};

export default TileGame;

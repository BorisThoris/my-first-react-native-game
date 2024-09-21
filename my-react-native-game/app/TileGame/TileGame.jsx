import React from 'react';
import { Text, View } from 'react-native';
import { useGameContext } from '../../contexts/GameContext';
import CheatButton from './components/CheatButton/CheatButton';
import CheaterText from './components/CheaterText/CheaterText';
import GameModal from './components/GameModal/GameModal';
import GameTitle from './components/GameTitle/GameTitle';
import Lives from './components/Lives/Lives';
import Player from './components/Player/Player';
import ShakeContainer from './components/ShakeContainer/ShakeContainer';
import TileGrid from './components/TileGrid/TileGrid';
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

import React from 'react';
import { Text, View } from 'react-native';
import { useGameContext } from '../../contexts/GameContext';
import CheatButton from './components/CheatButton';
import CheaterText from './components/CheaterText';
import GameModal from './components/GameModal';
import GameTitle from './components/GameTitle';
import Lives from './components/Lives';
import ShakeContainer from './components/ShakeContainer';
import TileGrid from './components/TileGrid';
import styles from './styles';

export const TileGame = () => {
    const { flippedTiles, lives, tiles } = useGameContext();

    return (
        <ShakeContainer>
            <Lives lives={lives} />

            <GameTitle />

            <Text style={styles.livesText}>Lives: {lives}</Text>

            <TileGrid tiles={tiles} flippedTiles={flippedTiles} />
            <CheaterText />

            <View style={styles.buttonContainer}>
                <CheatButton />
            </View>

            <GameModal />
        </ShakeContainer>
    );
};

export default TileGame;

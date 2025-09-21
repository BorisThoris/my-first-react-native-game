import { useCallback } from 'react';
import useGameStore from '../stores/gameStore';
import { checkTileMatch, findTileById, isTileFlippable, canFlipMoreTiles } from '../utils/tileMatching';
import { Tile } from '../types/gameTypes';

export const useTileMatching = () => {
  const { flippedTiles, matchedTiles, currentRoomTiles, flipTile, checkMatch } = useGameStore();

  const handleTilePress = useCallback((tileId: string): void => {
    if (!isTileFlippable(tileId, flippedTiles, matchedTiles)) return;
    if (!canFlipMoreTiles(flippedTiles)) return;
    
    flipTile(tileId);
  }, [flippedTiles, matchedTiles, flipTile]);

  const processMatch = useCallback((): boolean => {
    if (flippedTiles.length !== 2) return false;
    
    const [firstId, secondId] = flippedTiles;
    const firstTile = findTileById(currentRoomTiles, firstId);
    const secondTile = findTileById(currentRoomTiles, secondId);
    
    const isMatch = checkTileMatch(firstTile, secondTile);
    checkMatch();
    
    return isMatch;
  }, [flippedTiles, currentRoomTiles, checkMatch]);

  return {
    handleTilePress,
    processMatch,
    flippedTiles,
    matchedTiles
  };
};
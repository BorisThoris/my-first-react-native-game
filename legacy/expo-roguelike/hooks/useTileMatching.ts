import { useCallback } from 'react';
import useGameStore from '../stores/gameStore';
import { isTileFlippable, canFlipMoreTiles } from '../utils/tileMatching';

export const useTileMatching = () => {
  const { flippedTiles, matchedTiles, previewTiles, isPreviewing, flipTile } = useGameStore();

  const handleTilePress = useCallback((tileId: string): void => {
    if (!isTileFlippable(tileId, flippedTiles, matchedTiles)) return;
    if (!canFlipMoreTiles(flippedTiles)) return;
    
    flipTile(tileId);
  }, [flippedTiles, matchedTiles, flipTile]);

  return {
    handleTilePress,
    flippedTiles,
    matchedTiles,
    previewTiles,
    isPreviewing
  };
};
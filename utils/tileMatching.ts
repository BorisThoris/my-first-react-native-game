// Pure function for tile matching logic
import { Tile } from '../types/gameTypes';

export const checkTileMatch = (tile1: Tile | undefined, tile2: Tile | undefined): boolean => {
  return tile1 !== undefined && tile2 !== undefined && tile1.shape === tile2.shape;
};

export const findTileById = (tiles: Tile[], tileId: string): Tile | undefined => {
  return tiles.find(tile => tile.id === tileId);
};

export const isTileFlippable = (tileId: string, flippedTiles: string[], matchedTiles: string[]): boolean => {
  return !flippedTiles.includes(tileId) && !matchedTiles.includes(tileId);
};

export const canFlipMoreTiles = (flippedTiles: string[]): boolean => {
  return flippedTiles.length < 2;
};


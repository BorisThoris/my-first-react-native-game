// Pure functions for room state management
import { Room } from '../types/gameTypes';

export const createEmptyRoomState = () => ({
  flippedTiles: [],
  matchedTiles: [],
  roomState: 'incomplete'
});

export const isRoomCompleted = (room: Room): boolean => {
  return room.matchedTiles.length === room.tiles.length;
};

export const saveRoomState = (room: Room, flippedTiles: string[], matchedTiles: string[]): Room => {
  return {
    ...room,
    flippedTiles: [...flippedTiles],
    matchedTiles: [...matchedTiles],
    roomState: matchedTiles.length === room.tiles.length ? 'completed' : 'incomplete'
  };
};

export const loadRoomState = (room: Room): { flippedTiles: string[]; matchedTiles: string[] } => {
  return {
    flippedTiles: room.flippedTiles || [],
    matchedTiles: room.matchedTiles || []
  };
};


// Pure functions for game logic
import { Room } from '../types/gameTypes';

export const calculateScore = (matchedTiles: string[], difficulty: number): number => {
  return matchedTiles.length * 10 * difficulty;
};

export const shouldLoseLife = (isMatch: boolean): boolean => {
  return !isMatch;
};

export const isGameOver = (lives: number): boolean => {
  return lives <= 0;
};

export const getRoomStatus = (room: Room, availableRooms: Room[]): string => {
  if (room.completed && !room.returnable) return 'completed-locked';
  if (room.completed && room.returnable) return 'completed-returnable';
  if (availableRooms.some(r => r.id === room.id)) return 'available';
  return 'locked';
};


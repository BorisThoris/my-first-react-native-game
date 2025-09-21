import { useCallback } from 'react';
import useGameStore from '../stores/gameStore';
import useDungeonStore from '../stores/dungeonStore';
import { isRoomCompleted, loadRoomState, saveRoomState } from '../utils/roomState';
import { Room } from '../types/gameTypes';

export const useRoomState = (room: Room) => {
  const { setCurrentRoomTiles, flippedTiles, matchedTiles } = useGameStore();
  const { saveRoomState: saveToDungeon } = useDungeonStore();

  const loadRoom = useCallback((): void => {
    if (room && room.tiles) {
      const roomState = loadRoomState(room);
      setCurrentRoomTiles(room.tiles, roomState);
    }
  }, [room, setCurrentRoomTiles]);

  const saveRoom = useCallback((): void => {
    if (room) {
      saveToDungeon(room.id, flippedTiles, matchedTiles);
    }
  }, [room, flippedTiles, matchedTiles, saveToDungeon]);

  const isCompleted = useCallback((): boolean => {
    return isRoomCompleted(room);
  }, [room]);

  return {
    loadRoom,
    saveRoom,
    isCompleted
  };
};
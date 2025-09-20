import { create } from 'zustand';
import { RoomTypes, createRoom, createFloor } from '../types/gameTypes';
import { generateFloor } from '../algorithms/dungeonGenerator';

const useDungeonStore = create((set, get) => ({
  // State
  currentFloor: 1,
  currentRoom: null,
  floors: [],
  gameState: 'exploring', // 'exploring', 'in-room', 'victory', 'defeat'
  
  // Actions
  generateNewRun: () => {
    const floors = [];
    // Generate 3 floors for demo
    for (let i = 1; i <= 3; i++) {
      floors.push(generateFloor(i));
    }
    
    set({
      currentFloor: 1,
      currentRoom: null,
      floors,
      gameState: 'exploring'
    });
  },
  
  enterRoom: (roomId) => {
    const { floors, currentFloor } = get();
    const floor = floors.find(f => f.floorNumber === currentFloor);
    const room = floor?.rooms.find(r => r.id === roomId);
    
    // Allow entering if room is not completed OR if it's returnable
    if (room && (!room.completed || room.returnable)) {
      set({
        currentRoom: room,
        gameState: 'in-room'
      });
      
      // Load room state if it exists
      if (room.flippedTiles || room.matchedTiles) {
        // This will be handled by the game store
        return { room, loadState: true };
      }
    }
  },
  
  saveRoomState: (roomId, flippedTiles, matchedTiles) => {
    const { floors, currentFloor } = get();
    const floor = floors.find(f => f.floorNumber === currentFloor);
    const room = floor?.rooms.find(r => r.id === roomId);
    
    if (room) {
      room.flippedTiles = [...flippedTiles];
      room.matchedTiles = [...matchedTiles];
      room.roomState = matchedTiles.length === room.tiles.length ? 'completed' : 'incomplete';
      
      set({
        floors: [...floors]
      });
    }
  },
  
  completeRoom: (roomId) => {
    const { floors, currentFloor } = get();
    const floor = floors.find(f => f.floorNumber === currentFloor);
    const room = floor?.rooms.find(r => r.id === roomId);
    
    if (room) {
      // Mark room as completed
      room.completed = true;
      room.roomState = 'completed';
      
      // Check if floor is completed
      const allRoomsCompleted = floor.rooms.every(r => r.completed);
      if (allRoomsCompleted) {
        floor.completed = true;
      }
      
      set({
        currentRoom: null,
        gameState: 'exploring',
        floors: [...floors]
      });
    }
  },
  
  advanceFloor: () => {
    const { currentFloor, floors } = get();
    const nextFloor = currentFloor + 1;
    
    if (nextFloor <= floors.length) {
      set({
        currentFloor: nextFloor,
        currentRoom: null,
        gameState: 'exploring'
      });
    } else {
      // Victory condition
      set({
        gameState: 'victory'
      });
    }
  },
  
  getCurrentFloor: () => {
    const { floors, currentFloor } = get();
    return floors.find(f => f.floorNumber === currentFloor);
  },
  
  getAvailableRooms: () => {
    const { floors, currentFloor } = get();
    const floor = floors.find(f => f.floorNumber === currentFloor);
    return floor?.rooms.filter(r => !r.completed) || [];
  },
  
  getCompletedRooms: () => {
    const { floors, currentFloor } = get();
    const floor = floors.find(f => f.floorNumber === currentFloor);
    return floor?.rooms.filter(r => r.completed) || [];
  },
  
  resetRun: () => {
    set({
      currentFloor: 1,
      currentRoom: null,
      floors: [],
      gameState: 'exploring'
    });
  }
}));

export default useDungeonStore;

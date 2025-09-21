import { create } from 'zustand';
import { RoomTypes, createRoom, createFloor, Room, Floor, GameState } from '../types/gameTypes';
import { generateFloor } from '../algorithms/dungeonGenerator';

interface DungeonState {
  currentFloor: number;
  currentRoom: Room | null;
  floors: Floor[];
  gameState: GameState;
}

interface DungeonActions {
  generateNewRun: () => void;
  enterRoom: (roomId: string) => { room: Room; loadState: boolean } | undefined;
  saveRoomState: (roomId: string, flippedTiles: string[], matchedTiles: string[]) => void;
  completeRoom: (roomId: string) => void;
  advanceFloor: () => void;
  getCurrentFloor: () => Floor | undefined;
  getAvailableRooms: () => Room[];
  getCompletedRooms: () => Room[];
  resetRun: () => void;
}

type DungeonStore = DungeonState & DungeonActions;

const useDungeonStore = create<DungeonStore>((set, get) => ({
  // State
  currentFloor: 1,
  currentRoom: null,
  floors: [],
  gameState: 'exploring' as GameState,
  
  // Actions
  generateNewRun: () => {
    const floors: Floor[] = [];
    // Generate 3 floors for demo
    for (let i = 1; i <= 3; i++) {
      floors.push(generateFloor(i));
    }
    
    set({
      currentFloor: 1,
      currentRoom: null,
      floors,
      gameState: 'exploring' as GameState
    });
  },
  
  enterRoom: (roomId: string) => {
    const { floors, currentFloor } = get();
    const floor = floors.find(f => f.floorNumber === currentFloor);
    const room = floor?.rooms.find(r => r.id === roomId);
    
    // Allow entering if room is not completed OR if it's returnable
    if (room && (!room.completed || room.returnable)) {
      set({
        currentRoom: room,
        gameState: 'in-room' as GameState
      });
      
      // Load room state if it exists
      if (room.flippedTiles || room.matchedTiles) {
        // This will be handled by the game store
        return { room, loadState: true };
      }
    }
    
    return undefined;
  },
  
  saveRoomState: (roomId: string, flippedTiles: string[], matchedTiles: string[]) => {
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
  
  completeRoom: (roomId: string) => {
    const { floors, currentFloor } = get();
    const floor = floors.find(f => f.floorNumber === currentFloor);
    const room = floor?.rooms.find(r => r.id === roomId);
    
    if (room) {
      // Mark room as completed
      room.completed = true;
      room.roomState = 'completed';
      
      // Check if floor is completed
      if (floor) {
        const allRoomsCompleted = floor.rooms.every(r => r.completed);
        if (allRoomsCompleted) {
          floor.completed = true;
        }
      }
      
      set({
        currentRoom: null,
        gameState: 'exploring' as GameState,
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
        gameState: 'exploring' as GameState
      });
    } else {
      // Victory condition
      set({
        gameState: 'victory' as GameState
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
      gameState: 'exploring' as GameState
    });
  }
}));

export { useDungeonStore };
export default useDungeonStore;

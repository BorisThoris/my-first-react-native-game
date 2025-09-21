import { create } from 'zustand';
import { RoomTypes, createRoom, createFloor, Room, Floor, GameState } from '../types/gameTypes';
import { generateFloor } from '../algorithms/dungeonGenerator';
import { InteractiveElement } from '../types/interactiveTypes';
import { InteractiveGenerator } from '../algorithms/interactiveGenerator';

interface DungeonState {
  currentFloor: number;
  currentRoom: Room | null;
  floors: Floor[];
  gameState: GameState;
  floorInteractives: { [floorNumber: number]: InteractiveElement[] };
}

interface DungeonActions {
  generateNewRun: () => void;
  enterRoom: (roomId: string) => { room: Room; loadState: boolean } | undefined;
  saveRoomState: (roomId: string, flippedTiles: string[], matchedTiles: string[]) => void;
  completeRoom: (roomId: string) => void;
  advanceFloor: () => void;
  generateNextFloor: () => void;
  generateFloor: (floorNumber: number) => void;
  getCurrentFloor: () => Floor | undefined;
  getAvailableRooms: () => Room[];
  getCompletedRooms: () => Room[];
  getCurrentFloorInteractives: () => InteractiveElement[];
  interactWithElement: (elementId: string) => void;
  resetRun: () => void;
}

type DungeonStore = DungeonState & DungeonActions;

const useDungeonStore = create<DungeonStore>((set, get) => ({
  // State
  currentFloor: 1,
  currentRoom: null,
  floors: [],
  gameState: 'exploring' as GameState,
  floorInteractives: {},
  
  // Actions
  generateNewRun: () => {
    // Generate only the first floor initially
    const firstFloor = generateFloor(1);
    const interactives = InteractiveGenerator.generateFloorInteractives(1, firstFloor.rooms.length);
    
    set({
      currentFloor: 1,
      currentRoom: null,
      floors: [firstFloor],
      gameState: 'exploring' as GameState,
      floorInteractives: { 1: interactives }
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
      
      // Check if this was a boss room
      const isBossRoom = room.type === RoomTypes.BOSS;
      
      // Check if floor is completed
      if (floor) {
        const allRoomsCompleted = floor.rooms.every(r => r.completed);
        if (allRoomsCompleted) {
          floor.completed = true;
          floor.bossDefeated = isBossRoom;
        }
      }
      
      set({
        currentRoom: null,
        gameState: 'exploring' as GameState,
        floors: [...floors]
      });
      
      // If boss was defeated, generate next floor
      if (isBossRoom) {
        get().generateNextFloor();
      }
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
  
  generateNextFloor: (playerStats?: any) => {
    const { floors, currentFloor } = get();
    const nextFloorNumber = currentFloor + 1;
    
    // Generate the next floor with player stats
    const newFloor = generateFloor(nextFloorNumber, playerStats);
    
    set({
      floors: [...floors, newFloor],
      currentFloor: nextFloorNumber,
      currentRoom: null,
      gameState: 'exploring' as GameState
    });
  },
  
  generateFloor: (floorNumber: number, playerStats?: any) => {
    const { floors } = get();
    
    // Generate floor with player stats
    const newFloor = generateFloor(floorNumber, playerStats);
    
    set({
      floors: [...floors, newFloor]
    });
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
  
  getCurrentFloorInteractives: () => {
    const { floorInteractives, currentFloor } = get();
    return floorInteractives[currentFloor] || [];
  },
  
  interactWithElement: (elementId: string) => {
    const { floorInteractives, currentFloor } = get();
    const interactives = floorInteractives[currentFloor] || [];
    const element = interactives.find(e => e.id === elementId);
    
    if (element) {
      // Update element state
      element.state = element.type === 'treasure-chest' ? 'opened' : 'destroyed';
      
      set({
        floorInteractives: {
          ...floorInteractives,
          [currentFloor]: [...interactives]
        }
      });
    }
  },
  
  resetRun: () => {
    set({
      currentFloor: 1,
      currentRoom: null,
      floors: [],
      gameState: 'exploring' as GameState,
      floorInteractives: {}
    });
  }
}));

export { useDungeonStore };
export default useDungeonStore;

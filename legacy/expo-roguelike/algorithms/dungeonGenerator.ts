import { RoomTypes, createFloor, Floor } from '../types/gameTypes';
import { RoomGenerator } from './roomGenerator';
import { SpecialRoomGenerator } from './specialRoomGenerator';

const generateFloor = (floorNumber: number, playerStats?: any): Floor => {
  const rooms = [];
  
  // Base room count increases with floor
  const baseRoomCount = Math.min(3 + Math.floor(floorNumber / 2), 6);
  
  // Calculate base difficulty for this floor
  const baseDifficulty = Math.max(1, floorNumber);
  
  // Always start with a memory chamber (easier than other rooms)
  rooms.push(RoomGenerator.generateRoom(RoomTypes.MEMORY_CHAMBER, Math.max(1, baseDifficulty - 1), floorNumber));
  
  // Generate special rooms based on floor and player stats
  const specialRoomCount = Math.min(Math.floor(floorNumber / 2) + 1, 3);
  for (let i = 0; i < specialRoomCount; i++) {
    const specialRoom = SpecialRoomGenerator.generateSpecialRoom(floorNumber, playerStats || {});
    if (specialRoom) {
      rooms.push(specialRoom);
    }
  }
  
  // Fill remaining slots with memory chambers of varying difficulty
  let memoryChamberIndex = 1;
  while (rooms.length < baseRoomCount - 1) {
    // Vary difficulty: some easier, some harder than base floor difficulty
    const difficultyVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    const roomDifficulty = Math.max(1, baseDifficulty + difficultyVariation);
    
    rooms.push(RoomGenerator.generateRoom(RoomTypes.MEMORY_CHAMBER, roomDifficulty, floorNumber));
    memoryChamberIndex++;
  }
  
  // Always end with a boss room (harder than floor difficulty)
  rooms.push(RoomGenerator.generateRoom(RoomTypes.BOSS, baseDifficulty + 2, floorNumber));
  
  return createFloor(floorNumber, rooms);
};

const generateDungeon = (numFloors: number = 3): Floor[] => {
  const floors: Floor[] = [];
  for (let i = 1; i <= numFloors; i++) {
    floors.push(generateFloor(i));
  }
  return floors;
};

export {
  generateFloor,
  generateDungeon
};

import { RoomTypes, createFloor, Floor } from '../types/gameTypes';
import RoomGenerator from './roomGenerator';
import { SpecialRoomGenerator } from './specialRoomGenerator';

const generateFloor = (floorNumber: number, playerStats?: any): Floor => {
  const rooms = [];
  
  // Base room count increases with floor
  const baseRoomCount = Math.min(3 + Math.floor(floorNumber / 2), 6);
  
  // Always start with a memory chamber
  rooms.push(RoomGenerator.generateRoom(RoomTypes.MEMORY_CHAMBER, 1, floorNumber));
  
  // Generate special rooms based on floor and player stats
  const specialRoomCount = Math.min(Math.floor(floorNumber / 2) + 1, 3);
  for (let i = 0; i < specialRoomCount; i++) {
    const specialRoom = SpecialRoomGenerator.generateSpecialRoom(floorNumber, playerStats || {});
    if (specialRoom) {
      rooms.push(specialRoom);
    }
  }
  
  // Fill remaining slots with memory chambers
  while (rooms.length < baseRoomCount - 1) {
    rooms.push(RoomGenerator.generateRoom(RoomTypes.MEMORY_CHAMBER, rooms.length + 1, floorNumber));
  }
  
  // Always end with a boss room
  rooms.push(RoomGenerator.generateRoom(RoomTypes.BOSS, baseRoomCount, floorNumber));
  
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

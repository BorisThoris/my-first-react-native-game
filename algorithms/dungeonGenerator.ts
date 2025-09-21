import { RoomTypes, createFloor, Floor } from '../types/gameTypes';
import RoomGenerator from './roomGenerator';

const generateFloor = (floorNumber: number): Floor => {
  const rooms = [];
  
  // Generate rooms based on floor number
  if (floorNumber === 1) {
    // Tutorial floor - 3 rooms
    rooms.push(
      RoomGenerator.generateRoom(RoomTypes.MEMORY_CHAMBER, 1, floorNumber),
      RoomGenerator.generateRoom(RoomTypes.MEMORY_CHAMBER, 2, floorNumber),
      RoomGenerator.generateRoom(RoomTypes.BOSS, 3, floorNumber)
    );
  } else if (floorNumber === 2) {
    // Challenge floor - 3 rooms
    rooms.push(
      RoomGenerator.generateRoom(RoomTypes.MEMORY_CHAMBER, 3, floorNumber),
      RoomGenerator.generateRoom(RoomTypes.MEMORY_CHAMBER, 4, floorNumber),
      RoomGenerator.generateRoom(RoomTypes.BOSS, 5, floorNumber)
    );
  } else if (floorNumber === 3) {
    // Final floor - 3 rooms
    rooms.push(
      RoomGenerator.generateRoom(RoomTypes.MEMORY_CHAMBER, 5, floorNumber),
      RoomGenerator.generateRoom(RoomTypes.MEMORY_CHAMBER, 6, floorNumber),
      RoomGenerator.generateRoom(RoomTypes.BOSS, 7, floorNumber)
    );
  }
  
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

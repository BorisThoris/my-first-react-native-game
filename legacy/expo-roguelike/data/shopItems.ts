import { getShopItems } from './itemDatabase';

export const initializeShopItems = (floor: number = 1, roomType?: string): any[] => {
  // Get items suitable for shop based on floor and room type
  const availableItems = getShopItems(floor, roomType);
  
  // Return 3-5 random items for the shop
  const shopItemCount = Math.min(3 + Math.floor(floor / 2), 5);
  const shuffled = [...availableItems].sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, shopItemCount);
};

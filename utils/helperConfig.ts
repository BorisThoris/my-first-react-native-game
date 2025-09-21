import { RoomTypes } from '../types/gameTypes';

export interface HelperConfig {
  enabled: boolean;
  allowedHelpers: {
    extraLife: boolean;
    tileFlip: boolean;
    hint: boolean;
    timeExtension: boolean;
  };
  maxUses?: {
    extraLife?: number;
    tileFlip?: number;
    hint?: number;
    timeExtension?: number;
  };
  customMessages?: {
    extraLife?: string;
    tileFlip?: string;
    hint?: string;
    timeExtension?: string;
  };
}

export const DEFAULT_HELPER_CONFIG: HelperConfig = {
  enabled: true,
  allowedHelpers: {
    extraLife: false, // Extra lives are now automatic from streaks
    tileFlip: true,
    hint: true,
    timeExtension: true,
  },
};

export const ROOM_HELPER_CONFIGS: Record<string, HelperConfig> = {
  // Memory chambers - full helper support
  [RoomTypes.MEMORY_CHAMBER]: DEFAULT_HELPER_CONFIG,
  
  // Boss rooms - limited helpers for challenge
  [RoomTypes.BOSS]: {
    enabled: true,
    allowedHelpers: {
      extraLife: false, // Extra lives are now automatic from streaks
      tileFlip: false, // No tile flips for boss
      hint: true,
      timeExtension: false, // No time extension for boss
    },
    maxUses: {
      hint: 2,
    },
    customMessages: {
      hint: '💡 Boss Hint! The boss reveals a matching pair!',
    },
  },
  
  // Challenge rooms - full helper support with time extension
  [RoomTypes.CHALLENGE]: {
    enabled: true,
    allowedHelpers: {
      extraLife: false, // Extra lives are now automatic from streaks
      tileFlip: true,
      hint: true,
      timeExtension: true,
    },
    maxUses: {
      timeExtension: 3, // More time extensions for challenges
    },
  },
  
  // Devil rooms - limited helpers (devil doesn't help much)
  [RoomTypes.DEVIL_ROOM]: {
    enabled: true,
    allowedHelpers: {
      extraLife: false, // Extra lives are now automatic from streaks
      tileFlip: true,
      hint: true,
      timeExtension: false,
    },
    customMessages: {
      tileFlip: '😈 Devil Flip! The devil flips tiles for you...',
      hint: '😈 Devil Hint! The devil shows you a pair...',
    },
  },
  
  // Angel rooms - enhanced helpers (angels are helpful)
  [RoomTypes.ANGEL_ROOM]: {
    enabled: true,
    allowedHelpers: {
      extraLife: false, // Extra lives are now automatic from streaks
      tileFlip: true,
      hint: true,
      timeExtension: true,
    },
    maxUses: {
      tileFlip: 3,
      hint: 5,
      timeExtension: 2,
    },
    customMessages: {
      tileFlip: '😇 Angel Flip! The angels flip tiles for you!',
      hint: '😇 Angel Hint! The angels guide you to a match!',
      timeExtension: '😇 Angel Time! The angels extend your time!',
    },
  },
  
  // Treasure rooms - moderate helpers
  [RoomTypes.TREASURE]: {
    enabled: true,
    allowedHelpers: {
      extraLife: false, // Extra lives are now automatic from streaks
      tileFlip: true,
      hint: true,
      timeExtension: false,
    },
  },
  
  // Secret rooms - moderate helpers
  [RoomTypes.SECRET]: {
    enabled: true,
    allowedHelpers: {
      extraLife: false, // Extra lives are now automatic from streaks
      tileFlip: true,
      hint: true,
      timeExtension: false,
    },
  },
  
  // Library rooms - hint-focused helpers
  [RoomTypes.LIBRARY]: {
    enabled: true,
    allowedHelpers: {
      extraLife: false, // Extra lives are now automatic from streaks
      tileFlip: false,
      hint: true,
      timeExtension: false,
    },
    maxUses: {
      hint: 10, // Libraries give lots of hints
    },
    customMessages: {
      hint: '📚 Library Hint! Ancient knowledge reveals a match!',
    },
  },
  
  // Shop rooms - no helpers (you're shopping, not playing)
  [RoomTypes.SHOP]: {
    enabled: false,
    allowedHelpers: {
      extraLife: false,
      tileFlip: false,
      hint: false,
      timeExtension: false,
    },
  },
  
  // Trap rooms - no helpers (traps are meant to be hard)
  [RoomTypes.TRAP]: {
    enabled: false,
    allowedHelpers: {
      extraLife: false,
      tileFlip: false,
      hint: false,
      timeExtension: false,
    },
  },
  
  // Curse rooms - no helpers (curses make things harder)
  [RoomTypes.CURSE]: {
    enabled: false,
    allowedHelpers: {
      extraLife: false,
      tileFlip: false,
      hint: false,
      timeExtension: false,
    },
  },
  
  // Cursed rooms - no helpers
  [RoomTypes.CURSED_ROOM]: {
    enabled: false,
    allowedHelpers: {
      extraLife: false,
      tileFlip: false,
      hint: false,
      timeExtension: false,
    },
  },
};

export const getHelperConfigForRoom = (roomType: string): HelperConfig => {
  return ROOM_HELPER_CONFIGS[roomType] || DEFAULT_HELPER_CONFIG;
};

export const isHelperAllowed = (roomType: string, helperType: keyof HelperConfig['allowedHelpers']): boolean => {
  const config = getHelperConfigForRoom(roomType);
  return config.enabled && config.allowedHelpers[helperType];
};

export const getMaxUsesForHelper = (roomType: string, helperType: keyof HelperConfig['allowedHelpers']): number | undefined => {
  const config = getHelperConfigForRoom(roomType);
  return config.maxUses?.[helperType];
};

export const getCustomMessage = (roomType: string, helperType: keyof HelperConfig['allowedHelpers']): string | undefined => {
  const config = getHelperConfigForRoom(roomType);
  return config.customMessages?.[helperType];
};

// ============================================================================
// PROGRESSION SYSTEM - Player advancement and unlock tracking
// ============================================================================

import {
  ALL_COLLECTIBLES
} from './collectibleDatabase';
import { PlayerStats } from '../types/collectibleTypes';
import { 
  CollectibleType, 
  Rarity, 
  ItemCategory, 
  Item,
  Ability,
  Skill,
  Tome,
  Relic,
  canAcquire 
} from '../types/collectibleTypes';

// ============================================================================
// PROGRESSION TYPES
// ============================================================================

export interface ProgressionMilestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: MilestoneType;
  requirements: MilestoneRequirements;
  rewards: MilestoneReward[];
  unlocked: boolean;
  completed: boolean;
  completedAt?: number;
}

export interface MilestoneRequirements {
  level?: number;
  floor?: number;
  roomsCompleted?: number;
  itemsCollected?: number;
  specificItems?: string[];
  abilitiesLearned?: number;
  skillsMastered?: number;
  tomesRead?: number;
  relicsFound?: number;
  streak?: number;
  maxStreak?: number;
  points?: number;
  stats?: Partial<PlayerStats>;
  timePlayed?: number; // Minutes
}

export interface MilestoneReward {
  type: RewardType;
  value: any;
  description: string;
}

export enum MilestoneType {
  LEVEL = 'level',
  FLOOR = 'floor',
  COLLECTION = 'collection',
  MASTERY = 'mastery',
  EXPLORATION = 'exploration',
  ACHIEVEMENT = 'achievement',
  SECRET = 'secret'
}

export enum RewardType {
  POINTS = 'points',
  LIVES = 'lives',
  MAX_LIVES = 'max_lives',
  ITEM = 'item',
  ABILITY = 'ability',
  SKILL = 'skill',
  TOME = 'tome',
  RELIC = 'relic',
  TITLE = 'title',
  UNLOCK = 'unlock',
  CURRENCY = 'currency'
}

// ============================================================================
// PROGRESSION MILESTONES
// ============================================================================

export const PROGRESSION_MILESTONES: Omit<ProgressionMilestone, 'unlocked' | 'completed' | 'completedAt'>[] = [
  // Level Milestones
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    type: MilestoneType.LEVEL,
    requirements: { level: 5 },
    rewards: [
      { type: RewardType.POINTS, value: 500, description: '+500 Points' },
      { type: RewardType.ITEM, value: 'memory-boost', description: 'Memory Boost item' }
    ]
  },
  {
    id: 'level-10',
    name: 'Memory Adept',
    description: 'Reach level 10',
    icon: '🌟',
    type: MilestoneType.LEVEL,
    requirements: { level: 10 },
    rewards: [
      { type: RewardType.POINTS, value: 1000, description: '+1000 Points' },
      { type: RewardType.ABILITY, value: 'memory-flash', description: 'Memory Flash ability' }
    ]
  },
  {
    id: 'level-20',
    name: 'Memory Master',
    description: 'Reach level 20',
    icon: '💫',
    type: MilestoneType.LEVEL,
    requirements: { level: 20 },
    rewards: [
      { type: RewardType.POINTS, value: 2500, description: '+2500 Points' },
      { type: RewardType.RELIC, value: 'crown-of-memory', description: 'Crown of Memory relic' }
    ]
  },

  // Floor Milestones
  {
    id: 'floor-5',
    name: 'Dungeon Explorer',
    description: 'Reach floor 5',
    icon: '🏰',
    type: MilestoneType.FLOOR,
    requirements: { floor: 5 },
    rewards: [
      { type: RewardType.POINTS, value: 750, description: '+750 Points' },
      { type: RewardType.UNLOCK, value: 'relic-shop', description: 'Unlock Relic Shop' }
    ]
  },
  {
    id: 'floor-10',
    name: 'Dungeon Master',
    description: 'Reach floor 10',
    icon: '🏛️',
    type: MilestoneType.FLOOR,
    requirements: { floor: 10 },
    rewards: [
      { type: RewardType.POINTS, value: 2000, description: '+2000 Points' },
      { type: RewardType.UNLOCK, value: 'cursed-shop', description: 'Unlock Cursed Items Shop' }
    ]
  },
  {
    id: 'floor-20',
    name: 'Dungeon Legend',
    description: 'Reach floor 20',
    icon: '🏯',
    type: MilestoneType.FLOOR,
    requirements: { floor: 20 },
    rewards: [
      { type: RewardType.POINTS, value: 5000, description: '+5000 Points' },
      { type: RewardType.TITLE, value: 'Dungeon Legend', description: 'Legendary title' }
    ]
  },

  // Collection Milestones
  {
    id: 'collect-10-items',
    name: 'Item Collector',
    description: 'Collect 10 items',
    icon: '📦',
    type: MilestoneType.COLLECTION,
    requirements: { itemsCollected: 10 },
    rewards: [
      { type: RewardType.POINTS, value: 300, description: '+300 Points' },
      { type: RewardType.ITEM, value: 'lucky-coin', description: 'Lucky Coin item' }
    ]
  },
  {
    id: 'collect-50-items',
    name: 'Treasure Hunter',
    description: 'Collect 50 items',
    icon: '💎',
    type: MilestoneType.COLLECTION,
    requirements: { itemsCollected: 50 },
    rewards: [
      { type: RewardType.POINTS, value: 1500, description: '+1500 Points' },
      { type: RewardType.ITEM, value: 'memory-stone', description: 'Memory Stone item' }
    ]
  },
  {
    id: 'collect-100-items',
    name: 'Master Collector',
    description: 'Collect 100 items',
    icon: '👑',
    type: MilestoneType.COLLECTION,
    requirements: { itemsCollected: 100 },
    rewards: [
      { type: RewardType.POINTS, value: 3000, description: '+3000 Points' },
      { type: RewardType.RELIC, value: 'time-sandglass', description: 'Time Sandglass relic' }
    ]
  },

  // Mastery Milestones
  {
    id: 'learn-5-abilities',
    name: 'Ability Learner',
    description: 'Learn 5 abilities',
    icon: '✨',
    type: MilestoneType.MASTERY,
    requirements: { abilitiesLearned: 5 },
    rewards: [
      { type: RewardType.POINTS, value: 500, description: '+500 Points' },
      { type: RewardType.ABILITY, value: 'perfect-recall', description: 'Perfect Recall ability' }
    ]
  },
  {
    id: 'master-3-skills',
    name: 'Skill Master',
    description: 'Master 3 skills',
    icon: '📚',
    type: MilestoneType.MASTERY,
    requirements: { skillsMastered: 3 },
    rewards: [
      { type: RewardType.POINTS, value: 1000, description: '+1000 Points' },
      { type: RewardType.SKILL, value: 'memory-mastery', description: 'Memory Mastery skill' }
    ]
  },
  {
    id: 'read-10-tomes',
    name: 'Knowledge Seeker',
    description: 'Read 10 tomes',
    icon: '📖',
    type: MilestoneType.MASTERY,
    requirements: { tomesRead: 10 },
    rewards: [
      { type: RewardType.POINTS, value: 800, description: '+800 Points' },
      { type: RewardType.TOME, value: 'dungeon-mastery', description: 'Dungeon Mastery tome' }
    ]
  },

  // Exploration Milestones
  {
    id: 'complete-25-rooms',
    name: 'Room Explorer',
    description: 'Complete 25 rooms',
    icon: '🚪',
    type: MilestoneType.EXPLORATION,
    requirements: { roomsCompleted: 25 },
    rewards: [
      { type: RewardType.POINTS, value: 600, description: '+600 Points' },
      { type: RewardType.ITEM, value: 'golden-key', description: 'Golden Key item' }
    ]
  },
  {
    id: 'complete-100-rooms',
    name: 'Dungeon Veteran',
    description: 'Complete 100 rooms',
    icon: '🏆',
    type: MilestoneType.EXPLORATION,
    requirements: { roomsCompleted: 100 },
    rewards: [
      { type: RewardType.POINTS, value: 2500, description: '+2500 Points' },
      { type: RewardType.TITLE, value: 'Dungeon Veteran', description: 'Veteran title' }
    ]
  },
  {
    id: 'complete-500-rooms',
    name: 'Dungeon Legend',
    description: 'Complete 500 rooms',
    icon: '👑',
    type: MilestoneType.EXPLORATION,
    requirements: { roomsCompleted: 500 },
    rewards: [
      { type: RewardType.POINTS, value: 10000, description: '+10000 Points' },
      { type: RewardType.TITLE, value: 'Dungeon Legend', description: 'Legendary title' }
    ]
  },

  // Streak Milestones
  {
    id: 'streak-10',
    name: 'Hot Streak',
    description: 'Achieve a 10-streak',
    icon: '🔥',
    type: MilestoneType.ACHIEVEMENT,
    requirements: { streak: 10 },
    rewards: [
      { type: RewardType.POINTS, value: 400, description: '+400 Points' },
      { type: RewardType.ITEM, value: 'streak-master', description: 'Streak Master item' }
    ]
  },
  {
    id: 'streak-25',
    name: 'Inferno',
    description: 'Achieve a 25-streak',
    icon: '🌋',
    type: MilestoneType.ACHIEVEMENT,
    requirements: { streak: 25 },
    rewards: [
      { type: RewardType.POINTS, value: 1000, description: '+1000 Points' },
      { type: RewardType.ABILITY, value: 'time-freeze', description: 'Time Freeze ability' }
    ]
  },
  {
    id: 'streak-50',
    name: 'Unstoppable',
    description: 'Achieve a 50-streak',
    icon: '⚡',
    type: MilestoneType.ACHIEVEMENT,
    requirements: { streak: 50 },
    rewards: [
      { type: RewardType.POINTS, value: 2500, description: '+2500 Points' },
      { type: RewardType.TITLE, value: 'Unstoppable', description: 'Unstoppable title' }
    ]
  },

  // Secret Milestones
  {
    id: 'find-legendary',
    name: 'Legendary Finder',
    description: 'Find a legendary item',
    icon: '💎',
    type: MilestoneType.SECRET,
    requirements: { specificItems: ['crown-of-memory'] },
    rewards: [
      { type: RewardType.POINTS, value: 2000, description: '+2000 Points' },
      { type: RewardType.TITLE, value: 'Legendary Finder', description: 'Legendary Finder title' }
    ]
  },
  {
    id: 'find-cursed',
    name: 'Cursed Collector',
    description: 'Find a cursed item',
    icon: '💀',
    type: MilestoneType.SECRET,
    requirements: { specificItems: ['cursed-mirror'] },
    rewards: [
      { type: RewardType.POINTS, value: 1500, description: '+1500 Points' },
      { type: RewardType.UNLOCK, value: 'cursed-shop', description: 'Unlock Cursed Items Shop' }
    ]
  }
];

// ============================================================================
// PROGRESSION FUNCTIONS
// ============================================================================

export const checkMilestoneCompletion = (milestone: Omit<ProgressionMilestone, "unlocked" | "completed" | "completedAt">, playerStats: PlayerStats): boolean => {
  const req = milestone.requirements;
  
  if (req.level && playerStats.level < req.level) return false;
  if (req.floor && playerStats.currentFloor < req.floor) return false;
  if (req.roomsCompleted && playerStats.roomsCompleted < req.roomsCompleted) return false;
  if (req.itemsCollected && playerStats.items.length < req.itemsCollected) return false;
  if (req.abilitiesLearned && playerStats.abilities.length < req.abilitiesLearned) return false;
  if (req.skillsMastered && playerStats.skills.length < req.skillsMastered) return false;
  if (req.tomesRead && playerStats.tomes.length < req.tomesRead) return false;
  if (req.relicsFound && playerStats.relics.length < req.relicsFound) return false;
  if (req.streak && playerStats.streak < req.streak) return false;
  if (req.maxStreak && playerStats.maxStreak < req.maxStreak) return false;
  if (req.points && playerStats.points < req.points) return false;
  
  if (req.specificItems) {
    const hasAllItems = req.specificItems.every(itemId => 
      playerStats.items.some(item => item.id === itemId) ||
      playerStats.abilities.some(ability => ability.id === itemId) ||
      playerStats.skills.some(skill => skill.id === itemId) ||
      playerStats.tomes.some(tome => tome.id === itemId) ||
      playerStats.relics.some(relic => relic.id === itemId)
    );
    if (!hasAllItems) return false;
  }
  
  if (req.stats) {
    const stats = req.stats;
    if (stats.focus && playerStats.focus < stats.focus) return false;
    if (stats.recall && playerStats.recall < stats.recall) return false;
    if (stats.patternRecognition && playerStats.patternRecognition < stats.patternRecognition) return false;
    if (stats.concentration && playerStats.concentration < stats.concentration) return false;
  }
  
  return true;
};

export const getUnlockedMilestones = (playerStats: PlayerStats): ProgressionMilestone[] => {
  return PROGRESSION_MILESTONES.map(milestone => ({
    ...milestone,
    unlocked: checkMilestoneCompletion(milestone, playerStats),
    completed: false,
    completedAt: undefined
  }));
};

export const getCompletedMilestones = (playerStats: PlayerStats): ProgressionMilestone[] => {
  // This would be stored in player save data
  // For now, return empty array
  return [];
};

export const getAvailableMilestones = (playerStats: PlayerStats): ProgressionMilestone[] => {
  const unlocked = getUnlockedMilestones(playerStats);
  const completed = getCompletedMilestones(playerStats);
  
  return unlocked.filter(milestone => 
    !completed.some(completed => completed.id === milestone.id)
  );
};

export const completeMilestone = (milestone: ProgressionMilestone, playerStats: PlayerStats) => {
  if (!milestone.unlocked || milestone.completed) {
    return { success: false, message: 'Milestone not available' };
  }
  
  const newStats = { ...playerStats };
  
  // Apply rewards
  milestone.rewards.forEach(reward => {
    switch (reward.type) {
      case RewardType.POINTS:
        newStats.points += reward.value;
        break;
      case RewardType.LIVES:
        newStats.lives += reward.value;
        break;
      case RewardType.MAX_LIVES:
        newStats.maxLives += reward.value;
        break;
      case RewardType.ITEM:
        // Add item to inventory
        const item = ALL_COLLECTIBLES.find(c => c.id === reward.value);
        if (item && (item.type === CollectibleType.ITEM || item.type === CollectibleType.CONSUMABLE || item.type === CollectibleType.EQUIPMENT || item.type === CollectibleType.TRINKET)) {
          newStats.items.push(item as Item);
        }
        break;
      case RewardType.ABILITY:
        // Add ability to inventory
        const ability = ALL_COLLECTIBLES.find(c => c.id === reward.value);
        if (ability && (ability.type === CollectibleType.ABILITY || ability.type === CollectibleType.TALENT)) {
          newStats.abilities.push(ability as Ability);
        }
        break;
      case RewardType.SKILL:
        // Add skill to inventory
        const skill = ALL_COLLECTIBLES.find(c => c.id === reward.value);
        if (skill && skill.type === CollectibleType.SKILL) {
          newStats.skills.push(skill as Skill);
        }
        break;
      case RewardType.TOME:
        // Add tome to inventory
        const tome = ALL_COLLECTIBLES.find(c => c.id === reward.value);
        if (tome && (tome.type === CollectibleType.TOME || tome.type === CollectibleType.SCROLL || tome.type === CollectibleType.MANUAL)) {
          newStats.tomes.push(tome as Tome);
        }
        break;
      case RewardType.RELIC:
        // Add relic to inventory
        const relic = ALL_COLLECTIBLES.find(c => c.id === reward.value);
        if (relic && (relic.type === CollectibleType.RELIC || relic.type === CollectibleType.ARTIFACT || relic.type === CollectibleType.CURSED_ITEM)) {
          newStats.relics.push(relic as Relic);
        }
        break;
    }
  });
  
  return {
    success: true,
    message: `Milestone completed: ${milestone.name}`,
    newStats,
    rewards: milestone.rewards
  };
};

// ============================================================================
// PROGRESSION UTILITIES
// ============================================================================

export const getProgressionStats = (playerStats: PlayerStats) => {
  const unlocked = getUnlockedMilestones(playerStats);
  const completed = getCompletedMilestones(playerStats);
  const available = getAvailableMilestones(playerStats);
  
  return {
    total: PROGRESSION_MILESTONES.length,
    unlocked: unlocked.length,
    completed: completed.length,
    available: available.length,
    completionRate: (completed.length / PROGRESSION_MILESTONES.length) * 100
  };
};

export const getMilestoneById = (milestoneId: string): ProgressionMilestone | null => {
  const milestone = PROGRESSION_MILESTONES.find(m => m.id === milestoneId);
  if (!milestone) return null;
  
  return {
    ...milestone,
    unlocked: false,
    completed: false,
    completedAt: undefined
  };
};

export const getMilestonesByType = (type: MilestoneType): ProgressionMilestone[] => {
  return PROGRESSION_MILESTONES
    .filter(m => m.type === type)
    .map(milestone => ({
      ...milestone,
      unlocked: false,
      completed: false,
      completedAt: undefined
    }));
};

export const getNextMilestone = (playerStats: PlayerStats): ProgressionMilestone | null => {
  const available = getAvailableMilestones(playerStats);
  if (available.length === 0) return null;
  
  // Sort by requirements difficulty and return the easiest one
  return available.sort((a, b) => {
    const aDiff = (a.requirements.level || 0) + (a.requirements.floor || 0) + (a.requirements.roomsCompleted || 0);
    const bDiff = (b.requirements.level || 0) + (b.requirements.floor || 0) + (b.requirements.roomsCompleted || 0);
    return aDiff - bDiff;
  })[0];
};

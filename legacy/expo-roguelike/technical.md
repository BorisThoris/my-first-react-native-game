# Memory Dungeon - Demo Technical Specification

> **Status: archived roadmap.** This file describes an old Expo-era demo plan. The live product is the Electron app in the repository root. Checklist items below are **historical**, not current engineering tasks.

## Demo Scope & Goals

**Objective**: Create a playable demo that proves the core concept of a roguelike memory game with dungeon exploration.

**Target**: 2-3 floors, 3-4 rooms per floor, basic progression system

**Platform**: React Native (current setup) with focus on mobile experience

## Core Demo Features

### 1. Dungeon Structure
```
Floor 1 (Tutorial)
├── Room 1: Basic Memory Match (2x2 grid)
├── Room 2: Memory Match (3x3 grid) 
├── Room 3: Boss Room (4x4 grid)
└── Exit to Floor 2

Floor 2 (Challenge)
├── Room 1: Memory Match (3x3 grid)
├── Room 2: Memory Match (4x4 grid)
├── Room 3: Boss Room (5x5 grid)
└── Exit to Floor 3

Floor 3 (Final)
├── Room 1: Memory Match (4x4 grid)
├── Room 2: Memory Match (5x5 grid)
├── Room 3: Final Boss (6x6 grid)
└── Victory Screen
```

### 2. Room Types (Demo)
- **Memory Chambers**: Standard tile matching rooms
- **Boss Rooms**: Larger grids with special mechanics
- **Treasure Rooms**: Reward rooms (optional for demo)

### 3. Basic Progression
- **Lives System**: 3 lives per run (lose 1 per mismatch)
- **Floor Progression**: Complete all rooms to advance
- **Basic Stats**: Focus (tile flip speed), Recall (reset time)
- **Simple Items**: 2-3 basic memory aids

## Technical Architecture

### File Structure
```
app/
├── DungeonExplorer/           # New main game component
│   ├── index.jsx
│   ├── styles.jsx
│   └── components/
│       ├── DungeonMap/        # Floor overview
│       ├── RoomView/          # Individual room
│       ├── PlayerStats/       # Lives, stats display
│       └── ItemInventory/     # Basic item display
├── MemoryGame/               # Existing (refactored)
│   └── [existing components]
└── MainMenu/                 # Updated with new game mode
    └── [existing components]
```

### State Management Updates

#### New Context: DungeonContext
```javascript
// contexts/DungeonContext.jsx
const DungeonContext = createContext();

const initialDungeonState = {
  currentFloor: 1,
  currentRoom: 0,
  floors: [], // Generated floor data
  playerStats: {
    lives: 3,
    focus: 0,
    recall: 0,
    items: []
  },
  gameState: 'exploring' // 'exploring', 'in-room', 'victory', 'defeat'
};
```

#### Enhanced GameContext
```javascript
// Update existing GameContext for room-based play
const enhancedGameState = {
  ...existingState,
  roomType: 'memory-chamber', // 'memory-chamber', 'boss', 'treasure'
  roomCompleted: false,
  roomReward: null
};
```

### Core Components

#### 1. DungeonMap Component
```javascript
// Displays current floor layout
// Shows completed/incomplete rooms
// Handles room selection
// Navigation between floors
```

#### 2. RoomView Component
```javascript
// Wraps existing MemoryGame logic
// Adds room-specific mechanics
// Handles room completion
// Manages room-to-room transitions
```

#### 3. PlayerStats Component
```javascript
// Shows lives, current stats
// Displays active items
// Progress indicators
```

#### 4. ItemInventory Component
```javascript
// Basic item display
// Item usage (for demo: passive only)
// Stat modifications
```

## Demo Implementation Plan

### Phase 1: Core Dungeon Structure (Week 1)
- [ ] Create DungeonContext and state management
- [ ] Build DungeonMap component
- [ ] Implement basic floor generation
- [ ] Create room navigation system
- [ ] Integrate with existing MemoryGame

### Phase 2: Room Integration (Week 2)
- [ ] Refactor MemoryGame for room-based play
- [ ] Add room completion logic
- [ ] Implement lives system across rooms
- [ ] Create room transition animations
- [ ] Add basic player stats

### Phase 3: Progression & Polish (Week 3)
- [ ] Implement basic item system
- [ ] Add floor progression
- [ ] Create boss room mechanics
- [ ] Add victory/defeat screens
- [ ] Polish UI and animations

## Data Structures

### Floor Generation
```javascript
const generateFloor = (floorNumber) => {
  return {
    floorNumber,
    rooms: [
      {
        id: 'room-1',
        type: 'memory-chamber',
        gridSize: 2 + floorNumber,
        completed: false,
        reward: null
      },
      {
        id: 'room-2', 
        type: 'memory-chamber',
        gridSize: 3 + floorNumber,
        completed: false,
        reward: null
      },
      {
        id: 'boss-room',
        type: 'boss',
        gridSize: 4 + floorNumber,
        completed: false,
        reward: generateItem()
      }
    ]
  };
};
```

### Player Stats
```javascript
const playerStats = {
  lives: 3,
  maxLives: 3,
  focus: 0,      // Affects tile flip speed
  recall: 0,     // Affects reset time
  items: [],     // Array of item objects
  currentFloor: 1,
  roomsCompleted: 0
};
```

### Item System (Basic)
```javascript
const items = {
  'focus-crystal': {
    name: 'Focus Crystal',
    description: 'Increases tile flip speed',
    effect: { focus: 10 },
    type: 'passive'
  },
  'recall-stone': {
    name: 'Recall Stone', 
    description: 'Increases tile reset time',
    effect: { recall: 15 },
    type: 'passive'
  },
  'life-gem': {
    name: 'Life Gem',
    description: 'Restores 1 life',
    effect: { lives: 1 },
    type: 'consumable'
  }
};
```

## UI/UX Design

### Navigation Flow
1. **Main Menu** → Select "Dungeon Mode"
2. **Dungeon Map** → Select room to enter
3. **Room View** → Play memory game
4. **Room Complete** → Return to map or advance floor
5. **Victory/Defeat** → Return to main menu

### Visual Design
- **Dungeon Theme**: Dark, atmospheric backgrounds
- **Room Icons**: Different styles for completed/incomplete rooms
- **Stat Display**: Clean, readable UI elements
- **Transitions**: Smooth animations between states

## Performance Considerations

### Memory Management
- Generate floors on-demand
- Clean up completed room states
- Optimize tile rendering for larger grids

### Mobile Optimization
- Touch-friendly room selection
- Responsive grid sizing
- Smooth 60fps animations
- Battery-efficient rendering

## Testing Strategy

### Core Functionality
- [ ] Room navigation works correctly
- [ ] Memory game integrates properly
- [ ] Lives system functions across rooms
- [ ] Floor progression works
- [ ] Items affect gameplay

### User Experience
- [ ] Intuitive navigation
- [ ] Clear visual feedback
- [ ] Appropriate difficulty curve
- [ ] Smooth performance

### Edge Cases
- [ ] What happens when lives reach 0?
- [ ] Can player return to completed rooms?
- [ ] How does item usage work?
- [ ] What if player closes app mid-room?

## Success Metrics

### Technical
- Stable 60fps gameplay
- <2 second room transitions
- No memory leaks
- Cross-platform compatibility

### Gameplay
- 5-10 minute demo playtime
- Clear progression feel
- Engaging difficulty curve
- Intuitive controls

## Future Expansion Points

### Easy Additions
- More room types
- Additional items
- New floor themes
- Sound effects

### Major Features
- Save/load system
- Meta-progression
- More complex item interactions
- Achievement system

---

*This technical specification focuses on creating a playable demo that validates the core concept while maintaining the existing codebase structure.*


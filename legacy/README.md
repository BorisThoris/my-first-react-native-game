# Legacy Code

This folder contains the original memory game implementation that served as the foundation for the new roguelike memory game.

## Structure

- `app/MemoryGame/` - Original memory game components
- `app/MainMenu/` - Original main menu
- `contexts/` - Original React Context implementation
- `hooks/` - Custom hooks for the original game
- `reducers/` - Redux-style reducers

## Purpose

This code is preserved for:
- Reference when implementing similar features in the new architecture
- Understanding the original game mechanics
- Potential reuse of specific components or logic

## New Architecture

The new game uses:
- **Zustand** for state management (instead of Context + Reducers)
- **Matrix-based room generation** (instead of simple tile arrays)
- **Modular component architecture** (instead of tightly coupled components)
- **Procedural dungeon generation** (instead of linear level progression)


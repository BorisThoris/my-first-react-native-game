export enum MemoryGameType {
    CLASSIC_PAIRS = 'classic-pairs',
    SEQUENCE_MEMORY = 'sequence-memory',
    PATTERN_MEMORY = 'pattern-memory',
    COLOR_MEMORY = 'color-memory',
    NUMBER_MEMORY = 'number-memory'
}

export interface MemoryGameConfig {
    type: MemoryGameType;
    title: string;
    subtitle: string;
    instruction: string;
    difficulty: number;
}

export const MEMORY_GAME_CONFIGS: Record<MemoryGameType, Omit<MemoryGameConfig, 'difficulty'>> = {
    [MemoryGameType.CLASSIC_PAIRS]: {
        type: MemoryGameType.CLASSIC_PAIRS,
        title: '🧩 Classic Pairs',
        subtitle: 'Find matching pairs to clear the room!',
        instruction: 'Find matching pairs to clear the room!'
    },
    [MemoryGameType.SEQUENCE_MEMORY]: {
        type: MemoryGameType.SEQUENCE_MEMORY,
        title: '🎵 Sequence Memory',
        subtitle: 'Watch and repeat the sequence!',
        instruction: 'Watch the sequence carefully, then repeat it!'
    },
    [MemoryGameType.PATTERN_MEMORY]: {
        type: MemoryGameType.PATTERN_MEMORY,
        title: '🔮 Pattern Memory',
        subtitle: 'Recreate the pattern!',
        instruction: 'Watch the pattern and recreate it!'
    },
    [MemoryGameType.COLOR_MEMORY]: {
        type: MemoryGameType.COLOR_MEMORY,
        title: '🎨 Color Memory',
        subtitle: 'Remember the color sequence!',
        instruction: 'Watch the colors and repeat the sequence!'
    },
    [MemoryGameType.NUMBER_MEMORY]: {
        type: MemoryGameType.NUMBER_MEMORY,
        title: '🔢 Number Memory',
        subtitle: 'Memorize the number!',
        instruction: 'Memorize the number and enter it!'
    }
};

export const getRandomGameType = (): MemoryGameType => {
    const gameTypes = Object.values(MemoryGameType);
    return gameTypes[Math.floor(Math.random() * gameTypes.length)];
};

export const getGameTypeForDifficulty = (difficulty: number): MemoryGameType => {
    // Easier games for lower difficulty, harder games for higher difficulty
    if (difficulty <= 2) {
        return Math.random() > 0.5 ? MemoryGameType.CLASSIC_PAIRS : MemoryGameType.COLOR_MEMORY;
    } else if (difficulty <= 4) {
        const easyGames = [MemoryGameType.CLASSIC_PAIRS, MemoryGameType.COLOR_MEMORY, MemoryGameType.NUMBER_MEMORY];
        return easyGames[Math.floor(Math.random() * easyGames.length)];
    } else if (difficulty <= 6) {
        const mediumGames = [MemoryGameType.SEQUENCE_MEMORY, MemoryGameType.PATTERN_MEMORY, MemoryGameType.NUMBER_MEMORY];
        return mediumGames[Math.floor(Math.random() * mediumGames.length)];
    } else {
        const hardGames = [MemoryGameType.SEQUENCE_MEMORY, MemoryGameType.PATTERN_MEMORY];
        return hardGames[Math.floor(Math.random() * hardGames.length)];
    }
};

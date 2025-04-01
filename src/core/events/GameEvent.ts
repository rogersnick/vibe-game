import { Inventory } from "../../entities/Inventory";

export enum GameEventType {
    // Player events
    PLAYER_MOVE = 'PLAYER_MOVE',
    PLAYER_STOP = 'PLAYER_STOP',
    PLAYER_ENERGY_CHANGE = 'PLAYER_ENERGY_CHANGE',
    PLAYER_DEATH = 'PLAYER_DEATH',
    
    // Collectible events
    COLLECTIBLE_SPAWNED = 'COLLECTIBLE_SPAWNED',
    COLLECTIBLE_COLLECTED = 'COLLECTIBLE_COLLECTED',
    
    // Achievement events
    ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
    ACHIEVEMENT_PROGRESS = 'ACHIEVEMENT_PROGRESS',
    
    // Game state events
    GAME_OVER = 'GAME_OVER',
    GAME_START = 'GAME_START',
}

export interface GameEvent {
    type: GameEventType;
    data?: any;
    timestamp: number;
}

export interface GameEventCallback {
    (event: GameEvent): void;
}

export interface GameOverEventData {
    inventory: Inventory;
    reason?: string;
}

export interface PlayerMoveEventData {
    dx: number;
    dy: number;
    isRunning: boolean;
    direction: string;
}

export interface PlayerStopEventData {
    lastDirection: string;
}

export interface PlayerEnergyChangeEventData {
    currentEnergy: number;
    maxEnergy: number;
    changeAmount: number;
    isDrain: boolean; // true if energy was drained, false if energy was added
}

export interface PlayerDeathEventData {
    reason: string;
    lastDirection: string;
    finalEnergy: number;
}

export interface CollectibleSpawnedEventData {
    x: number;
    y: number;
    type: string; // We can expand this later with different collectible types
}

export interface CollectibleCollectedEventData {
    x: number;
    y: number;
    type: string;
    totalCollected: number;
}

export interface GameStartEventData {
    playerPosition: { x: number; y: number };
    initialCollectibles: number;
    difficulty?: string; // We can use this later if we add difficulty levels
}

export interface AchievementUnlockedEventData {
    achievementId: string;
    title: string;
    description: string;
    timestamp: number;
}

export interface AchievementProgressEventData {
    achievementId: string;
    currentProgress: number;
    targetProgress: number;
} 
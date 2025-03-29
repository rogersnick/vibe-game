export interface Achievement {
    id: string;
    title: string;
    description: string;
    isUnlocked: boolean;
    icon?: string;
    progress?: {
        current: number;
        target: number;
    };
}

export enum AchievementEvent {
    SCORE_REACHED = 'SCORE_REACHED',
    LEVEL_COMPLETED = 'LEVEL_COMPLETED',
    COLLECTIBLE_FOUND = 'COLLECTIBLE_FOUND',
    ENEMY_DEFEATED = 'ENEMY_DEFEATED',
    PLAYER_STEP = 'PLAYER_STEP',
    // Add more events as needed
}

export interface AchievementSubject {
    addAchievementObserver(observer: AchievementObserver): void;

    removeAchievementObserver(observer: AchievementObserver): void;

    notifyAchievementObservers(event: AchievementEvent, data?: any): void;
}

export interface AchievementObserver {
    onAchievementEvent(event: AchievementEvent, data?: any): void;

    onAchievementUnlocked(achievement: Achievement): void;
} 
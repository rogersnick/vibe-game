import { Achievement, AchievementEvent, AchievementObserver } from './types';
import createDebug from 'debug';
import { ServiceLocator } from '../../core/services/ServiceLocator';
import { GameEventType, AchievementUnlockedEventData, AchievementProgressEventData } from '../../core/events/GameEvent';
const debug = createDebug('vibe:achievements');

export class AchievementManager implements AchievementObserver {
    private achievements: Map<string, Achievement>;
    private onUnlockCallback?: (achievement: Achievement) => void;
    private stepCount: number = 0;

    constructor() {
        this.achievements = new Map();
        this.initializeAchievements();
    }

    private getEventQueue() {
        return ServiceLocator.getInstance().getEventQueue();
    }

    private initializeAchievements(): void {
        // Add our first achievement: "First Steps"
        this.achievements.set('first_steps', {
            id: 'first_steps',
            title: 'First Steps',
            description: 'Complete your first steps',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 1
            }
        });

        // Add step counter achievements
        this.achievements.set('groove_starter', {
            id: 'groove_starter',
            title: 'Groove Starter',
            description: 'Move 25 steps',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 25
            }
        });

        this.achievements.set('rhythm_master', {
            id: 'rhythm_master',
            title: 'Rhythm Master',
            description: 'Move 600 steps',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 600
            }
        });

        this.achievements.set('dance_machine', {
            id: 'dance_machine',
            title: 'Dance Machine',
            description: 'Move 1000 steps',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 1000
            }
        });

        this.achievements.set('eternal_dancer', {
            id: 'eternal_dancer',
            title: 'Eternal Dancer',
            description: 'Move 10000 steps',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 10000
            }
        });

        // Add item collection achievements
        this.achievements.set('good_vibes', {
            id: 'good_vibes',
            title: 'Good Vibes',
            description: 'Collect 5 items',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 5
            }
        });

        this.achievements.set('radiant_vibes', {
            id: 'radiant_vibes',
            title: 'Radiant Vibes',
            description: 'Collect 15 items',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 15
            }
        });

        this.achievements.set('immaculate_vibes', {
            id: 'immaculate_vibes',
            title: 'Immaculate Vibes',
            description: 'Collect 30 items',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 30
            }
        });

        this.achievements.set('transcendent_vibes', {
            id: 'transcendent_vibes',
            title: 'Transcendent Vibes',
            description: 'Collect 50 items',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 50
            }
        });

        // Emit initial progress events for all achievements
        this.achievements.forEach(achievement => {
            if (achievement.progress) {
                const progressData: AchievementProgressEventData = {
                    achievementId: achievement.id,
                    currentProgress: achievement.progress.current,
                    targetProgress: achievement.progress.target
                };
                this.getEventQueue().emit(GameEventType.ACHIEVEMENT_PROGRESS, progressData);
            }
        });
    }

    public setOnUnlockCallback(callback: (achievement: Achievement) => void): void {
        this.onUnlockCallback = callback;
    }

    public onAchievementEvent(event: AchievementEvent, data?: any): void {
        debug('Achievement event received:', event, data);
        switch (event) {
            case AchievementEvent.LEVEL_COMPLETED:
                this.handleLevelCompleted(data);
                break;
            case AchievementEvent.PLAYER_STEP:
                this.handlePlayerStep();
                break;
            case AchievementEvent.COLLECTIBLE_FOUND:
                this.handleCollectibleFound(data);
                break;
            // Add more event handlers as needed
        }
    }

    private handleLevelCompleted(data: any): void {
        const firstSteps = this.achievements.get('first_steps');
        if (firstSteps && !firstSteps.isUnlocked) {
            firstSteps.progress!.current = 1;
            this.unlockAchievement(firstSteps);
        }
    }

    private handlePlayerStep(): void {
        this.stepCount++;
        
        // Update progress for all step-based achievements
        const stepAchievements = [
            'groove_starter',
            'rhythm_master',
            'dance_machine',
            'eternal_dancer'
        ];

        stepAchievements.forEach(achievementId => {
            const achievement = this.achievements.get(achievementId);
            if (achievement && !achievement.isUnlocked) {
                achievement.progress!.current = this.stepCount;
                
                // Emit progress event
                const progressData: AchievementProgressEventData = {
                    achievementId: achievement.id,
                    currentProgress: achievement.progress!.current,
                    targetProgress: achievement.progress!.target
                };
                this.getEventQueue().emit(GameEventType.ACHIEVEMENT_PROGRESS, progressData);

                if (this.stepCount >= achievement.progress!.target) {
                    achievement.isUnlocked = true;
                    this.onAchievementUnlocked(achievement);
                }
            }
        });
    }

    private handleCollectibleFound(data: any): void {
        debug('AchievementManager: Collectible found event received');
        debug('AchievementManager: Current item count from data:', data.itemCount);

        // List of all collection-based achievements
        const collectionAchievements = [
            'good_vibes',
            'radiant_vibes',
            'immaculate_vibes',
            'transcendent_vibes'
        ];

        collectionAchievements.forEach(achievementId => {
            const achievement = this.achievements.get(achievementId);
            if (achievement && achievement.progress) {
                achievement.progress.current = data.itemCount;
                debug(`AchievementManager: Updated ${achievementId} progress:`, achievement.progress.current, '/', achievement.progress.target);
                
                // Emit progress event
                const progressData: AchievementProgressEventData = {
                    achievementId: achievement.id,
                    currentProgress: achievement.progress.current,
                    targetProgress: achievement.progress.target
                };
                this.getEventQueue().emit(GameEventType.ACHIEVEMENT_PROGRESS, progressData);
                
                if (achievement.progress.current >= achievement.progress.target && !achievement.isUnlocked) {
                    debug(`AchievementManager: Unlocking ${achievementId} achievement!`);
                    this.unlockAchievement(achievement);
                }
            }
        });
    }

    private unlockAchievement(achievement: Achievement): void {
        if (!achievement.isUnlocked) {
            achievement.isUnlocked = true;
            achievement.unlockedAt = Date.now();
            debug('Achievement unlocked:', achievement.title);

            // Emit achievement unlocked event
            const unlockData: AchievementUnlockedEventData = {
                achievementId: achievement.id,
                title: achievement.title,
                description: achievement.description,
                timestamp: achievement.unlockedAt
            };
            this.getEventQueue().emit(GameEventType.ACHIEVEMENT_UNLOCKED, unlockData);

            if (this.onUnlockCallback) {
                this.onUnlockCallback(achievement);
            }
        }
    }

    public onAchievementUnlocked(achievement: Achievement): void {
        debug('Achievement unlocked:', achievement.title);
        
        // Emit achievement unlocked event
        const unlockData: AchievementUnlockedEventData = {
            achievementId: achievement.id,
            title: achievement.title,
            description: achievement.description,
            timestamp: achievement.unlockedAt || Date.now()
        };
        this.getEventQueue().emit(GameEventType.ACHIEVEMENT_UNLOCKED, unlockData);

        if (this.onUnlockCallback) {
            this.onUnlockCallback(achievement);
        }
    }

    public getAchievements(): Achievement[] {
        return Array.from(this.achievements.values());
    }

    public getUnlockedAchievements(): Achievement[] {
        return this.getAchievements().filter(a => a.isUnlocked);
    }

    public getStepCount(): number {
        return this.stepCount;
    }
} 
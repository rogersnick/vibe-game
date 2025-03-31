import { Achievement, AchievementEvent, AchievementObserver } from './types';
import createDebug from 'debug';
const debug = createDebug('vibe:achievements');

export class AchievementManager implements AchievementObserver {
    private achievements: Map<string, Achievement>;
    private onUnlockCallback?: (achievement: Achievement) => void;
    private stepCount: number = 0;

    constructor() {
        this.achievements = new Map();
        this.initializeAchievements();
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
        this.achievements.set('step_counter', {
            id: 'step_counter',
            title: 'Step Counter',
            description: 'Move 25 steps',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 25
            }
        });

        this.achievements.set('1k_club', {
            id: '1k_club',
            title: '1K Club',
            description: 'Move 1000 steps',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 1000
            }
        });

        this.achievements.set('explorer', {
            id: 'explorer',
            title: 'Explorer',
            description: 'Move 600 steps',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 600
            }
        });

        this.achievements.set('marathon_runner', {
            id: 'marathon_runner',
            title: 'Marathon Runner',
            description: 'Move 10000 steps',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 10000
            }
        });

        // Add item collection achievements
        this.achievements.set('collector', {
            id: 'collector',
            title: 'Collector',
            description: 'Collect 5 items',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 5
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
            firstSteps.isUnlocked = true;
            firstSteps.progress!.current = 1;
            this.onAchievementUnlocked(firstSteps);
        }
    }

    private handlePlayerStep(): void {
        this.stepCount++;
        
        // Update progress for all step-based achievements
        const stepAchievements = [
            'step_counter',
            '1k_club',
            'explorer',
            'marathon_runner'
        ];

        stepAchievements.forEach(achievementId => {
            const achievement = this.achievements.get(achievementId);
            if (achievement && !achievement.isUnlocked) {
                achievement.progress!.current = this.stepCount;
                if (this.stepCount >= achievement.progress!.target) {
                    achievement.isUnlocked = true;
                    this.onAchievementUnlocked(achievement);
                }
            }
        });
    }

    private handleCollectibleFound(data: any): void {
        debug('Collectible found, current count:', data.itemCount);
        const collector = this.achievements.get('collector');
        if (collector && collector.progress) {
            collector.progress.current = data.itemCount;
            debug('Collector achievement progress:', collector.progress.current, '/', collector.progress.target);
            
            if (collector.progress.current >= collector.progress.target && !collector.isUnlocked) {
                debug('Unlocking collector achievement!');
                this.unlockAchievement(collector);
            }
        }
    }

    private unlockAchievement(achievement: Achievement): void {
        if (!achievement.isUnlocked) {
            achievement.isUnlocked = true;
            debug('Achievement unlocked:', achievement.title);
            if (this.onUnlockCallback) {
                this.onUnlockCallback(achievement);
            }
        }
    }

    public onAchievementUnlocked(achievement: Achievement): void {
        console.log('Achievement unlocked:', achievement.title); // Debug log
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
import { Achievement, AchievementEvent, AchievementObserver } from './types';

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
            description: 'Complete your first level',
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

        this.achievements.set('explorer', {
            id: 'explorer',
            title: 'Explorer',
            description: 'Move 1000 steps',
            isUnlocked: false,
            progress: {
                current: 0,
                target: 1000
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
    }

    public setOnUnlockCallback(callback: (achievement: Achievement) => void): void {
        this.onUnlockCallback = callback;
    }

    public onAchievementEvent(event: AchievementEvent, data?: any): void {
        switch (event) {
            case AchievementEvent.LEVEL_COMPLETED:
                this.handleLevelCompleted(data);
                break;
            case AchievementEvent.PLAYER_STEP:
                this.handlePlayerStep();
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
            'wanderer',
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

    public onAchievementUnlocked(achievement: Achievement): void {
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
import {Achievement, AchievementEvent, AchievementObserver} from './types';

export class AchievementManager implements AchievementObserver {
    private achievements: Map<string, Achievement>;
    private onUnlockCallback?: (achievement: Achievement) => void;
    private stepCount: number = 0;

    constructor() {
        this.achievements = new Map();
        this.initializeAchievements();
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

        // Add step counter achievement
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
        const stepAchievement = this.achievements.get('step_counter');
        if (stepAchievement && !stepAchievement.isUnlocked) {
            stepAchievement.progress!.current = this.stepCount;
            if (this.stepCount >= stepAchievement.progress!.target) {
                stepAchievement.isUnlocked = true;
                this.onAchievementUnlocked(stepAchievement);
            }
        }
    }
} 
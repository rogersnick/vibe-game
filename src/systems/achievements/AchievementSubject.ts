import {AchievementEvent, AchievementObserver, AchievementSubject} from './types';

export abstract class BaseAchievementSubject implements AchievementSubject {
    private observers: AchievementObserver[] = [];

    public addAchievementObserver(observer: AchievementObserver): void {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
        }
    }

    public removeAchievementObserver(observer: AchievementObserver): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    public notifyAchievementObservers(event: AchievementEvent, data?: any): void {
        this.observers.forEach(observer => {
            observer.onAchievementEvent(event, data);
        });
    }
} 
import { Scene } from 'phaser';
import { BaseAchievementSubject } from '../systems/achievements/AchievementSubject';
import { AchievementEvent } from '../systems/achievements/types';

export class Player extends BaseAchievementSubject {
    private scene: Scene;
    private speed: number = 200;
    private lastPosition: { x: number; y: number };
    private stepThreshold: number = 16; // Minimum pixels moved to count as a step
    private isMoving: boolean = false;
    private position: { x: number; y: number };

    constructor(scene: Scene, x: number, y: number) {
        super();
        this.scene = scene;
        this.position = { x, y };
        this.lastPosition = { x, y };
    }

    public update(): void {
        // Check if we've moved enough to count as a step
        const distance = Phaser.Math.Distance.Between(
            this.lastPosition.x,
            this.lastPosition.y,
            this.position.x,
            this.position.y
        );

        if (distance >= this.stepThreshold) {
            this.notifyAchievementObservers(AchievementEvent.PLAYER_STEP);
            this.lastPosition = { ...this.position };
        }
    }

    public move(dx: number, dy: number): void {
        this.position.x += dx;
        this.position.y += dy;
        this.isMoving = true;
    }

    public getPosition(): { x: number; y: number } {
        return { ...this.position };
    }

    public isPlayerMoving(): boolean {
        return this.isMoving;
    }

    public destroy(): void {
        // Clean up any resources if needed
    }
} 
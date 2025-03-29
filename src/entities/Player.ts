import { Scene } from 'phaser';
import { AchievementEvent, AchievementObserver } from '../systems/achievements/types';
import { Inventory } from './Inventory';

export class Player {
    private scene: Scene;
    private x: number;
    private y: number;
    private baseSpeed: number = 2.5;
    private speed: number = 2.5;
    private dx: number = 0;
    private dy: number = 0;
    private achievementObserver: AchievementObserver | null = null;
    private inventory: Inventory;
    private activeKeys: Set<string> = new Set();
    private isRunning: boolean = false;

    constructor(scene: Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.inventory = new Inventory();
    }

    addAchievementObserver(observer: AchievementObserver): void {
        this.achievementObserver = observer;
    }

    setRunning(running: boolean): void {
        this.isRunning = running;
        this.speed = this.baseSpeed * (running ? 2 : 1);
    }

    move(dx: number, dy: number, key: string): void {
        this.activeKeys.add(key);
        this.dx = dx;
        this.dy = dy;
    }

    stopMoving(key: string): void {
        this.activeKeys.delete(key);
        if (this.activeKeys.size === 0) {
            this.dx = 0;
            this.dy = 0;
        }
    }

    update(): void {
        // Update position
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        // Keep player in bounds
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        this.x = Phaser.Math.Clamp(this.x, 0, width);
        this.y = Phaser.Math.Clamp(this.y, 0, height);

        // Check for steps (for achievement system)
        if (this.dx !== 0 || this.dy !== 0) {
            this.achievementObserver?.onAchievementEvent(AchievementEvent.PLAYER_STEP);
        }
    }

    getPosition(): { x: number; y: number } {
        return { x: this.x, y: this.y };
    }

    getInventory(): Inventory {
        return this.inventory;
    }

    destroy(): void {
        // Clean up if needed
    }
} 
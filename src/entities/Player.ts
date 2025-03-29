import { Scene } from 'phaser';
import { AchievementEvent, AchievementObserver } from '../systems/achievements/types';
import { Inventory } from './Inventory';
import { MovementConfig } from '../config/MovementConfig';

export class Player {
    private scene: Scene;
    private x: number;
    private y: number;
    private dx: number = 0;
    private dy: number = 0;
    private achievementObserver: AchievementObserver | null = null;
    private inventory: Inventory;
    private size: number = 32; // Player size for collision detection

    constructor(scene: Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.inventory = new Inventory();
    }

    addAchievementObserver(observer: AchievementObserver): void {
        this.achievementObserver = observer;
    }

    move(dx: number, dy: number): void {
        // If dx and dy are both 0, stop movement
        if (dx === 0 && dy === 0) {
            this.dx = 0;
            this.dy = 0;
            return;
        }

        // Update velocity
        this.dx = dx;
        this.dy = dy;
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    update(): void {
        // Calculate movement speed
        const isDiagonal = this.dx !== 0 && this.dy !== 0;
        const speedMultiplier = isDiagonal ? MovementConfig.diagonalSpeedMultiplier : 1;
        const speed = MovementConfig.baseSpeed * speedMultiplier;

        // Calculate new position
        const newX = this.x + this.dx * speed;
        const newY = this.y + this.dy * speed;

        // Check if the new position would collide with any obstacles
        const wouldCollide = this.checkCollision(newX, newY);
        
        // Only update position if there's no collision
        if (!wouldCollide) {
            this.x = newX;
            this.y = newY;
        }

        // Keep player within room boundaries
        const layoutGenerator = (this.scene as any).layoutGenerator;
        if (layoutGenerator) {
            const room = layoutGenerator.getRoom();
            if (room) {
                const halfWidth = room.width / 2;
                const halfHeight = room.height / 2;
                this.x = Phaser.Math.Clamp(this.x, room.x - halfWidth + this.size/2, room.x + halfWidth - this.size/2);
                this.y = Phaser.Math.Clamp(this.y, room.y - halfHeight + this.size/2, room.y + halfHeight - this.size/2);
            }
        }

        // Check for steps (for achievement system)
        if (this.dx !== 0 || this.dy !== 0) {
            this.achievementObserver?.onAchievementEvent(AchievementEvent.PLAYER_STEP);
        }
    }

    private checkCollision(x: number, y: number): boolean {
        // Get all rectangles from the layout generator
        const layoutGenerator = (this.scene as any).layoutGenerator;
        if (!layoutGenerator) return false;

        // Check collision with all obstacles
        return layoutGenerator.checkCollision(x, y, this.size);
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
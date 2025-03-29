import { Scene } from 'phaser';
import { AchievementEvent, AchievementObserver } from '../systems/achievements/types';
import { Inventory } from './Inventory';
import { MovementConfig } from '../config/MovementConfig';

export enum Direction {
    LEFT = 'left',
    RIGHT = 'right',
    DOWN = 'down',
    UP = 'up'
}

export class Player {
    private scene: Scene;
    private x: number;
    private y: number;
    private baseSpeed: number = 2.5;
    private speed: number = 5;
    private dx: number = 0;
    private dy: number = 0;
    private achievementObserver: AchievementObserver | null = null;
    private inventory: Inventory;
    private activeKeys: Set<string> = new Set();
    private isRunning: boolean = false;
    private sprite!: Phaser.GameObjects.Sprite;
    private lastDirection: Direction = Direction.DOWN;
    private size: number = 32;  // Player size for collision detection

    constructor(scene: Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.inventory = new Inventory();
        this.setupSprite();
    }

    private setupSprite(): void {
        // Create the sprite
        this.sprite = this.scene.add.sprite(this.x, this.y, 'character_idle');

        this.sprite.setScale(2.0);

        // Set up animations
        // Idle animations for each direction
        this.scene.anims.create({
            key: 'idle_right',
            frames: this.scene.anims.generateFrameNumbers('character_idle', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'idle_down',
            frames: this.scene.anims.generateFrameNumbers('character_idle', { start: 4, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'idle_up',
            frames: this.scene.anims.generateFrameNumbers('character_idle', { start: 8, end: 11 }),
            frameRate: 8,
            repeat: -1
        });

        // Walk animations for each direction
        this.scene.anims.create({
            key: 'walk_right',
            frames: this.scene.anims.generateFrameNumbers('character_walk', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'walk_down',
            frames: this.scene.anims.generateFrameNumbers('character_walk', { start: 8, end: 15 }),
            frameRate: 12,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'walk_up',
            frames: this.scene.anims.generateFrameNumbers('character_walk', { start: 16, end: 23 }),
            frameRate: 12,
            repeat: -1
        });

        // Run animations for each direction
        this.scene.anims.create({
            key: 'run_right',
            frames: this.scene.anims.generateFrameNumbers('character_run', { start: 0, end: 7 }),
            frameRate: 16,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'run_down',
            frames: this.scene.anims.generateFrameNumbers('character_run', { start: 8, end: 15 }),
            frameRate: 16,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'run_up',
            frames: this.scene.anims.generateFrameNumbers('character_run', { start: 16, end: 23 }),
            frameRate: 16,
            repeat: -1
        });

        // Start with idle down animation
        this.sprite.play('idle_down');
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

        // Update last direction based on movement
        if (dx > 0) this.lastDirection = Direction.RIGHT;
        else if (dx < 0) this.lastDirection = Direction.LEFT;
        else if (dy > 0) this.lastDirection = Direction.DOWN;
        else if (dy < 0) this.lastDirection = Direction.UP;

        // Update animation based on direction
        this.updateAnimation();
    }

    private updateAnimation(): void {
        if (this.dx === 0 && this.dy === 0) {
            // When not moving, play idle animation in last direction
            switch (this.lastDirection) {
                case Direction.LEFT:
                    this.sprite.setFlipX(true);
                    this.sprite.play('idle_right', true);
                    break;
                case Direction.RIGHT:
                    this.sprite.setFlipX(false);
                    this.sprite.play('idle_right', true);
                    break;
                case Direction.DOWN:
                    this.sprite.setFlipX(false);
                    this.sprite.play('idle_down', true);
                    break;
                case Direction.UP:
                    this.sprite.setFlipX(false);
                    this.sprite.play('idle_up', true);
                    break;
            }
        } else {
            // When moving, play walk or run animation based on isRunning state
            const prefix = this.isRunning ? 'run_' : 'walk_';
            switch (this.lastDirection) {
                case Direction.LEFT:
                    this.sprite.setFlipX(true);
                    this.sprite.play(prefix + 'right', true);
                    break;
                case Direction.RIGHT:
                    this.sprite.setFlipX(false);
                    this.sprite.play(prefix + 'right', true);
                    break;
                case Direction.DOWN:
                    this.sprite.setFlipX(false);
                    this.sprite.play(prefix + 'down', true);
                    break;
                case Direction.UP:
                    this.sprite.setFlipX(false);
                    this.sprite.play(prefix + 'up', true);
                    break;
            }
        }
    }

    stopMoving(key: string): void {
        this.activeKeys.delete(key);
        if (this.activeKeys.size === 0) {
            this.dx = 0;
            this.dy = 0;
            this.updateAnimation();
        }
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.sprite.setPosition(x, y);
        this.dx = 0;
        this.dy = 0;
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

        // Update sprite position
        this.sprite.setPosition(this.x, this.y);

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
        this.sprite.destroy();
    }
} 
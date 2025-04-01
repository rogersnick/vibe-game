import { Scene } from 'phaser';
import { AchievementEvent, AchievementObserver } from '../systems/achievements/types';
import { Inventory } from './Inventory';
import createDebug from 'debug';
const debug = createDebug('vibe:player');

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
    private speed: number = 2.5;
    private dx: number = 0;
    private dy: number = 0;
    private achievementObserver: AchievementObserver | null = null;
    private inventory: Inventory;
    private activeKeys: Set<string> = new Set();
    private isRunning: boolean = false;
    private sprite!: Phaser.GameObjects.Sprite;
    private lastDirection: Direction = Direction.DOWN;
    private isDead: boolean = false;
    private maxEnergy: number = 100;
    private currentEnergy: number = 100;
    private energyDrainRate: number = 10; // Energy points per second when running
    private walkEnergyDrainRate: number = 5; // Energy points per second when walking
    private energyRegenRate: number = 0.5; // Energy points per second when not moving
    private energyBar!: Phaser.GameObjects.Graphics;
    private energyBarWidth: number = 64;
    private energyBarHeight: number = 8;
    private energyBarOffset: number = 40; // Offset from sprite center

    constructor(scene: Scene, x: number, y: number) {
        debug('Player: Constructor called');
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.inventory = new Inventory();
        debug('Player: Inventory created, setting up callback');
        this.setupSprite();
        this.setupEnergyBar();
        
        // Set up inventory callback for achievements
        const callback = (count: number) => {
            debug('Player: Item collected callback triggered, count:', count);
            if (this.achievementObserver) {
                debug('Player: Achievement observer exists, sending COLLECTIBLE_FOUND event');
                this.achievementObserver.onAchievementEvent(AchievementEvent.COLLECTIBLE_FOUND, { itemCount: count });
            } else {
                debug('Player: ERROR - No achievement observer set!');
            }
        };
        debug('Player: Created callback function');
        this.inventory.setOnItemCollectedCallback(callback);
        debug('Player: Callback set on inventory');
        debug('Player: Constructor completed');
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

        // Death animations for each direction
        this.scene.anims.create({
            key: 'death_right',
            frames: this.scene.anims.generateFrameNumbers('character_death', { start: 0, end: 5 }),
            frameRate: 12,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'death_down',
            frames: this.scene.anims.generateFrameNumbers('character_death', { start: 6, end: 11 }),
            frameRate: 12,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'death_up',
            frames: this.scene.anims.generateFrameNumbers('character_death', { start: 12, end: 17 }),
            frameRate: 12,
            repeat: 0
        });

        // Start with idle down animation
        this.sprite.play('idle_down');

        // Set up animation completion listener after all animations are created
        this.sprite.on('animationcomplete', (animation: Phaser.Animations.Animation) => {
            this.onDeathAnimationComplete(animation);
        });
    }

    private setupEnergyBar(): void {
        // Create the energy bar graphics
        this.energyBar = this.scene.add.graphics();
        this.updateEnergyBar();
    }

    private updateEnergyBar(): void {
        this.energyBar.clear();

        // Background (gray)
        this.energyBar.fillStyle(0x666666);
        this.energyBar.fillRect(
            this.x - this.energyBarWidth / 2,
            this.y - this.energyBarOffset,
            this.energyBarWidth,
            this.energyBarHeight
        );

        // Energy level (blue)
        const energyWidth = (this.currentEnergy / this.maxEnergy) * this.energyBarWidth;
        this.energyBar.fillStyle(0x00ff00);
        this.energyBar.fillRect(
            this.x - this.energyBarWidth / 2,
            this.y - this.energyBarOffset,
            energyWidth,
            this.energyBarHeight
        );

        // Border
        this.energyBar.lineStyle(2, 0x000000);
        this.energyBar.strokeRect(
            this.x - this.energyBarWidth / 2,
            this.y - this.energyBarOffset,
            this.energyBarWidth,
            this.energyBarHeight
        );
    }

    setAchievementObserver(observer: AchievementObserver): void {
        debug('Player: Setting achievement observer');
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
        if (this.isDead) return; // Don't change animations if dead

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

    update(): void {
        if (this.isDead) return;

        // Update energy based on movement state
        if (this.dx !== 0 || this.dy !== 0) {
            // If moving, drain energy based on whether running or walking
            const drainRate = this.isRunning ? this.energyDrainRate : this.walkEnergyDrainRate;
            this.drainEnergy(drainRate / 60);
        } else {
            // If not moving, regenerate energy
            this.addEnergy(this.energyRegenRate / 60);
        }

        // Update position
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        // Keep player in bounds
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        this.x = Phaser.Math.Clamp(this.x, 0, width);
        this.y = Phaser.Math.Clamp(this.y, 0, height);

        // Update sprite position
        this.sprite.setPosition(this.x, this.y);
        this.updateEnergyBar();

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
        this.sprite.destroy();
        this.energyBar.destroy();
    }

    die(): void {
        if (this.isDead) return;
        
        this.dx = 0;
        this.dy = 0;
        this.activeKeys.clear();
        
        // Play death animation based on last direction
        switch (this.lastDirection) {
            case Direction.LEFT:
                this.sprite.setFlipX(true);
                this.sprite.play('death_right', true);
                break;
            case Direction.RIGHT:
                this.sprite.setFlipX(false);
                this.sprite.play('death_right', true);
                break;
            case Direction.DOWN:
                this.sprite.setFlipX(false);
                this.sprite.play('death_down', true);
                break;
            case Direction.UP:
                this.sprite.setFlipX(false);
                this.sprite.play('death_up', true);
                break;
        }

        // Start game over scene after death animation (about 1 second)
        this.scene.time.delayedCall(1000, () => {
            this.isDead = true;
            this.scene.scene.start('GameOverScene', { inventory: this.inventory });
        });
    }

    isPlayerDead(): boolean {
        return this.isDead;
    }

    getEnergy(): number {
        return this.currentEnergy;
    }

    getMaxEnergy(): number {
        return this.maxEnergy;
    }

    addEnergy(amount: number): void {
        this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + amount);
        this.updateEnergyBar();
    }

    drainEnergy(amount: number): void {
        this.currentEnergy = Math.max(0, this.currentEnergy - amount);
        this.updateEnergyBar();
        if (this.currentEnergy === 0 && !this.isDead) {
            this.die();
        }
    }

    private onDeathAnimationComplete(animation: Phaser.Animations.Animation): void {
        debug('Animation completed:', animation.key);
        if (animation.key === 'death') {
            debug('Death animation completed, starting game over');
            this.scene.scene.start('GameOverScene', {
                inventory: this.inventory
            });
        }
    }
} 
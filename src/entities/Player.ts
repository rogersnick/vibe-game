import { Scene } from 'phaser';
import { AchievementEvent, AchievementObserver } from '../systems/achievements/types';
import { Inventory } from './Inventory';
import { MovementConfig } from '../config/MovementConfig';
import { CollectibleConfig } from '../config/CollectibleConfig';

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
    private interactionSize: number = 48;  // Larger size for interaction with elements
    private equippedItem: CollectibleConfig | null = null;
    private equippedItemSprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Arc | null = null;
    private equippedItemText: Phaser.GameObjects.Text | null = null;
    private totalDamage: number = 0;

    constructor(scene: Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.inventory = new Inventory();
        this.setupSprite();
        this.setupEquippedItemText();
        this.setupInputHandling();
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

    private setupEquippedItemText(): void {
        // Create text in top-right corner
        this.equippedItemText = this.scene.add.text(
            this.scene.cameras.main.width - 20,
            20,
            '',
            {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 8, y: 4 }
            }
        ).setOrigin(1, 0); // Right-aligned, top-anchored
    }

    private updateEquippedItemText(): void {
        if (this.equippedItemText) {
            if (this.equippedItem) {
                this.equippedItemText.setText(`${this.equippedItem.name} (${this.equippedItem.uses} uses)`);
                this.equippedItemText.setVisible(true);
            } else {
                this.equippedItemText.setVisible(false);
            }
        }
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

        // Use normal size for movement collision
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
        if (this.equippedItemText) {
            this.equippedItemText.destroy();
        }
    }

    equipItem(item: CollectibleConfig): void {
        // Unequip current item if any
        this.unequipItem();
        
        // Set new equipped item
        this.equippedItem = item;
        
        // Update visual representation
        this.updateEquippedItemVisual();
        this.updateEquippedItemText();
    }

    private updateEquippedItemVisual(): void {
        // Clean up previous equipped item sprite if it exists
        if (this.equippedItemSprite) {
            this.equippedItemSprite.destroy();
            this.equippedItemSprite = null;
        }

        if (this.equippedItem) {
            // Create a circle shape for the equipped item
            const itemSprite = this.scene.add.circle(
                this.x,
                this.y,
                8, // radius
                this.equippedItem.color
            );
            
            // Position the item sprite relative to the player
            const offsetX = this.dx < 0 ? -20 : 20;
            itemSprite.setPosition(this.x + offsetX, this.y);
            
            // Store the item sprite reference
            this.equippedItemSprite = itemSprite;
        }
    }

    unequipItem(): void {
        if (this.equippedItemSprite) {
            this.equippedItemSprite.destroy();
            this.equippedItemSprite = null;
        }
        this.equippedItem = null;
        this.updateEquippedItemText();
    }

    private setupInputHandling(): void {
        // Add X key handler
        if (this.scene.input.keyboard) {
            const xKey = this.scene.input.keyboard.addKey('X');
            xKey.on('down', () => {
                if (this.equippedItem) {
                    this.useEquippedItem();
                }
            });
        }
    }

    private isTouchingElement(): boolean {
        const layoutGenerator = (this.scene as any).layoutGenerator;
        if (!layoutGenerator) return false;

        // Use larger interaction size when checking for element interaction
        return layoutGenerator.checkCollision(this.x, this.y, this.interactionSize);
    }

    useEquippedItem(): void {
        if (!this.equippedItem || !this.isTouchingElement()) return;

        const layoutGenerator = (this.scene as any).layoutGenerator;
        if (!layoutGenerator) return;

        // Get the element being touched using the larger interaction size
        const touchedElement = layoutGenerator.getTouchedElement(this.x, this.y, this.interactionSize);
        if (!touchedElement) return;

        // Create hit animation
        this.createHitAnimation(touchedElement.rectangle.x, touchedElement.rectangle.y);

        // Apply damage based on item power
        const damage = this.equippedItem.power;
        touchedElement.element.hp -= damage;
        
        // Add to total damage score
        this.totalDamage += damage;

        // Show damage popup
        this.createDamagePopup(touchedElement.rectangle.x, touchedElement.rectangle.y, damage);

        // Update element's visual representation
        layoutGenerator.updateElementVisual(touchedElement);

        // Decrease item uses
        this.equippedItem.uses--;
        this.updateEquippedItemText();

        // Unequip if no uses left
        if (this.equippedItem.uses <= 0) {
            this.unequipItem();
        }
    }

    getTotalDamage(): number {
        return this.totalDamage;
    }

    private createHitAnimation(x: number, y: number): void {
        // Create a circle that expands and fades out
        const hitCircle = this.scene.add.circle(x, y, 10, 0xFFFFFF);
        hitCircle.setAlpha(0.8);

        // Create particles
        const particles = this.scene.add.particles(0, 0, 'particle', {
            x: x,
            y: y,
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 300,
            quantity: 8,
            blendMode: 'ADD'
        });

        // Animate the hit circle
        this.scene.tweens.add({
            targets: hitCircle,
            radius: 30,
            alpha: 0,
            duration: 300,
            ease: 'Quad.easeOut',
            onComplete: () => {
                hitCircle.destroy();
                particles.destroy();
            }
        });

        // Add a flash effect
        const flash = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0xFFFFFF
        );
        flash.setAlpha(0);
        flash.setDepth(1000);

        this.scene.tweens.add({
            targets: flash,
            alpha: 0.3,
            duration: 50,
            yoyo: true,
            onComplete: () => {
                flash.destroy();
            }
        });
    }

    private createDamagePopup(x: number, y: number, damage: number): void {
        // Create damage text
        const damageText = this.scene.add.text(x, y - 20, `-${damage}`, {
            fontSize: '24px',
            color: '#ff0000',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Animate the text
        this.scene.tweens.add({
            targets: damageText,
            y: y - 50,
            alpha: 0,
            duration: 500,
            ease: 'Quad.easeOut',
            onComplete: () => {
                damageText.destroy();
            }
        });
    }
} 
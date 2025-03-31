import { Scene } from 'phaser';
import { Inventory } from '../entities/Inventory';
import { Achievement } from '../systems/achievements/types';

export class GameOverScene extends Scene {
    private inventory!: Inventory;
    private container!: Phaser.GameObjects.Container;
    private achievements!: Achievement[];

    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data: { inventory: Inventory; achievements?: Achievement[] }) {
        this.inventory = data.inventory;
        this.achievements = data.achievements || [];
    }

    create(): void {
        // Create a container for all elements
        this.container = this.add.container(0, 0);

        // Add a dramatic dark background with vignette effect
        const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.9);
        bg.setOrigin(0, 0);
        this.container.add(bg);

        // Add a vignette effect
        const vignette = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5);
        vignette.setOrigin(0, 0);
        vignette.setBlendMode(Phaser.BlendModes.MULTIPLY);
        this.container.add(vignette);

        // Add dramatic red glow
        const glow = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xff0000, 0.2);
        glow.setOrigin(0, 0);
        glow.setBlendMode(Phaser.BlendModes.ADD);
        this.container.add(glow);

        // Create a dramatic "Game Over" text with multiple layers
        const gameOverText = this.createDramaticText('GAME OVER', 64, this.cameras.main.centerY - 150);
        this.container.add(gameOverText);

        // Add items collected with dramatic styling
        const itemsText = this.createDramaticText(`Items Collected: ${this.inventory.getItemCount()}`, 32, this.cameras.main.centerY - 80);
        this.container.add(itemsText);

        // Add achievements section
        const achievementsTitle = this.createDramaticText('Achievements Earned', 36, this.cameras.main.centerY - 20);
        this.container.add(achievementsTitle);

        // Create achievements container
        const achievementsContainer = this.add.container(this.cameras.main.centerX, this.cameras.main.centerY + 20);
        this.container.add(achievementsContainer);

        // Display each achievement
        this.achievements.forEach((achievement, index) => {
            if (achievement.isUnlocked) {
                const achievementContainer = this.createAchievementDisplay(achievement, index);
                achievementsContainer.add(achievementContainer);
            }
        });

        // Add "Press SPACE to restart" at the bottom with pulsing animation
        const restartText = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 50, 
            'Press SPACE to restart', {
            font: '24px Arial',
            color: '#ffffff',
            stroke: '#ff0000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.container.add(restartText);

        // Add pulsing animation to restart text
        this.tweens.add({
            targets: restartText,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add particle effects
        const particles = this.add.particles(0, 0, 'particle', {
            x: this.cameras.main.centerX,
            y: this.cameras.main.centerY,
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 2000,
            quantity: 2,
            blendMode: 'ADD',
            tint: 0xff0000
        });
        this.container.add(particles);

        // Animate everything in
        this.container.setAlpha(0);
        this.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 2000,
            ease: 'Power2'
        });

        // Add dramatic camera shake
        this.cameras.main.shake(500, 0.02);

        // Add restart functionality with dramatic effect
        this.input.keyboard?.once('keydown-SPACE', () => {
            // Fade out everything
            this.tweens.add({
                targets: this.container,
                alpha: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    this.scene.start('GameScene');
                }
            });
        });
    }

    private createAchievementDisplay(achievement: Achievement, index: number): Phaser.GameObjects.Container {
        const container = this.add.container(0, index * 40);
        
        // Create achievement background
        const bg = this.add.rectangle(0, 0, 400, 35, 0x000000, 0.5);
        bg.setStrokeStyle(2, 0xff0000);
        bg.setOrigin(0.5);
        container.add(bg);

        // Create achievement icon
        const icon = this.add.text(-180, 0, '🏆', {
            fontSize: '24px'
        }).setOrigin(0.5);
        container.add(icon);

        // Create achievement title
        const title = this.add.text(-140, 0, achievement.title, {
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#ff0000',
            strokeThickness: 2
        }).setOrigin(0, 0.5);
        container.add(title);

        // Create achievement description
        const description = this.add.text(160, 0, achievement.description, {
            fontSize: '16px',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0.5);
        container.add(description);

        // Add hover effect
        bg.setInteractive();
        bg.on('pointerover', () => {
            bg.setFillStyle(0x000000, 0.7);
            bg.setStrokeStyle(2, 0xffff00);
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(0x000000, 0.5);
            bg.setStrokeStyle(2, 0xff0000);
        });

        return container;
    }

    private createDramaticText(text: string, size: number, y: number): Phaser.GameObjects.Container {
        const container = this.add.container(this.cameras.main.centerX, y);
        
        // Create shadow text
        const shadow = this.add.text(0, 0, text, {
            font: `${size}px Arial`,
            color: '#000000',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);
        shadow.setPosition(2, 2);
        container.add(shadow);

        // Create main text
        const mainText = this.add.text(0, 0, text, {
            font: `${size}px Arial`,
            color: '#ffffff',
            stroke: '#ff0000',
            strokeThickness: 4
        }).setOrigin(0.5);
        container.add(mainText);

        // Create glow effect
        const glow = this.add.text(0, 0, text, {
            font: `${size}px Arial`,
            color: '#ff0000',
            stroke: '#ff0000',
            strokeThickness: 2
        }).setOrigin(0.5);
        glow.setBlendMode(Phaser.BlendModes.ADD);
        container.add(glow);

        // Add pulsing animation
        this.tweens.add({
            targets: glow,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        return container;
    }

    update(): void {
        // No update logic needed
    }
} 
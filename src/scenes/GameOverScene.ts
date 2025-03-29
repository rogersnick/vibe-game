import { Scene } from 'phaser';
import { Inventory } from '../entities/Inventory';

export class GameOverScene extends Scene {
    private inventory!: Inventory;

    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data: { inventory: Inventory }) {
        this.inventory = data.inventory;
    }

    create(): void {
        // Add semi-transparent black background
        const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
        bg.setOrigin(0, 0);

        // Add "Game Over" text
        const gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'Game Over', {
            font: '64px Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        });
        gameOverText.setOrigin(0.5);

        // Add items collected text
        const itemsText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 
            `Items Collected: ${this.inventory.getItemCount()}`, {
            font: '32px Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        itemsText.setOrigin(0.5);

        // Add "Press SPACE to restart" text
        const restartText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, 
            'Press SPACE to restart', {
            font: '24px Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        restartText.setOrigin(0.5);

        // Add restart functionality
        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
    }

    update(): void {
        // No update logic needed
    }
} 
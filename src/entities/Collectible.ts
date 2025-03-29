import { Scene } from 'phaser';
import { Player } from './Player';

export type CollectibleCategory = 'healing' | 'power' | 'speed' | 'shield' | 'special';

export interface CollectibleConfig {
    name: string;
    category: CollectibleCategory;
    color: number;
    power: number;
    uses: number;
    description: string;
}

export class Collectible {
    private scene: Scene;
    private x: number;
    private y: number;
    private visual: Phaser.GameObjects.Shape;
    private color: number;
    private isCollected: boolean = false;
    private radius: number = 8;
    private config: CollectibleConfig;
    private text?: Phaser.GameObjects.Text;

    constructor(scene: Scene, x: number, y: number, config: CollectibleConfig) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.color = config.color;
        this.config = config;
        this.visual = scene.add.circle(x, y, this.radius, config.color);
        
        // Add text label
        this.text = scene.add.text(x, y - 20, config.name, {
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5, 0.5);
    }

    clone(): Collectible {
        return new Collectible(this.scene, this.x, this.y, this.config);
    }

    getPosition(): { x: number; y: number } {
        return { x: this.x, y: this.y };
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.visual.setPosition(x, y);
        if (this.text) {
            this.text.setPosition(x, y - 20);
        }
    }

    checkCollection(player: Player): void {
        if (this.isCollected) return;

        const playerPos = player.getPosition();
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            playerPos.x, playerPos.y
        );

        if (distance < this.radius + 16) { // 16 is player radius
            this.collect(player);
        }
    }

    private collect(player: Player): void {
        this.isCollected = true;
        
        // Add collectible to player's inventory
        player.getInventory().addItem({
            name: this.config.name,
            category: this.config.category,
            power: this.config.power,
            uses: this.config.uses,
            description: this.config.description
        });
        
        // Add collection effect
        this.scene.tweens.add({
            targets: [this.visual, this.text],
            scale: 1.5,
            alpha: 0,
            duration: 200,
            onComplete: () => this.destroy()
        });

        // Show collection notification
        this.showCollectionNotification();
    }

    private showCollectionNotification(): void {
        const notification = this.scene.add.text(
            this.scene.cameras.main.centerX,
            100,
            `Collected ${this.config.name}!`,
            {
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5, 0.5);

        this.scene.tweens.add({
            targets: notification,
            y: 150,
            alpha: 0,
            duration: 1000,
            delay: 500,
            onComplete: () => notification.destroy()
        });
    }

    destroy(): void {
        this.visual.destroy();
        if (this.text) {
            this.text.destroy();
        }
    }
} 
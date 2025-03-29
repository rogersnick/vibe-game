import { Scene } from 'phaser';
import { Player } from './Player';
import { Logger } from '../utils/Logger';

export class Collectible {
    private scene: Scene;
    private x: number;
    private y: number;
    private visual: Phaser.GameObjects.Shape;
    private color: number;
    private isCollected: boolean = false;
    private radius: number = 8;

    constructor(scene: Scene, x: number, y: number, color: number = 0xff0000) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.color = color;
        this.visual = scene.add.circle(x, y, this.radius, color);
    }

    clone(): Collectible {
        // Create a new collectible with the same properties
        return new Collectible(this.scene, this.x, this.y, this.color);
    }

    getPosition(): { x: number; y: number } {
        return { x: this.x, y: this.y };
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.visual.setPosition(x, y);
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
        Logger.debug('Collectible collected');
        this.isCollected = true;
        player.getInventory().addItem();
        Logger.debug('Item added to inventory');
        
        // Add collection effect
        this.scene.tweens.add({
            targets: this.visual,
            scale: 1.5,
            alpha: 0,
            duration: 200,
            onComplete: () => this.destroy()
        });
    }

    destroy(): void {
        this.visual.destroy();
    }
} 
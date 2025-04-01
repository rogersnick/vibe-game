import { Scene } from 'phaser';
import { Player } from './Player';
import createDebug from 'debug';
import { ServiceLocator } from '../core/services/ServiceLocator';
import { GameEventType, CollectibleCollectedEventData } from '../core/events/GameEvent';
const debug = createDebug('vibe:collectible');

interface CollectibleVisuals {
    circle: Phaser.GameObjects.Rectangle;
    glow: Phaser.GameObjects.Rectangle;
    trail: Phaser.GameObjects.Rectangle[];
}

export class Collectible {
    private scene: Scene;
    private x: number;
    private y: number;
    private visuals: CollectibleVisuals;
    private isCollected: boolean = false;
    private readonly radius: number = 10;
    private readonly glowSizeMultiplier: number = 1.8;
    private readonly glowOpacity: number = 0.25;
    private readonly trailLength: number = 4;
    private readonly baseOpacity: number = 0.4;
    private readonly rotationSpeed: number = 0.002;

    constructor(scene: Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // Create main square (instead of circle) with pixelated edges
        const circle = scene.add.rectangle(x, y, this.radius * 2, this.radius * 2, 0x00ff00, this.baseOpacity);
        circle.setStrokeStyle(2, 0x00ff00);
        circle.setOrigin(0.5);
        
        // Create glow effect with pixelated edges
        const glow = scene.add.rectangle(x, y, this.radius * 2 * this.glowSizeMultiplier, this.radius * 2 * this.glowSizeMultiplier, 0x00ff00, this.glowOpacity);
        glow.setStrokeStyle(2, 0x00ff00);
        glow.setOrigin(0.5);
        
        // Create trail with pixelated edges
        const trail: Phaser.GameObjects.Rectangle[] = [];
        for (let i = 0; i < this.trailLength; i++) {
            const trailSquare = scene.add.rectangle(x, y, this.radius * 1.6, this.radius * 1.6, 0x00ff00, this.baseOpacity * 0.5);
            trailSquare.setStrokeStyle(2, 0x00ff00);
            trailSquare.setOrigin(0.5);
            trail.push(trailSquare);
        }

        this.visuals = { circle, glow, trail };

        // Add rotation animation
        scene.tweens.add({
            targets: [circle, glow, ...trail],
            rotation: Math.PI * 2,
            duration: 8000,
            repeat: -1,
            ease: 'Linear'
        });

        // Add scale animation
        scene.tweens.add({
            targets: [circle, glow, ...trail],
            scale: 1.2,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Add color pulse animation
        scene.tweens.add({
            targets: [circle, glow, ...trail],
            fillColor: 0x00ff00,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    clone(): Collectible {
        return new Collectible(this.scene, this.x, this.y);
    }

    getPosition(): { x: number; y: number } {
        return { x: this.x, y: this.y };
    }

    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        this.visuals.circle.setPosition(x, y);
        this.visuals.glow.setPosition(x, y);
        this.visuals.trail[0].setPosition(x, y);
    }

    checkCollection(player: Player): void {
        if (this.isCollected) return;

        const playerPos = player.getPosition();
        const distance = Phaser.Math.Distance.Between(
            this.x, this.y,
            playerPos.x, playerPos.y
        );

        if (distance < this.radius + 16) { // 16 is player radius
            debug('Collection threshold met, calling collect');
            this.collect(player);
        }
    }

    private getEventQueue() {
        return ServiceLocator.getInstance().getEventQueue();
    }

    private collect(player: Player): void {
        debug('Collectible collected - Starting collection process');
        this.isCollected = true;
        const currentCount = player.getInventory().getItemCount();
        debug('Current inventory count before adding:', currentCount);
        player.getInventory().addItem();
        const newCount = player.getInventory().getItemCount();
        debug('New inventory count after adding:', newCount);
        player.addEnergy(5); // Add 5 energy points
        debug('Item added to inventory and energy increased by 5');
        
        // Emit COLLECTIBLE_COLLECTED event
        const collectData: CollectibleCollectedEventData = {
            x: this.x,
            y: this.y,
            type: 'default',
            totalCollected: newCount
        };
        this.getEventQueue().emit(GameEventType.COLLECTIBLE_COLLECTED, collectData);
        
        // Enhanced collection effect
        const targets = [this.visuals.circle, this.visuals.glow, ...this.visuals.trail];
        this.scene.tweens.add({
            targets,
            scale: 1.5,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => this.destroy()
        });
    }

    destroy(): void {
        this.visuals.circle.destroy();
        this.visuals.glow.destroy();
        this.visuals.trail.forEach(circle => circle.destroy());
    }
} 
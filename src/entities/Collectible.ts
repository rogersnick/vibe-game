import { Scene } from 'phaser';
import { Player } from './Player';
import createDebug from 'debug';
const debug = createDebug('vibe:collectible');

interface CollectibleVisuals {
    circle: Phaser.GameObjects.Ellipse;
    glow: Phaser.GameObjects.Ellipse;
    trail: Phaser.GameObjects.Ellipse[];
}

export class Collectible {
    private scene: Scene;
    private x: number;
    private y: number;
    private visuals: CollectibleVisuals;
    private isCollected: boolean = false;
    private readonly radius: number = 12;
    private readonly glowSizeMultiplier: number = 1.8;
    private readonly glowOpacity: number = 0.25;
    private readonly trailLength: number = 4;
    private readonly baseOpacity: number = 0.4;
    private readonly rotationSpeed: number = 0.002;

    constructor(scene: Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // Create main circle
        const circle = scene.add.ellipse(x, y, this.radius, this.radius, 0x00ff00, this.baseOpacity);
        
        // Create glow effect
        const glow = scene.add.ellipse(x, y, this.radius * this.glowSizeMultiplier, this.radius * this.glowSizeMultiplier, 0x00ff00, this.glowOpacity);
        
        // Create trail
        const trail: Phaser.GameObjects.Ellipse[] = [];
        for (let i = 0; i < this.trailLength; i++) {
            const trailCircle = scene.add.ellipse(x, y, this.radius * 0.8, this.radius * 0.8, 0x00ff00, this.baseOpacity * 0.5);
            trail.push(trailCircle);
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
            this.collect(player);
        }
    }

    private collect(player: Player): void {
        debug('Collectible collected');
        this.isCollected = true;
        player.getInventory().addItem();
        player.addEnergy(5); // Add 5 energy points
        debug('Item added to inventory and energy increased by 5');
        
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
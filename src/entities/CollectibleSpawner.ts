import { Scene } from 'phaser';
import { Collectible } from './Collectible';
import { Player } from './Player';

export class CollectibleSpawner {
    private scene: Scene;
    private prototype: Collectible;
    private collectibles: Collectible[] = [];
    private player: Player;

    constructor(scene: Scene, player: Player) {
        this.scene = scene;
        this.player = player;
        // Create a prototype collectible (it will be hidden)
        this.prototype = new Collectible(scene, -100, -100);
    }

    spawnCollectible(x: number, y: number): Collectible {
        // Clone the prototype and position it
        const collectible = this.prototype.clone();
        collectible.setPosition(x, y);
        this.collectibles.push(collectible);
        return collectible;
    }

    spawnRandomCollectible(): Collectible {
        const x = Phaser.Math.Between(100, this.scene.cameras.main.width - 100);
        const y = Phaser.Math.Between(100, this.scene.cameras.main.height - 100);
        return this.spawnCollectible(x, y);
    }

    update(): void {
        // Check for collection on all collectibles
        this.collectibles.forEach(collectible => {
            collectible.checkCollection(this.player);
        });
    }

    destroy(): void {
        this.collectibles.forEach(collectible => collectible.destroy());
        this.collectibles = [];
        this.prototype.destroy();
    }
} 
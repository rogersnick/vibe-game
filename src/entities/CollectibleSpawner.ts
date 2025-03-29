import { Scene } from 'phaser';
import { Collectible, CollectibleConfig } from './Collectible';
import { Player } from './Player';

export class CollectibleSpawner {
    private scene: Scene;
    private player: Player;
    private collectibles: Collectible[] = [];
    private readonly COLLECTIBLE_CONFIGS: CollectibleConfig[] = [
        // Healing items
        {
            name: 'Health Potion',
            category: 'healing',
            color: 0xff0000,
            power: 50,
            uses: 1,
            description: 'Restores 50 HP'
        },
        {
            name: 'Bandage',
            category: 'healing',
            color: 0xff6b6b,
            power: 25,
            uses: 2,
            description: 'Restores 25 HP per use'
        },
        // Power items
        {
            name: 'Power Crystal',
            category: 'power',
            color: 0x00ff00,
            power: 75,
            uses: 1,
            description: 'Increases damage by 75%'
        },
        {
            name: 'Energy Orb',
            category: 'power',
            color: 0x32cd32,
            power: 50,
            uses: 3,
            description: 'Increases damage by 50% per use'
        },
        // Speed items
        {
            name: 'Speed Boost',
            category: 'speed',
            color: 0x0000ff,
            power: 100,
            uses: 1,
            description: 'Doubles movement speed'
        },
        {
            name: 'Swift Potion',
            category: 'speed',
            color: 0x4169e1,
            power: 50,
            uses: 2,
            description: 'Increases speed by 50% per use'
        },
        // Shield items
        {
            name: 'Shield Generator',
            category: 'shield',
            color: 0xffff00,
            power: 100,
            uses: 1,
            description: 'Creates a shield that blocks 100% damage'
        },
        {
            name: 'Defense Matrix',
            category: 'shield',
            color: 0xffd700,
            power: 50,
            uses: 2,
            description: 'Reduces incoming damage by 50% per use'
        },
        // Special items
        {
            name: 'Time Freeze',
            category: 'special',
            color: 0xff00ff,
            power: 100,
            uses: 1,
            description: 'Freezes time for 5 seconds'
        },
        {
            name: 'Teleporter',
            category: 'special',
            color: 0x9400d3,
            power: 100,
            uses: 1,
            description: 'Teleports to a random safe location'
        }
    ];

    constructor(scene: Scene, player: Player) {
        this.scene = scene;
        this.player = player;
    }

    spawnCollectible(x: number, y: number): Collectible {
        const config = this.COLLECTIBLE_CONFIGS[Phaser.Math.Between(0, this.COLLECTIBLE_CONFIGS.length - 1)];
        const collectible = new Collectible(this.scene, x, y, config);
        this.collectibles.push(collectible);
        return collectible;
    }

    spawnRandomCollectible(): Collectible {
        const x = Phaser.Math.Between(100, this.scene.cameras.main.width - 100);
        const y = Phaser.Math.Between(100, this.scene.cameras.main.height - 100);
        return this.spawnCollectible(x, y);
    }

    update(): void {
        this.collectibles.forEach(collectible => {
            collectible.checkCollection(this.player);
        });
    }

    destroy(): void {
        this.collectibles.forEach(collectible => collectible.destroy());
        this.collectibles = [];
    }
} 
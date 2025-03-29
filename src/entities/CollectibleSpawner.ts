import { Scene } from 'phaser';
import { Collectible, CollectibleConfig } from './Collectible';
import { Player } from './Player';

export class CollectibleSpawner {
    private scene: Scene;
    private player: Player;
    private collectibles: Collectible[] = [];
    private readonly COLLECTIBLE_CONFIGS: CollectibleConfig[] = [
        // Office Furniture (Heavy items)
        {
            name: 'Office Chair',
            category: 'healing',
            color: 0x8B4513,
            power: 40,
            uses: 3,
            description: 'A sturdy chair that can be used as a shield'
        },
        {
            name: 'Filing Cabinet',
            category: 'shield',
            color: 0x696969,
            power: 80,
            uses: 1,
            description: 'Heavy metal cabinet that provides excellent cover'
        },
        // Office Supplies (Light items)
        {
            name: 'Stapler',
            category: 'power',
            color: 0xC0C0C0,
            power: 30,
            uses: 5,
            description: 'A reliable weapon that never jams'
        },
        {
            name: 'Scissors',
            category: 'power',
            color: 0x808080,
            power: 25,
            uses: 4,
            description: 'Sharp and precise cutting tool'
        },
        // Office Tools (Utility items)
        {
            name: 'Desk Lamp',
            category: 'speed',
            color: 0xFFD700,
            power: 60,
            uses: 2,
            description: 'Bright light that temporarily blinds enemies'
        },
        {
            name: 'Extension Cord',
            category: 'speed',
            color: 0x000000,
            power: 45,
            uses: 3,
            description: 'Can be used to trip or bind enemies'
        },
        // Office Equipment (Heavy equipment)
        {
            name: 'Printer',
            category: 'shield',
            color: 0x2F4F4F,
            power: 70,
            uses: 2,
            description: 'Heavy equipment that can block attacks'
        },
        {
            name: 'Monitor',
            category: 'special',
            color: 0x000080,
            power: 55,
            uses: 1,
            description: 'Can be thrown as a projectile'
        },
        // Office Materials (Construction items)
        {
            name: 'Wooden Board',
            category: 'power',
            color: 0x8B4513,
            power: 35,
            uses: 2,
            description: 'A sturdy wooden board for defense'
        },
        {
            name: 'Metal Bar',
            category: 'power',
            color: 0x808080,
            power: 45,
            uses: 3,
            description: 'A heavy metal bar for offense'
        },
        // Office Accessories (Utility items)
        {
            name: 'Coffee Mug',
            category: 'healing',
            color: 0x8B0000,
            power: 20,
            uses: 2,
            description: 'Hot coffee that can be thrown at enemies'
        },
        {
            name: 'Paper Stack',
            category: 'special',
            color: 0xFFFFFF,
            power: 30,
            uses: 3,
            description: 'Throwing paper can distract enemies'
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
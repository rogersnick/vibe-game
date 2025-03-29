import { Scene } from 'phaser';
import { Player } from '../../entities/Player';
import { CollectibleSpawner } from '../../entities/CollectibleSpawner';

interface RoomConfig {
    width: number;
    height: number;
    collectibleCount: number;
}

type Material = 'wood' | 'metal' | 'plastic' | 'glass' | 'stone' | 'fabric' | 'paper' | 'electronic';
type Fragility = 'fragile' | 'normal' | 'sturdy' | 'reinforced';

interface OfficeElement {
    name: string;
    width: number;
    height: number;
    color: number;
    borderColor: number;
    category: 'room' | 'furniture' | 'equipment' | 'hazard';
    material: Material;
    fragility: Fragility;
    hp: number;
    value: number;
}

interface LayoutElement {
    rectangle: Phaser.GameObjects.Rectangle;
    text: Phaser.GameObjects.Text;
    element: OfficeElement;
}

export class LayoutGenerator {
    private scene: Scene;
    private player: Player;
    private collectibleSpawner: CollectibleSpawner;
    private currentLayout: LayoutElement[] = [];
    private roomConfig: RoomConfig | null = null;
    private readonly TEXT_VISIBILITY_DISTANCE = 150; // Distance in pixels at which text becomes visible

    // Material base HP multipliers
    private readonly MATERIAL_HP_MULTIPLIERS: Record<Material, number> = {
        'wood': 1.0,
        'metal': 2.0,
        'plastic': 0.8,
        'glass': 0.5,
        'stone': 2.5,
        'fabric': 0.6,
        'paper': 0.3,
        'electronic': 1.2
    };

    // Fragility multipliers
    private readonly FRAGILITY_MULTIPLIERS: Record<Fragility, number> = {
        'fragile': 0.5,
        'normal': 1.0,
        'sturdy': 1.5,
        'reinforced': 2.0
    };

    // Material value multipliers
    private readonly MATERIAL_VALUE_MULTIPLIERS: Record<Material, number> = {
        'wood': 1.0,
        'metal': 2.5,
        'plastic': 0.5,
        'glass': 1.5,
        'stone': 3.0,
        'fabric': 0.8,
        'paper': 0.2,
        'electronic': 2.0
    };

    // Fragility value multipliers
    private readonly FRAGILITY_VALUE_MULTIPLIERS: Record<Fragility, number> = {
        'fragile': 1.5,    // Fragile items are often more valuable
        'normal': 1.0,
        'sturdy': 1.2,
        'reinforced': 1.8
    };

    // Category value multipliers
    private readonly CATEGORY_VALUE_MULTIPLIERS: Record<OfficeElement['category'], number> = {
        'room': 3.0,
        'furniture': 1.5,
        'equipment': 2.0,
        'hazard': 0.5
    };

    // Office elements with their properties
    private readonly OFFICE_ELEMENTS: OfficeElement[] = [
        // Rooms
        { 
            name: 'Cubicle', 
            width: 120, 
            height: 100, 
            color: 0x001835, 
            borderColor: 0x004657, 
            category: 'room',
            material: 'metal',
            fragility: 'sturdy',
            hp: 0,
            value: 0
        },
        { 
            name: 'Private Office', 
            width: 150, 
            height: 120, 
            color: 0x001b26, 
            borderColor: 0x004559, 
            category: 'room',
            material: 'stone',
            fragility: 'reinforced',
            hp: 0,
            value: 0
        },
        { 
            name: 'Conference Room', 
            width: 200, 
            height: 150, 
            color: 0x001a27, 
            borderColor: 0x00455e, 
            category: 'room',
            material: 'stone',
            fragility: 'reinforced',
            hp: 0,
            value: 0
        },
        { 
            name: 'Break Room', 
            width: 180, 
            height: 130, 
            color: 0x001a2b, 
            borderColor: 0x007689, 
            category: 'room',
            material: 'stone',
            fragility: 'reinforced',
            hp: 0,
            value: 0
        },
        
        // Furniture
        { 
            name: 'Desk', 
            width: 80, 
            height: 40, 
            color: 0x7b111f, 
            borderColor: 0x370016, 
            category: 'furniture',
            material: 'wood',
            fragility: 'normal',
            hp: 0,
            value: 0
        },
        { 
            name: 'Filing Cabinet', 
            width: 40, 
            height: 60, 
            color: 0x69292f, 
            borderColor: 0x300621, 
            category: 'furniture',
            material: 'metal',
            fragility: 'sturdy',
            hp: 0,
            value: 0
        },
        { 
            name: 'Bookshelf', 
            width: 60, 
            height: 100, 
            color: 0x543640, 
            borderColor: 0x1f122d, 
            category: 'furniture',
            material: 'wood',
            fragility: 'normal',
            hp: 0,
            value: 0
        },
        { 
            name: 'Meeting Table', 
            width: 120, 
            height: 60, 
            color: 0xbf3825, 
            borderColor: 0x001b26, 
            category: 'furniture',
            material: 'wood',
            fragility: 'sturdy',
            hp: 0,
            value: 0
        },
        
        // Equipment
        { 
            name: 'Printer', 
            width: 50, 
            height: 50, 
            color: 0xa74f3c, 
            borderColor: 0x001a27, 
            category: 'equipment',
            material: 'plastic',
            fragility: 'fragile',
            hp: 0,
            value: 0
        },
        { 
            name: 'Computer', 
            width: 40, 
            height: 30, 
            color: 0x8c5f53, 
            borderColor: 0x001a2b, 
            category: 'equipment',
            material: 'electronic',
            fragility: 'fragile',
            hp: 0,
            value: 0
        },
        { 
            name: 'Projector', 
            width: 30, 
            height: 20, 
            color: 0xf3714a, 
            borderColor: 0x373f52, 
            category: 'equipment',
            material: 'plastic',
            fragility: 'fragile',
            hp: 0,
            value: 0
        },
        { 
            name: 'Coffee Machine', 
            width: 40, 
            height: 60, 
            color: 0xdc8060, 
            borderColor: 0x004559, 
            category: 'equipment',
            material: 'metal',
            fragility: 'normal',
            hp: 0,
            value: 0
        },
        
        // Hazards
        { 
            name: 'Spilled Coffee', 
            width: 40, 
            height: 40, 
            color: 0xc48c76, 
            borderColor: 0x00455e, 
            category: 'hazard',
            material: 'fabric',
            fragility: 'fragile',
            hp: 0,
            value: 0
        },
        { 
            name: 'Loose Wires', 
            width: 30, 
            height: 30, 
            color: 0xffbc9f, 
            borderColor: 0x007689, 
            category: 'hazard',
            material: 'electronic',
            fragility: 'fragile',
            hp: 0,
            value: 0
        },
        { 
            name: 'Paper Stack', 
            width: 30, 
            height: 40, 
            color: 0x8dd8ed, 
            borderColor: 0x347482, 
            category: 'hazard',
            material: 'paper',
            fragility: 'fragile',
            hp: 0,
            value: 0
        },
        { 
            name: 'Broken Printer', 
            width: 50, 
            height: 50, 
            color: 0xb2d2d7, 
            borderColor: 0xa7968d, 
            category: 'hazard',
            material: 'plastic',
            fragility: 'fragile',
            hp: 0,
            value: 0
        }
    ];

    constructor(scene: Scene, player: Player, collectibleSpawner: CollectibleSpawner) {
        this.scene = scene;
        this.player = player;
        this.collectibleSpawner = collectibleSpawner;
        (scene as any).layoutGenerator = this;

        // Add update event to check text visibility
        scene.events.on('update', this.updateTextVisibility, this);
    }

    private calculateHP(element: OfficeElement): number {
        // Base HP is area of the element
        const baseHP = element.width * element.height;
        
        // Apply material and fragility multipliers
        const materialMultiplier = this.MATERIAL_HP_MULTIPLIERS[element.material];
        const fragilityMultiplier = this.FRAGILITY_MULTIPLIERS[element.fragility];
        
        // Calculate final HP
        return Math.round(baseHP * materialMultiplier * fragilityMultiplier);
    }

    private calculateValue(element: OfficeElement): number {
        // Base value is area of the element
        const baseValue = element.width * element.height;
        
        // Apply multipliers
        const materialMultiplier = this.MATERIAL_VALUE_MULTIPLIERS[element.material];
        const fragilityMultiplier = this.FRAGILITY_VALUE_MULTIPLIERS[element.fragility];
        const categoryMultiplier = this.CATEGORY_VALUE_MULTIPLIERS[element.category];
        
        // Calculate final value
        return Math.round(baseValue * materialMultiplier * fragilityMultiplier * categoryMultiplier);
    }

    getRoom(): Phaser.GameObjects.Rectangle | null {
        return this.currentLayout[0]?.rectangle || null;
    }

    private getRandomNumber(min: number, max: number, defaultValue: number): number {
        return (Phaser.Math.Between(min, max) ?? defaultValue) as number;
    }

    generateNewLayout(): void {
        this.clearLayout();

        // Generate a random room configuration
        this.roomConfig = {
            width: this.getRandomNumber(800, 1200, 1000),
            height: this.getRandomNumber(600, 900, 750),
            collectibleCount: this.getRandomNumber(5, 10, 7)
        };

        // Create the main room
        const room = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.roomConfig.width,
            this.roomConfig.height,
            0x001835
        )
        .setStrokeStyle(2, 0x004657)
        .setAlpha(0.8)
        .setDepth(-1);

        const mainOfficeElement: OfficeElement = {
            name: 'Main Office',
            width: this.roomConfig.width,
            height: this.roomConfig.height,
            color: 0x001835,
            borderColor: 0x004657,
            category: 'room',
            material: 'stone',
            fragility: 'reinforced',
            hp: 0,
            value: 0
        };
        mainOfficeElement.hp = this.calculateHP(mainOfficeElement);
        mainOfficeElement.value = this.calculateValue(mainOfficeElement);

        const roomText = this.scene.add.text(
            room.x,
            room.y - this.roomConfig.height/2 + 20,
            `Main Office\nHP: ${mainOfficeElement.hp}\nValue: ${mainOfficeElement.value}\nMaterial: ${mainOfficeElement.material}\nFragility: ${mainOfficeElement.fragility}`,
            {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: '#001835',
                padding: { x: 5, y: 2 },
                align: 'center'
            }
        )
        .setOrigin(0.5, 0)
        .setDepth(0)
        .setVisible(false); // Initially hidden

        this.currentLayout.push({ rectangle: room, text: roomText, element: mainOfficeElement });

        // Generate random office elements (up to 20)
        const elementCount = this.getRandomNumber(10, 20, 15);
        const placedElements: OfficeElement[] = [];

        for (let i = 0; i < elementCount; i++) {
            const element = { ...this.OFFICE_ELEMENTS[this.getRandomNumber(0, this.OFFICE_ELEMENTS.length - 1, 0)] };
            element.hp = this.calculateHP(element);
            element.value = this.calculateValue(element);
            
            // Try to place the element
            const position = this.findSafePositionForElement(element, placedElements);
            if (position) {
                const obstacle = this.scene.add.rectangle(
                    position.x,
                    position.y,
                    element.width,
                    element.height,
                    element.color
                )
                .setStrokeStyle(1, element.borderColor)
                .setAlpha(0.6)
                .setDepth(-1);

                const text = this.scene.add.text(
                    position.x,
                    position.y - element.height/2 - 20,
                    `${element.name}\nHP: ${element.hp}\nValue: ${element.value}\nMaterial: ${element.material}\nFragility: ${element.fragility}`,
                    {
                        fontSize: '12px',
                        color: '#ffffff',
                        backgroundColor: element.color.toString(16),
                        padding: { x: 3, y: 1 },
                        align: 'center'
                    }
                )
                .setOrigin(0.5, 0)
                .setDepth(0)
                .setVisible(false); // Initially hidden

                this.currentLayout.push({ rectangle: obstacle, text: text, element: element });
                placedElements.push(element);
            }
        }

        // Spawn collectibles
        for (let i = 0; i < this.roomConfig.collectibleCount; i++) {
            this.collectibleSpawner.spawnRandomCollectible();
        }

        // Position player
        const playerPos = this.findSafePosition();
        this.player.setPosition(playerPos.x, playerPos.y);
    }

    private findSafePositionForElement(element: OfficeElement, placedElements: OfficeElement[]): { x: number; y: number } | null {
        if (!this.roomConfig || !this.currentLayout[0]) return null;

        const room = this.currentLayout[0].rectangle;
        const maxAttempts = 50;
        let attempts = 0;

        while (attempts < maxAttempts) {
            const x = this.getRandomNumber(
                room.x - this.roomConfig.width/2 + element.width/2,
                room.x + this.roomConfig.width/2 - element.width/2,
                room.x
            );
            const y = this.getRandomNumber(
                room.y - this.roomConfig.height/2 + element.height/2,
                room.y + this.roomConfig.height/2 - element.height/2,
                room.y
            );

            // Check if position is safe
            let isSafe = true;

            // Check collision with existing elements
            for (let i = 1; i < this.currentLayout.length; i++) {
                const existing = this.currentLayout[i].rectangle;
                if (this.isOverlapping(x, y, element.width, element.height, existing)) {
                    isSafe = false;
                    break;
                }
            }

            if (isSafe) {
                return { x, y };
            }

            attempts++;
        }

        return null;
    }

    checkCollision(x: number, y: number, size: number): boolean {
        if (!this.roomConfig) return false;

        const room = this.currentLayout[0]?.rectangle;
        if (!room) return false;

        // Check room boundaries
        const halfWidth = this.roomConfig.width / 2;
        const halfHeight = this.roomConfig.height / 2;
        const halfSize = size / 2;

        if (x - halfSize < room.x - halfWidth || 
            x + halfSize > room.x + halfWidth ||
            y - halfSize < room.y - halfHeight || 
            y + halfSize > room.y + halfHeight) {
            return true;
        }

        // Check collision with obstacles
        for (let i = 1; i < this.currentLayout.length; i++) {
            const layoutElement = this.currentLayout[i];
            const obstacle = layoutElement.rectangle;
            const element = layoutElement.element;

            // Calculate the actual collision box for the element
            const elementHalfWidth = element.width / 2;
            const elementHalfHeight = element.height / 2;
            const elementX = obstacle.x;
            const elementY = obstacle.y;

            // Check if the player's collision box overlaps with the element's collision box
            if (x + halfSize > elementX - elementHalfWidth &&
                x - halfSize < elementX + elementHalfWidth &&
                y + halfSize > elementY - elementHalfHeight &&
                y - halfSize < elementY + elementHalfHeight) {
                return true;
            }
        }

        return false;
    }

    private findSafePosition(): { x: number; y: number } {
        if (!this.roomConfig || !this.currentLayout[0]) {
            return { x: 0, y: 0 };
        }

        const room = this.currentLayout[0].rectangle;
        let x, y;
        let isSafe = false;

        while (!isSafe) {
            x = this.getRandomNumber(room.x - this.roomConfig.width/2 + 50, room.x + this.roomConfig.width/2 - 50, room.x);
            y = this.getRandomNumber(room.y - this.roomConfig.height/2 + 50, room.y + this.roomConfig.height/2 - 50, room.y);
            
            isSafe = true;
            for (let i = 1; i < this.currentLayout.length; i++) {
                const obstacle = this.currentLayout[i].rectangle;
                if (this.isOverlapping(x, y, 32, 32, obstacle)) {
                    isSafe = false;
                    break;
                }
            }
        }

        return { x: x ?? 0, y: y ?? 0 };
    }

    private isOverlapping(x1: number, y1: number, w1: number, h1: number, rect: Phaser.GameObjects.Rectangle): boolean {
        const x2 = rect.x;
        const y2 = rect.y;
        const w2 = rect.width;
        const h2 = rect.height;

        // Calculate half dimensions for more accurate collision detection
        const halfW1 = w1 / 2;
        const halfH1 = h1 / 2;
        const halfW2 = w2 / 2;
        const halfH2 = h2 / 2;

        return !(x1 + halfW1 < x2 - halfW2 || 
                x1 - halfW1 > x2 + halfW2 || 
                y1 + halfH1 < y2 - halfH2 || 
                y1 - halfH1 > y2 + halfH2);
    }

    private clearLayout(): void {
        this.currentLayout.forEach(layoutElement => {
            layoutElement.rectangle.destroy();
            layoutElement.text.destroy();
        });
        this.currentLayout = [];
        this.roomConfig = null;
    }

    destroy(): void {
        this.clearLayout();
        delete (this.scene as any).layoutGenerator;
    }

    private updateTextVisibility(): void {
        const playerPos = this.player.getPosition();
        const playerX = playerPos.x;
        const playerY = playerPos.y;

        this.currentLayout.forEach(layoutElement => {
            const distance = Phaser.Math.Distance.Between(
                playerX,
                playerY,
                layoutElement.rectangle.x,
                layoutElement.rectangle.y
            );

            // Show text only if player is within visibility distance
            layoutElement.text.setVisible(distance <= this.TEXT_VISIBILITY_DISTANCE);
        });
    }
} 
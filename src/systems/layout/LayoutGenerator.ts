import {Scene} from 'phaser';
import {Player} from '../../entities/Player';
import {CollectibleSpawner} from '../../entities/CollectibleSpawner';

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
    category: 'room' | 'furniture' | 'equipment' | 'hazard';
    material: string;
    fragility: string;
    hp: number;
    maxHp: number;
    value: number;
    text?: Phaser.GameObjects.Container | Phaser.GameObjects.Text;
}

interface LayoutElement {
    rectangle: Phaser.GameObjects.Rectangle;
    text?: Phaser.GameObjects.Container | Phaser.GameObjects.Text;
    element: OfficeElement;
}

export class LayoutGenerator {
    private scene: Scene;
    private player: Player;
    private collectibleSpawner: CollectibleSpawner;
    private currentLayout: LayoutElement[] = [];
    private roomConfig: RoomConfig | null = null;
    private readonly TEXT_VISIBILITY_DISTANCE = 150; // Distance in pixels at which text becomes visible
    private mainRoom: {
        x: number;
        y: number;
        width: number;
        height: number;
        element: Phaser.GameObjects.Rectangle;
        border: Phaser.GameObjects.Rectangle;
    } | null = null;
    private obstacles: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        element: Phaser.GameObjects.Rectangle;
        border: Phaser.GameObjects.Rectangle;
    }> = [];

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
        // Room variations
        {
            name: 'Small Office',
            width: 100,
            height: 100,
            color: 0x001835,
            category: 'room',
            material: 'metal',
            fragility: 'sturdy',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        {
            name: 'Medium Office',
            width: 120,
            height: 120,
            color: 0x001b26,
            category: 'room',
            material: 'stone',
            fragility: 'reinforced',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        {
            name: 'Large Office',
            width: 150,
            height: 150,
            color: 0x001a27,
            category: 'room',
            material: 'stone',
            fragility: 'reinforced',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        {
            name: 'Conference Room',
            width: 130,
            height: 130,
            color: 0x001a2b,
            category: 'room',
            material: 'stone',
            fragility: 'reinforced',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        // Furniture
        {
            name: 'Desk',
            width: 40,
            height: 40,
            color: 0x7b111f,
            category: 'furniture',
            material: 'wood',
            fragility: 'normal',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        {
            name: 'Cabinet',
            width: 60,
            height: 60,
            color: 0x69292f,
            category: 'furniture',
            material: 'metal',
            fragility: 'sturdy',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        {
            name: 'Bookshelf',
            width: 100,
            height: 100,
            color: 0x543640,
            category: 'furniture',
            material: 'wood',
            fragility: 'normal',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        {
            name: 'Chair',
            width: 60,
            height: 60,
            color: 0xbf3825,
            category: 'furniture',
            material: 'wood',
            fragility: 'sturdy',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        // Equipment
        {
            name: 'Computer',
            width: 50,
            height: 50,
            color: 0xa74f3c,
            category: 'equipment',
            material: 'plastic',
            fragility: 'fragile',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        {
            name: 'Printer',
            width: 30,
            height: 30,
            color: 0x8c5f53,
            category: 'equipment',
            material: 'electronic',
            fragility: 'fragile',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        {
            name: 'Phone',
            width: 20,
            height: 20,
            color: 0xf3714a,
            category: 'equipment',
            material: 'plastic',
            fragility: 'fragile',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        {
            name: 'Filing Cabinet',
            width: 60,
            height: 60,
            color: 0xdc8060,
            category: 'equipment',
            material: 'metal',
            fragility: 'normal',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        // Hazards
        {
            name: 'Spilled Coffee',
            width: 40,
            height: 40,
            color: 0xc48c76,
            category: 'hazard',
            material: 'fabric',
            fragility: 'fragile',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        {
            name: 'Exposed Wires',
            width: 30,
            height: 30,
            color: 0xffbc9f,
            category: 'hazard',
            material: 'electronic',
            fragility: 'fragile',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        {
            name: 'Paper Stack',
            width: 40,
            height: 40,
            color: 0x8dd8ed,
            category: 'hazard',
            material: 'paper',
            fragility: 'fragile',
            hp: 0,
            maxHp: 0,
            value: 0
        },
        {
            name: 'Broken Glass',
            width: 50,
            height: 50,
            color: 0xb2d2d7,
            category: 'hazard',
            material: 'plastic',
            fragility: 'fragile',
            hp: 0,
            maxHp: 0,
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

    getRoom(): Phaser.GameObjects.Rectangle | null {
        return this.currentLayout[0]?.rectangle || null;
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
            .setStrokeStyle(4, 0xCCCCCC)  // 4px light gray border
            .setAlpha(0.8)
            .setDepth(-1);

        const mainOfficeElement: OfficeElement = {
            name: 'Main Office',
            width: this.roomConfig.width,
            height: this.roomConfig.height,
            color: 0x001835,
            category: 'room',
            material: 'stone',
            fragility: 'reinforced',
            hp: 0,
            maxHp: 0,
            value: 0
        };
        mainOfficeElement.hp = this.calculateHP(mainOfficeElement);
        mainOfficeElement.value = this.calculateValue(mainOfficeElement);

        this.createElementText(mainOfficeElement, room.x, room.y - this.roomConfig.height / 2 + 20);

        this.currentLayout.push({rectangle: room, text: mainOfficeElement.text!, element: mainOfficeElement});

        // Generate random office elements (up to 20)
        const elementCount = this.getRandomNumber(10, 20, 15);
        const placedElements: OfficeElement[] = [];

        for (let i = 0; i < elementCount; i++) {
            const element = {...this.OFFICE_ELEMENTS[this.getRandomNumber(0, this.OFFICE_ELEMENTS.length - 1, 0)]};
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
                    .setStrokeStyle(4, 0xCCCCCC)  // 4px light gray border
                    .setAlpha(0.6)
                    .setDepth(-1);

                this.createElementText(element, position.x, position.y - element.height / 2 - 20);

                this.currentLayout.push({rectangle: obstacle, text: element.text!, element: element});
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

    destroy(): void {
        this.clearLayout();
        delete (this.scene as any).layoutGenerator;
    }

    getTouchedElement(x: number, y: number, interactionSize: number = 32): LayoutElement | null {
        // Skip the first element (main room)
        for (let i = 1; i < this.currentLayout.length; i++) {
            const layoutElement = this.currentLayout[i];
            const obstacle = layoutElement.rectangle;
            const element = layoutElement.element;

            // Calculate the actual collision box for the element
            const elementHalfWidth = element.width / 2;
            const elementHalfHeight = element.height / 2;
            const elementX = obstacle.x;
            const elementY = obstacle.y;

            // Check if the point is within the element's bounds, including the interaction size
            if (x > elementX - elementHalfWidth - interactionSize / 2 &&
                x < elementX + elementHalfWidth + interactionSize / 2 &&
                y > elementY - elementHalfHeight - interactionSize / 2 &&
                y < elementY + elementHalfHeight + interactionSize / 2) {
                return layoutElement;
            }
        }
        return null;
    }

    updateElementVisual(layoutElement: LayoutElement): void {
        const element = layoutElement.element;
        const rectangle = layoutElement.rectangle;

        // Update the rectangle's alpha based on HP
        const maxHp = this.calculateHP(element);
        const hpPercentage = element.hp / maxHp;
        rectangle.setAlpha(0.6 * hpPercentage);

        // Update text color based on HP
        if (layoutElement.text) {
            const hpText = (layoutElement.text as Phaser.GameObjects.Container)
                .list.find(child => child instanceof Phaser.GameObjects.Text && child.text.startsWith('HP:')) as Phaser.GameObjects.Text;

            if (hpText) {
                hpText.setText(`HP: ${element.hp}`);
                hpText.setColor(
                    element.hp > maxHp * 0.7 ? '#4CAF50' :
                        element.hp > maxHp * 0.3 ? '#FFC107' : '#F44336'
                );
            }
        }

        // If HP is 0 or less, destroy the element
        if (element.hp <= 0) {
            rectangle.destroy();
            layoutElement.text?.destroy();
            const index = this.currentLayout.indexOf(layoutElement);
            if (index > -1) {
                this.currentLayout.splice(index, 1);
            }
        }
    }

    private calculateHP(element: OfficeElement): number {
        // Base HP is area of the element
        const baseHP = element.width * element.height;

        // Apply material and fragility multipliers
        const materialMultiplier = this.MATERIAL_HP_MULTIPLIERS[element.material as Material];
        const fragilityMultiplier = this.FRAGILITY_MULTIPLIERS[element.fragility as Fragility];

        // Calculate final HP
        return Math.round(baseHP * materialMultiplier * fragilityMultiplier);
    }

    private calculateValue(element: OfficeElement): number {
        // Base value is area of the element
        const baseValue = element.width * element.height;

        // Apply multipliers
        const materialMultiplier = this.MATERIAL_VALUE_MULTIPLIERS[element.material as Material];
        const fragilityMultiplier = this.FRAGILITY_VALUE_MULTIPLIERS[element.fragility as Fragility];
        const categoryMultiplier = this.CATEGORY_VALUE_MULTIPLIERS[element.category];

        // Calculate final value
        return Math.round(baseValue * materialMultiplier * fragilityMultiplier * categoryMultiplier);
    }

    private getRandomNumber(min: number, max: number, defaultValue: number): number {
        return (Phaser.Math.Between(min, max) ?? defaultValue) as number;
    }

    private findSafePositionForElement(element: OfficeElement, placedElements: OfficeElement[]): {
        x: number;
        y: number
    } | null {
        if (!this.roomConfig || !this.currentLayout[0]) return null;

        const room = this.currentLayout[0].rectangle;
        const maxAttempts = 50;
        let attempts = 0;

        while (attempts < maxAttempts) {
            const x = this.getRandomNumber(
                room.x - this.roomConfig.width / 2 + element.width / 2,
                room.x + this.roomConfig.width / 2 - element.width / 2,
                room.x
            );
            const y = this.getRandomNumber(
                room.y - this.roomConfig.height / 2 + element.height / 2,
                room.y + this.roomConfig.height / 2 - element.height / 2,
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
                return {x, y};
            }

            attempts++;
        }

        return null;
    }

    private findSafePosition(): { x: number; y: number } {
        if (!this.roomConfig || !this.currentLayout[0]) {
            return {x: 0, y: 0};
        }

        const room = this.currentLayout[0].rectangle;
        let x, y;
        let isSafe = false;

        while (!isSafe) {
            x = this.getRandomNumber(room.x - this.roomConfig.width / 2 + 50, room.x + this.roomConfig.width / 2 - 50, room.x);
            y = this.getRandomNumber(room.y - this.roomConfig.height / 2 + 50, room.y + this.roomConfig.height / 2 - 50, room.y);

            isSafe = true;
            for (let i = 1; i < this.currentLayout.length; i++) {
                const obstacle = this.currentLayout[i].rectangle;
                if (this.isOverlapping(x, y, 32, 32, obstacle)) {
                    isSafe = false;
                    break;
                }
            }
        }

        return {x: x ?? 0, y: y ?? 0};
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
            layoutElement.text?.destroy();
        });
        this.currentLayout = [];
        this.roomConfig = null;
    }

    private createElementText(element: OfficeElement, x: number, y: number): void {
        const textStyle = {
            fontSize: '14px',
            fontFamily: 'Arial',
            align: 'center',
            wordWrap: {width: 150},
            backgroundColor: '#000000',
            padding: {x: 8, y: 4}
        };

        // Create a container for the text elements
        const container = this.scene.add.container(x, y);
        container.setDepth(2);
        container.setAlpha(0);
        element.text = container;

        // Create text elements with different colors based on the element's properties
        const nameText = this.scene.add.text(0, 0, element.name, {
            ...textStyle,
            color: '#ffffff',
            fontSize: '16px'
        }).setOrigin(0.5, 0);

        const hpText = this.scene.add.text(0, 25, `HP: ${element.hp}`, {
            ...textStyle,
            color: element.hp > element.maxHp * 0.7 ? '#4CAF50' :
                element.hp > element.maxHp * 0.3 ? '#FFC107' : '#F44336'
        }).setOrigin(0.5, 0);

        const valueText = this.scene.add.text(0, 45, `Value: ${element.value}`, {
            ...textStyle,
            color: '#FFD700'
        }).setOrigin(0.5, 0);

        const materialText = this.scene.add.text(0, 65, element.material, {
            ...textStyle,
            color: '#64B5F6'
        }).setOrigin(0.5, 0);

        const fragilityText = this.scene.add.text(0, 85, element.fragility, {
            ...textStyle,
            color: element.fragility === 'fragile' ? '#F44336' :
                element.fragility === 'normal' ? '#4CAF50' :
                    element.fragility === 'sturdy' ? '#2196F3' : '#9C27B0'
        }).setOrigin(0.5, 0);

        // Add all text elements to the container
        container.add([nameText, hpText, valueText, materialText, fragilityText]);

        // Add a background rectangle
        const padding = 10;
        const width = Math.max(
            nameText.width,
            hpText.width,
            valueText.width,
            materialText.width,
            fragilityText.width
        ) + padding * 2;
        const height = fragilityText.y + fragilityText.height + padding * 2;

        const background = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.1);
        background.setOrigin(0.5, 0);
        container.addAt(background, 0);

        // Add a border with the element's color
        const border = this.scene.add.rectangle(0, 0, width, height, element.color, 0.3);
        border.setOrigin(0.5, 0);

        // Use thicker border for room elements
        const borderWidth = element.category === 'room' ? 4 : 2;
        const borderAlpha = element.category === 'room' ? 0.8 : 0.5;
        border.setStrokeStyle(borderWidth, element.color, borderAlpha);
        container.addAt(border, 1);

        // Add an outer glow for room elements
        if (element.category === 'room') {
            const glow = this.scene.add.rectangle(0, 0, width + 8, height + 8, element.color, 0.2);
            glow.setOrigin(0.5, 0);
            glow.setStrokeStyle(1, element.color, 0.3);
            container.addAt(glow, 0);
        }
    }

    private updateTextVisibility(): void {
        const playerPos = this.player.getPosition();
        const TEXT_VISIBILITY_DISTANCE = 150;

        this.currentLayout.forEach(element => {
            if (element.text) {
                const distance = Phaser.Math.Distance.Between(
                    playerPos.x, playerPos.y,
                    element.rectangle.x, element.rectangle.y
                );

                // Smoothly fade in/out based on distance
                const targetAlpha = distance < TEXT_VISIBILITY_DISTANCE ? 1 : 0;
                const currentAlpha = element.text.alpha;
                const newAlpha = Phaser.Math.Linear(currentAlpha, targetAlpha, 0.1);
                element.text.setAlpha(newAlpha);

                // Scale based on distance
                const scale = Phaser.Math.Clamp(
                    1 - (distance / TEXT_VISIBILITY_DISTANCE),
                    0.8,
                    1.2
                );
                element.text.setScale(scale);
            }
        });
    }

    private createRoom(): void {
        // Create main room
        const roomWidth = 800;
        const roomHeight = 600;
        const roomX = this.scene.cameras.main.centerX;
        const roomY = this.scene.cameras.main.centerY;

        // Create room background
        const room = this.scene.add.rectangle(
            roomX,
            roomY,
            roomWidth,
            roomHeight,
            0xE6F3FF,  // Pastel blue
            0.7        // Slightly transparent
        );

        // Add room border
        const roomBorder = this.scene.add.rectangle(
            roomX,
            roomY,
            roomWidth,
            roomHeight,
            0xB3D9FF,  // Slightly darker pastel blue
            0.7        // Slightly transparent
        );
        roomBorder.setStrokeStyle(4, 0xCCCCCC);  // 4px light gray border

        // Store room reference
        this.mainRoom = {
            x: roomX,
            y: roomY,
            width: roomWidth,
            height: roomHeight,
            element: room,
            border: roomBorder
        };
    }

    private createObstacle(x: number, y: number, width: number, height: number, color: number): void {
        // Create obstacle
        const obstacle = this.scene.add.rectangle(
            x,
            y,
            width,
            height,
            color,
            0.5  // Semi-transparent
        );

        // Add obstacle border
        const obstacleBorder = this.scene.add.rectangle(
            x,
            y,
            width,
            height,
            color,
            0.5  // Semi-transparent
        );
        obstacleBorder.setStrokeStyle(4, 0xCCCCCC);  // 4px light gray border

        // Add to obstacles array
        this.obstacles.push({
            x,
            y,
            width,
            height,
            element: obstacle,
            border: obstacleBorder
        });
    }
} 
import {Scene} from 'phaser';

export class MenuScene extends Scene {
    private menuItems: Phaser.GameObjects.Text[] = [];
    private currentIndex: number = 0;
    private menuTexts: string[] = ['Start Game', 'Options', 'Credits'];

    constructor() {
        super({key: 'MenuScene'});
    }

    preload(): void {
        // Load the title image
        this.load.image('title', 'assets/title.jpeg');
    }

    create(): void {
        // Create office background
        this.createOfficeBackground();

        // Add title image
        const titleImage = this.add.image(this.cameras.main.centerX, 150, 'title');
        titleImage.setScale(0.8); // Adjust scale as needed
        titleImage.setOrigin(0.5);

        // Add subtitle
        const subtitle = this.add.text(this.cameras.main.centerX, 220, 'a Kefkaian experience', {
            font: '48px monospace',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        subtitle.setOrigin(0.5);

        // Add menu options
        const menuSpacing = 60;
        const startY = 350;

        this.menuTexts.forEach((item, index) => {
            const text = this.add.text(this.cameras.main.centerX, startY + (index * menuSpacing), item, {
                font: '32px monospace',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: {x: 20, y: 10}
            })
                .setOrigin(0.5)
                .setInteractive({useHandCursor: true})
                .on('pointerover', () => {
                    this.currentIndex = index;
                    this.updateMenuSelection();
                })
                .on('pointerout', () => {
                    text.setColor('#ffffff');
                })
                .on('pointerdown', () => this.handleMenuSelection(item));

            this.menuItems.push(text);
        });

        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-DOWN', () => {
                if (this.menuItems.length > 0) {
                    this.currentIndex = (this.currentIndex + 1) % this.menuItems.length;
                    this.updateMenuSelection();
                }
            });
            this.input.keyboard.on('keydown-UP', () => {
                if (this.menuItems.length > 0) {
                    this.currentIndex = (this.currentIndex - 1 + this.menuItems.length) % this.menuItems.length;
                    this.updateMenuSelection();
                }
            });
            this.input.keyboard.on('keydown-ENTER', () => {
                if (this.menuItems.length > 0 && this.currentIndex >= 0 && this.currentIndex < this.menuItems.length) {
                    this.handleMenuSelection(this.menuTexts[this.currentIndex]);
                }
            });
        }
        // Set initial selection
        this.updateMenuSelection();
    }

    update(): void {
        // No update logic needed for menu scene
    }

    private updateMenuSelection(): void {
        if (this.menuItems.length === 0) return;

        this.menuItems.forEach((item, index) => {
            if (index === this.currentIndex) {
                item.setColor('#ff0000');
                item.setScale(1.1);
            } else {
                item.setColor('#ffffff');
                item.setScale(1);
            }
        });
    }

    private createOfficeBackground(): void {
        // Create office floor
        const floor = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.height - 100,
            this.cameras.main.width,
            200,
            0xF5F5FF  // Very light lavender
        );

        // Create office walls
        const leftWall = this.add.rectangle(
            0,
            this.cameras.main.centerY,
            100,
            this.cameras.main.height,
            0xF8FBFF  // Very light blue
        );
        const rightWall = this.add.rectangle(
            this.cameras.main.width,
            this.cameras.main.centerY,
            100,
            this.cameras.main.height,
            0xF8FBFF  // Very light blue
        );
        const backWall = this.add.rectangle(
            this.cameras.main.centerX,
            0,
            this.cameras.main.width,
            100,
            0xF8FBFF  // Very light blue
        );

        // Create office furniture
        // Desks
        const desk1 = this.add.rectangle(200, 400, 200, 60, 0xFFE4E1);  // Very light brown
        const desk2 = this.add.rectangle(600, 400, 200, 60, 0xFFE4E1);  // Very light brown
        const desk3 = this.add.rectangle(1000, 400, 200, 60, 0xFFE4E1);  // Very light brown

        // Office chairs
        const chair1 = this.add.circle(200, 450, 20, 0xE6F3FF);  // Very light steel blue
        const chair2 = this.add.circle(600, 450, 20, 0xE6F3FF);  // Very light steel blue
        const chair3 = this.add.circle(1000, 450, 20, 0xE6F3FF);  // Very light steel blue

        // Filing cabinets
        const cabinet1 = this.add.rectangle(150, 300, 40, 120, 0xFFE6FF);  // Very light purple
        const cabinet2 = this.add.rectangle(200, 300, 40, 120, 0xFFE6FF);  // Very light purple
        const cabinet3 = this.add.rectangle(1050, 300, 40, 120, 0xFFE6FF);  // Very light purple

        // Add some office decorations
        // Plants
        const plant1 = this.add.circle(100, 200, 15, 0xE8FFE8);  // Very light green
        const plant2 = this.add.circle(1180, 200, 15, 0xE8FFE8);  // Very light green

        // Add some papers scattered around
        for (let i = 0; i < 5; i++) {
            const paper = this.add.rectangle(
                Phaser.Math.Between(100, 1180),
                Phaser.Math.Between(100, 500),
                20,
                30,
                0xFFF5F8  // Very light pink
            );
            paper.setRotation(Phaser.Math.Between(-0.5, 0.5));
        }

        // Add extremely subtle shadows
        const shadowGraphics = this.add.graphics();
        shadowGraphics.fillStyle(0x000000, 0.05);  // Even more reduced opacity for very soft shadows
        shadowGraphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    }

    private handleMenuSelection(selection: string): void {
        switch (selection) {
            case 'Start Game':
                this.scene.start('GameScene');
                break;
            case 'Options':
                // TODO: Implement options menu
                console.log('Options selected');
                break;
            case 'Credits':
                // TODO: Implement credits screen
                console.log('Credits selected');
                break;
        }
    }
} 
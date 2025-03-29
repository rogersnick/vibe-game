import { Scene } from 'phaser';
import { Player } from '../entities/Player';
import { AchievementManager } from '../systems/achievements/AchievementManager';
import { StepCounterUI } from '../systems/achievements/StepCounterUI';
import { InputHandler } from '../input/InputHandler';
import { MoveCommand } from '../input/commands/MoveCommand';
import { CollectibleSpawner } from '../entities/CollectibleSpawner';
import { LayoutGenerator } from '../systems/layout/LayoutGenerator';

export class GameScene extends Scene {
    private player!: Player;
    private achievementManager!: AchievementManager;
    private stepCounterUI!: StepCounterUI;
    private inputHandler!: InputHandler;
    private collectibleSpawner!: CollectibleSpawner;
    private layoutGenerator!: LayoutGenerator;
    private spawnTimer: number = 0;
    private inventoryText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'GameScene' });
    }

    create(): void {
        // Create achievement manager
        this.achievementManager = new AchievementManager();
        
        // Create player at center of screen
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.player = new Player(this, centerX, centerY);
        
        // Connect player to achievement system
        this.player.addAchievementObserver(this.achievementManager);
        
        // Create UI
        this.stepCounterUI = new StepCounterUI(this, this.achievementManager);
        
        // Set up input handler
        this.inputHandler = new InputHandler(this);

        // Set up movement commands
        this.inputHandler.bindKey('W', new MoveCommand(this.player, 0, -1, 'W'), true);  // Up
        this.inputHandler.bindKey('S', new MoveCommand(this.player, 0, 1, 'S'), true);   // Down
        this.inputHandler.bindKey('A', new MoveCommand(this.player, -1, 0, 'A'), true);  // Left
        this.inputHandler.bindKey('D', new MoveCommand(this.player, 1, 0, 'D'), true);   // Right

        // Set up running with Space key
        if (this.input.keyboard) {
            const spaceKey = this.input.keyboard.addKey('SPACE');
            spaceKey.on('down', () => {
                this.player.setRunning(true);
            });
            spaceKey.on('up', () => {
                this.player.setRunning(false);
            });
        }

        // Set up movement commands (Arrow Keys)
        this.inputHandler.bindKey('UP', new MoveCommand(this.player, 0, -1), true);    // Up
        this.inputHandler.bindKey('DOWN', new MoveCommand(this.player, 0, 1), true);   // Down
        this.inputHandler.bindKey('LEFT', new MoveCommand(this.player, -1, 0), true);  // Left
        this.inputHandler.bindKey('RIGHT', new MoveCommand(this.player, 1, 0), true);  // Right

        // Set up achievement unlock callback
        this.achievementManager.setOnUnlockCallback((achievement) => {
            this.showAchievementUnlock(achievement);
        });

        // Initialize collectible spawner
        this.collectibleSpawner = new CollectibleSpawner(this, this.player);
        
        // Initialize layout generator
        this.layoutGenerator = new LayoutGenerator(this, this.player, this.collectibleSpawner);
        
        // Generate initial layout
        this.layoutGenerator.generateNewLayout();

        // Create inventory counter
        this.inventoryText = this.add.text(16, 56, 'Items: 0', {
            fontSize: '24px',
            color: '#ffffff'
        });

        // Set up inventory callback
        this.player.getInventory().setOnItemCollectedCallback((count) => {
            this.inventoryText.setText(`Items: ${count}`);
        });
    }

    update(): void {
        // Update input handler (this will execute commands)
        this.inputHandler.update();
        
        // Update player (this will check for steps)
        this.player.update();

        // Update UI
        this.stepCounterUI.update();

        // Update collectibles (check for collection)
        this.collectibleSpawner.update();

        // Spawn new collectibles periodically
        this.spawnTimer += this.game.loop.delta;
        if (this.spawnTimer >= 5000) { // Spawn every 5 seconds
            this.spawnTimer = 0;
            this.collectibleSpawner.spawnRandomCollectible();
        }
    }

    private showAchievementUnlock(achievement: any): void {
        // Create a temporary text to show achievement unlock
        const text = this.add.text(
            this.cameras.main.centerX,
            100,
            `Achievement Unlocked: ${achievement.title}!`,
            {
                fontSize: '32px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5);

        // Animate the text
        this.tweens.add({
            targets: text,
            y: 50,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // Fade out and destroy
                this.tweens.add({
                    targets: text,
                    alpha: 0,
                    duration: 1000,
                    delay: 2000,
                    onComplete: () => text.destroy()
                });
            }
        });
    }

    shutdown(): void {
        this.stepCounterUI.destroy();
        this.player.destroy();
        this.inputHandler.destroy();
        this.collectibleSpawner.destroy();
        this.layoutGenerator.destroy();
        this.inventoryText.destroy();
    }
} 
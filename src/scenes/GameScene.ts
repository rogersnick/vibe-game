import { Scene } from 'phaser';
import { Player } from '../entities/Player';
import { AchievementManager } from '../systems/achievements/AchievementManager';
import { StepCounterUI } from '../systems/achievements/StepCounterUI';
import { InputHandler } from '../input/InputHandler';
import { MoveCommand } from '../input/commands/MoveCommand';
import { CollectibleSpawner } from '../entities/CollectibleSpawner';

export class GameScene extends Scene {
    private player!: Player;
    private achievementManager!: AchievementManager;
    private stepCounterUI!: StepCounterUI;
    private inputHandler!: InputHandler;
    private playerVisual!: Phaser.GameObjects.Shape;
    private collectibleSpawner!: CollectibleSpawner;
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

        // Set up movement commands (WASD)
        this.inputHandler.bindKey('W', new MoveCommand(this.player, 0, -1), true);  // Up
        this.inputHandler.bindKey('S', new MoveCommand(this.player, 0, 1), true);   // Down
        this.inputHandler.bindKey('A', new MoveCommand(this.player, -1, 0), true);  // Left
        this.inputHandler.bindKey('D', new MoveCommand(this.player, 1, 0), true);   // Right

        // Set up movement commands (Arrow Keys)
        this.inputHandler.bindKey('UP', new MoveCommand(this.player, 0, -1), true);    // Up
        this.inputHandler.bindKey('DOWN', new MoveCommand(this.player, 0, 1), true);   // Down
        this.inputHandler.bindKey('LEFT', new MoveCommand(this.player, -1, 0), true);  // Left
        this.inputHandler.bindKey('RIGHT', new MoveCommand(this.player, 1, 0), true);  // Right

        // Set up achievement unlock callback
        this.achievementManager.setOnUnlockCallback((achievement) => {
            this.showAchievementUnlock(achievement);
        });

        // Add a simple visual representation of the player (temporary)
        this.playerVisual = this.add.circle(centerX, centerY, 16, 0x00ff00);

        // Initialize collectible spawner
        this.collectibleSpawner = new CollectibleSpawner(this, this.player);
        
        // Spawn initial collectibles
        for (let i = 0; i < 5; i++) {
            this.collectibleSpawner.spawnRandomCollectible();
        }

        // Create inventory counter
        this.inventoryText = this.add.text(16, 16, 'Items: 0', {
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
        
        // Update visual representation
        const playerPos = this.player.getPosition();
        this.playerVisual.setPosition(playerPos.x, playerPos.y);
        
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
        this.playerVisual.destroy();
        this.collectibleSpawner.destroy();
        this.inventoryText.destroy();
    }
} 
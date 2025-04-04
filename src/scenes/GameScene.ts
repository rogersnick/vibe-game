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
    private collectibleSpawner!: CollectibleSpawner;
    private spawnTimer: number = 0;

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
        this.stepCounterUI = new StepCounterUI(this, this.achievementManager, this.player.getInventory());
        
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

        // Set up achievement unlock callback
        this.achievementManager.setOnUnlockCallback((achievement) => {
            this.showAchievementUnlock(achievement);
        });

        // Initialize collectible spawner
        this.collectibleSpawner = new CollectibleSpawner(this, this.player);
        
        // Spawn initial collectibles
        for (let i = 0; i < 5; i++) {
            this.collectibleSpawner.spawnRandomCollectible();
        }
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

        // Check for game over condition
        if (this.player.isPlayerDead()) {
            this.handleGameOver();
        }
    }

    private handleGameOver(): void {
        // Get all achievements
        const achievements = this.achievementManager.getAchievements();
        
        // Start the game over scene with achievements and inventory
        this.scene.start('GameOverScene', {
            inventory: this.player.getInventory(),
            achievements: achievements || [] // Ensure we always pass an array
        });
    }

    private showAchievementUnlock(achievement: any): void {
        // Create a container for the achievement notification
        const container = this.add.container(this.cameras.main.centerX, this.cameras.main.height + 100);
        
        // Create a background box
        const box = this.add.rectangle(0, 0, 400, 80, 0x000000, 0.8);
        box.setStrokeStyle(2, 0x00ff00);
        box.setOrigin(0.5);
        
        // Create achievement icon (a simple star for now)
        const icon = this.add.text(-160, 0, '⭐', {
            fontSize: '40px',
            color: '#ffd700'
        }).setOrigin(0.5);
        
        // Create achievement text with gradient effect
        const title = this.add.text(-100, -15, achievement.title, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        
        const description = this.add.text(-100, 15, 'Achievement Unlocked!', {
            fontSize: '18px',
            color: '#00ff00'
        }).setOrigin(0, 0.5);
        
        // Add all elements to the container
        container.add([box, icon, title, description]);
        
        // Animate the notification
        this.tweens.add({
            targets: container,
            y: this.cameras.main.height - 100,
            duration: 800,
            ease: 'Back.out',
            onComplete: () => {
                // Wait a bit then animate out
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: container,
                        y: this.cameras.main.height + 100,
                        alpha: 0,
                        duration: 600,
                        ease: 'Back.in',
                        onComplete: () => container.destroy()
                    });
                });
            }
        });
        
        // Add a particle effect
        const particles = this.add.particles(0, 0, 'particle', {
            x: this.cameras.main.centerX,
            y: this.cameras.main.height - 100,
            speed: { min: 200, max: 400 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            quantity: 20,
            blendMode: 'ADD',
            tint: 0x00ff00
        });
        
        // Destroy particles after animation
        this.time.delayedCall(1000, () => particles.destroy());
    }

    shutdown(): void {
        this.stepCounterUI.destroy();
        this.player.destroy();
        this.inputHandler.destroy();
        this.collectibleSpawner.destroy();
    }
} 
import {Scene} from 'phaser';
import {Player} from '../entities/Player';
import {AchievementManager} from '../systems/achievements/AchievementManager';
import {StepCounterUI} from '../systems/achievements/StepCounterUI';
import {InputHandler} from '../input/InputHandler';
import {MoveCommand} from '../input/commands/MoveCommand';
import {CollectibleSpawner} from '../entities/CollectibleSpawner';
import {LayoutGenerator} from '../systems/layout/LayoutGenerator';

export class GameScene extends Scene {
    private player!: Player;
    private achievementManager!: AchievementManager;
    private stepCounterUI!: StepCounterUI;
    private inputHandler!: InputHandler;
    private collectibleSpawner!: CollectibleSpawner;
    private layoutGenerator!: LayoutGenerator;
    private spawnTimer: number = 0;
    private inventoryText!: Phaser.GameObjects.Text;
    private timeLeft: number = 30;
    private timerText: Phaser.GameObjects.Text | null = null;
    private timerEvent: Phaser.Time.TimerEvent | null = null;
    private isGameOver: boolean = false;
    private scoreText: Phaser.GameObjects.Text | null = null;

    constructor() {
        super({key: 'GameScene'});
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

        // Set up keyboard input
        if (this.input.keyboard) {
            // Set up movement commands
            this.inputHandler.bindKey('W', new MoveCommand(this.player, 0, -1, 'W'), true);  // Up
            this.inputHandler.bindKey('S', new MoveCommand(this.player, 0, 1, 'S'), true);   // Down
            this.inputHandler.bindKey('A', new MoveCommand(this.player, -1, 0, 'A'), true);  // Left
            this.inputHandler.bindKey('D', new MoveCommand(this.player, 1, 0, 'D'), true);   // Right

            // Set up running with Space key
            const spaceKey = this.input.keyboard.addKey('SPACE');
            spaceKey.on('down', () => {
                this.player.setRunning(true);
            });
            spaceKey.on('up', () => {
                this.player.setRunning(false);
            });

            // Set up movement commands (Arrow Keys)
            this.inputHandler.bindKey('UP', new MoveCommand(this.player, 0, -1, 'UP'), true);    // Up
            this.inputHandler.bindKey('DOWN', new MoveCommand(this.player, 0, 1, 'DOWN'), true);   // Down
            this.inputHandler.bindKey('LEFT', new MoveCommand(this.player, -1, 0, 'LEFT'), true);  // Left
            this.inputHandler.bindKey('RIGHT', new MoveCommand(this.player, 1, 0, 'RIGHT'), true);  // Right
        }

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

        // Create score display
        this.scoreText = this.add.text(16, 96, 'Score: 0', {
            fontSize: '24px',
            color: '#ffffff'
        });

        // Set up inventory callback
        this.player.getInventory().setOnItemCollectedCallback((count) => {
            this.inventoryText.setText(`Items: ${count}`);
        });

        // Set up timer
        this.setupTimer();
    }

    update(): void {
        if (this.isGameOver) return;

        // Update input handler (this will execute commands)
        this.inputHandler.update();

        // Update player (this will check for steps)
        this.player.update();

        // Update UI
        this.stepCounterUI.update();

        // Update collectibles (check for collection)
        this.collectibleSpawner.update();

        // Update score display
        if (this.scoreText) {
            this.scoreText.setText(`Score: ${this.player.getTotalDamage()}`);
        }

        // Spawn new collectibles periodically
        this.spawnTimer += this.game.loop.delta;
        if (this.spawnTimer >= 5000) { // Spawn every 5 seconds
            this.spawnTimer = 0;
            this.collectibleSpawner.spawnRandomCollectible();
        }
    }

    shutdown(): void {
        this.stepCounterUI.destroy();
        this.player.destroy();
        this.inputHandler.destroy();
        this.collectibleSpawner.destroy();
        this.layoutGenerator.destroy();
        this.inventoryText.destroy();
        if (this.timerEvent) {
            this.timerEvent.destroy();
        }
        if (this.timerText) {
            this.timerText.destroy();
        }
    }

    preload(): void {
        // Load player sprite sheet
        this.load.spritesheet('player', 'assets/sprites/player.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // Load character sprite sheets
        this.load.spritesheet('character_idle', 'assets/character_idle.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('character_walk', 'assets/character_walk.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('character_run', 'assets/character_run.png', {frameWidth: 32, frameHeight: 32});

        // Create particle texture
        const graphics = this.add.graphics();
        graphics.fillStyle(0xFFFFFF);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('particle', 8, 8);
        graphics.destroy();
    }

    private setupTimer(): void {
        // Create timer text
        this.timerText = this.add.text(20, this.cameras.main.height - 60, `Time: ${this.timeLeft}s`, {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: {x: 10, y: 5}
        });
        this.timerText.setScrollFactor(0); // Keep timer fixed on screen

        // Create timer event
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    private updateTimer(): void {
        this.timeLeft--;
        if (this.timerText) {
            this.timerText.setText(`Time: ${this.timeLeft}s`);
        }

        if (this.timeLeft <= 0) {
            this.gameOver();
        }
    }

    private gameOver(): void {
        this.isGameOver = true;

        // Stop the timer
        if (this.timerEvent) {
            this.timerEvent.destroy();
            this.timerEvent = null;
        }

        // Create game over text
        const gameOverText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 50,
            'Game Over, your boss caught you!',
            {
                fontSize: '32px',
                color: '#ff0000',
                backgroundColor: '#000000',
                padding: {x: 20, y: 10}
            }
        ).setOrigin(0.5);

        // Create final score text
        const finalScoreText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            `Final Score: ${this.player.getTotalDamage()}`,
            {
                fontSize: '28px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: {x: 20, y: 10}
            }
        ).setOrigin(0.5);

        // Create retry button
        const retryButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 50,
            'Retry',
            {
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: {x: 20, y: 10}
            }
        )
            .setOrigin(0.5)
            .setInteractive()
            .setScrollFactor(0);

        // Add hover effect
        retryButton.on('pointerover', () => {
            retryButton.setColor('#ffff00');
        });

        retryButton.on('pointerout', () => {
            retryButton.setColor('#ffffff');
        });

        // Add click handler
        retryButton.on('pointerdown', () => {
            // Reset player's score before restarting
            this.player.reset();
            this.scene.restart();
        });
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
                padding: {x: 20, y: 10}
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
} 
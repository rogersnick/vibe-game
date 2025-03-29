import { Scene } from 'phaser';
import { Player } from '../entities/Player';
import { AchievementManager } from '../systems/achievements/AchievementManager';
import { StepCounterUI } from '../systems/achievements/StepCounterUI';
import { InputHandler } from '../input/InputHandler';
import { MoveCommand } from '../input/commands/MoveCommand';

export class GameScene extends Scene {
    private player!: Player;
    private achievementManager!: AchievementManager;
    private stepCounterUI!: StepCounterUI;
    private inputHandler!: InputHandler;
    private playerVisual!: Phaser.GameObjects.Shape;

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
        this.inputHandler.bindKey('W', new MoveCommand(this.player, 0, -1), true);  // Up
        this.inputHandler.bindKey('S', new MoveCommand(this.player, 0, 1), true);   // Down
        this.inputHandler.bindKey('A', new MoveCommand(this.player, -1, 0), true);  // Left
        this.inputHandler.bindKey('D', new MoveCommand(this.player, 1, 0), true);   // Right

        // Set up achievement unlock callback
        this.achievementManager.setOnUnlockCallback((achievement) => {
            this.showAchievementUnlock(achievement);
        });

        // Add a simple visual representation of the player (temporary)
        this.playerVisual = this.add.circle(centerX, centerY, 16, 0x00ff00);
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
    }
} 
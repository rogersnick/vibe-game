import { Scene, GameObjects } from 'phaser';
import { InputHandler } from '../input/InputHandler';
import { MoveCommand } from '../input/commands/MoveCommand';

export class GameScene extends Scene {
  private inputHandler!: InputHandler;
  private player!: GameObjects.Sprite;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Create a simple player sprite
    this.player = this.add.sprite(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'player'
    );
    
    // Initialize input handler
    this.inputHandler = new InputHandler(this);

    // Set up movement commands
    this.inputHandler.bindKey('W', new MoveCommand(this.player, 0, -1), true);  // Up
    this.inputHandler.bindKey('S', new MoveCommand(this.player, 0, 1), true);   // Down
    this.inputHandler.bindKey('A', new MoveCommand(this.player, -1, 0), true);  // Left
    this.inputHandler.bindKey('D', new MoveCommand(this.player, 1, 0), true);   // Right

    // Add Z key for undo (optional)
    this.input.keyboard!.on('keydown-Z', (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        this.inputHandler.undo();
      }
    });

    // Add menu button
    const menuButton = this.add.text(50, 50, 'Menu', {
      font: '24px monospace',
      color: '#ffffff'
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => menuButton.setColor('#ff0000'))
      .on('pointerout', () => menuButton.setColor('#ffffff'))
      .on('pointerdown', () => this.scene.start('MenuScene'));
  }

  update(): void {
    // Update input handler to handle held keys
    this.inputHandler.update();
  }

  destroy(): void {
    this.inputHandler.destroy();
  }
} 
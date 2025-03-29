import { Scene } from 'phaser';

export class PreloadScene extends Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px monospace',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    // Update loading bar
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });

    // Remove loading bar when complete
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      this.scene.start('MenuScene');
    });

    // Load game assets here
    this.load.spritesheet('character_idle', 'assets/character/idle.png', {
        frameWidth: 80,
        frameHeight: 80
    });

    this.load.spritesheet('character_run', 'assets/character/run.png', {
        frameWidth: 80,
        frameHeight: 80
    });

    this.load.spritesheet('character_walk', 'assets/character/walk.png', {
        frameWidth: 80,
        frameHeight: 80
    });

    this.load.spritesheet('character_death', 'assets/character/death.png', {
        frameWidth: 80,
        frameHeight: 80
    });

    // Create a temporary colored rectangle for the player (can be removed later)
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00);
    graphics.fillRect(0, 0, 32, 32);
    const texture = graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create(): void {
    // No create logic needed as we transition immediately after loading
  }

  update(): void {
    // No update logic needed for preload scene
  }
} 
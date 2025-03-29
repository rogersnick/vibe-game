import { Scene } from 'phaser';
import { Logger } from '../utils/Logger';

export class MenuScene extends Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    // Add title
    const title = this.add.text(this.cameras.main.centerX, 200, 'Item Collector', {
      font: '64px monospace',
      color: '#ffffff'
    });
    title.setOrigin(0.5);

    // Add menu options
    const menuItems = ['Start Game', 'Options', 'Credits'];
    const menuSpacing = 60;
    const startY = 350;

    menuItems.forEach((item, index) => {
      const text = this.add.text(this.cameras.main.centerX, startY + (index * menuSpacing), item, {
        font: '32px monospace',
        color: '#ffffff'
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => text.setColor('#ff0000'))
        .on('pointerout', () => text.setColor('#ffffff'))
        .on('pointerdown', () => this.handleMenuSelection(item));
    });
  }

  private handleMenuSelection(selection: string): void {
    switch (selection) {
      case 'Start Game':
        this.scene.start('GameScene');
        break;
      case 'Options':
        this.handleOptionsClick();
        break;
      case 'Credits':
        this.handleCreditsClick();
        break;
    }
  }

  private handleOptionsClick(): void {
    Logger.info('Options selected');
    this.scene.start('OptionsScene');
  }

  private handleCreditsClick(): void {
    Logger.info('Credits selected');
    this.scene.start('CreditsScene');
  }

  update(): void {
    // No update logic needed for menu scene
  }
} 
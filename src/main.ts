import 'phaser';
import { GameConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

// Add scenes to the game config
GameConfig.scene = [BootScene, PreloadScene, MenuScene, GameScene];

// Start the game
new Phaser.Game(GameConfig); 
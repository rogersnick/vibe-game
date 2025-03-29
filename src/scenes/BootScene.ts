import {Scene} from 'phaser';

export class BootScene extends Scene {
    constructor() {
        super({key: 'BootScene'});
    }

    preload(): void {
        // Load any assets needed for the loading screen
    }

    create(): void {
        // Initialize game settings, save data, etc.
        this.scene.start('PreloadScene');
    }

    update(): void {
        // No update logic needed for boot scene
    }
} 
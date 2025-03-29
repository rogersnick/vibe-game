import { Scene, Input } from 'phaser';
import { Command } from './Command';

export type KeyBinding = {
  key: string;
  command: Command;
  isPressed: boolean;
  isHeld?: boolean;
};

export class InputHandler {
  private scene: Scene;
  private keyBindings: Map<string, KeyBinding>;
  private commandHistory: Command[];
  private historySize: number;

  constructor(scene: Scene, historySize: number = 100) {
    this.scene = scene;
    this.keyBindings = new Map();
    this.commandHistory = [];
    this.historySize = historySize;
  }

  bindKey(keyCode: string, command: Command, isHeld: boolean = false): void {
    // Create the key binding
    const binding: KeyBinding = {
      key: keyCode,
      command,
      isPressed: false,
      isHeld
    };

    // Add to our bindings map
    this.keyBindings.set(keyCode, binding);

    // Set up the key in Phaser
    const key = this.scene.input.keyboard!.addKey(keyCode);

    // Handle key down
    key.on('down', () => {
      binding.isPressed = true;
      if (!binding.isHeld) {
        this.executeCommand(command);
      }
    });

    // Handle key up
    key.on('up', () => {
      binding.isPressed = false;
      if (binding.isHeld && command.undo) {
        command.undo();
      }
    });
  }

  update(): void {
    // Execute commands for held keys
    this.keyBindings.forEach(binding => {
      if (binding.isHeld && binding.isPressed) {
        this.executeCommand(binding.command);
      }
    });
  }

  private executeCommand(command: Command): void {
    command.execute();
    
    // Add to history if the command supports undo
    if (command.undo) {
      this.commandHistory.push(command);
      
      // Keep history within size limit
      if (this.commandHistory.length > this.historySize) {
        this.commandHistory.shift();
      }
    }
  }

  undo(): void {
    const command = this.commandHistory.pop();
    if (command?.undo) {
      command.undo();
    }
  }

  // Clean up event listeners when no longer needed
  destroy(): void {
    this.keyBindings.forEach((binding) => {
      const key = this.scene.input.keyboard!.addKey(binding.key);
      if (key) {
        key.removeAllListeners();
      }
    });
    this.keyBindings.clear();
    this.commandHistory = [];
  }
} 
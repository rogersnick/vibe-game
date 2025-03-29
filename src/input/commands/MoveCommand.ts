import { GameObjects } from 'phaser';
import { Command } from '../Command';

export class MoveCommand implements Command {
  private gameObject: GameObjects.Sprite;
  private dx: number;
  private dy: number;
  private speed: number;

  constructor(gameObject: GameObjects.Sprite, dx: number, dy: number, speed: number = 5) {
    this.gameObject = gameObject;
    this.dx = dx;
    this.dy = dy;
    this.speed = speed;
  }

  execute(): void {
    this.gameObject.x += this.dx * this.speed;
    this.gameObject.y += this.dy * this.speed;
  }

  // Optional: Implement undo if you want to support movement reversal
  undo(): void {
    this.gameObject.x -= this.dx * this.speed;
    this.gameObject.y -= this.dy * this.speed;
  }
} 
import { Command } from '../Command';
import { Player } from '../../entities/Player';

export class MoveCommand implements Command {
  private player: Player;
  private dx: number;
  private dy: number;
  private speed: number;

  constructor(player: Player, dx: number, dy: number, speed: number = 5) {
    this.player = player;
    this.dx = dx;
    this.dy = dy;
    this.speed = speed;
  }

  execute(): void {
    this.player.move(this.dx * this.speed, this.dy * this.speed);
  }

  // Optional: Implement undo if you want to support movement reversal
  undo(): void {
    this.player.move(-this.dx * this.speed, -this.dy * this.speed);
  }
} 
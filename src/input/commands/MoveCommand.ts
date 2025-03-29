import { Command } from '../Command';
import { Player } from '../../entities/Player';

export class MoveCommand implements Command {
  private player: Player;
  private dx: number;
  private dy: number;
  private key: string;

  constructor(player: Player, dx: number, dy: number, key: string) {
    this.player = player;
    this.dx = dx;
    this.dy = dy;
    this.key = key;
  }

  execute(): void {
    this.player.move(this.dx, this.dy, this.key);
  }

  // Optional: Implement undo if you want to support movement reversal
  undo(): void {
    this.player.stopMoving(this.key);
  }
} 
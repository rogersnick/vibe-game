import { Command } from '../Command';
import { Player } from '../../entities/Player';
import { MovementConfig } from '../../config/MovementConfig';

export class MoveCommand implements Command {
  private player: Player;
  private dx: number;
  private dy: number;
  private speed: number;

  constructor(player: Player, dx: number, dy: number) {
    this.player = player;
    this.dx = dx;
    this.dy = dy;
    this.speed = MovementConfig.baseSpeed;
  }

  execute(delta: number): void {
    // Calculate diagonal movement speed
    const isDiagonal = this.dx !== 0 && this.dy !== 0;
    const speedMultiplier = isDiagonal ? MovementConfig.diagonalSpeedMultiplier : 1;
    
    // Apply movement with delta time
    const distance = (this.speed * speedMultiplier * delta) / 1000; // Convert to pixels per frame
    this.player.move(this.dx, this.dy);
  }

  stop(): void {
    // Send zero velocity to stop movement
    this.player.move(0, 0);
  }

  // Optional: Implement undo if you want to support movement reversal
  undo(): void {
    // Undo is not needed for continuous movement
  }
} 
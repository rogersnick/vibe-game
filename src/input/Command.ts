export interface Command {
  execute(delta: number): void;
  undo?(): void;
} 
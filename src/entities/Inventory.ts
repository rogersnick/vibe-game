import { Logger } from '../utils/Logger';

export class Inventory {
    private items: number = 0;
    private onItemCollected: ((count: number) => void) | null = null;

    addItem(): void {
        this.items++;
        Logger.debug('Inventory addItem called, count:', this.items);
        if (this.onItemCollected) {
            Logger.debug('Calling onItemCollected callback');
            this.onItemCollected(this.items);
        } else {
            Logger.warn('No onItemCollected callback set');
        }
    }

    getItemCount(): number {
        return this.items;
    }

    setOnItemCollectedCallback(callback: (count: number) => void): void {
        this.onItemCollected = callback;
    }
} 
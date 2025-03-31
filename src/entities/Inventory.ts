import createDebug from 'debug';
const debug = createDebug('vibe:inventory');

export class Inventory {
    private items: number = 0;
    private onItemCollected: ((count: number) => void) | null = null;

    addItem(): void {
        this.items++;
        debug('Inventory addItem called, count:', this.items);
        if (this.onItemCollected) {
            debug('Calling onItemCollected callback');
            this.onItemCollected(this.items);
        } else {
            debug('No onItemCollected callback set');
        }
    }

    getItemCount(): number {
        return this.items;
    }

    setOnItemCollectedCallback(callback: (count: number) => void): void {
        this.onItemCollected = callback;
    }
} 
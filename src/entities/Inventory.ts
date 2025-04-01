import createDebug from 'debug';
const debug = createDebug('vibe:inventory');

export class Inventory {
    private items: number = 0;
    private callbacks: ((count: number) => void)[] = [];

    addItem(): void {
        this.items++;
        debug('Inventory: addItem called, count:', this.items);
        this.callbacks.forEach(callback => {
            debug('Inventory: Calling callback with count:', this.items);
            callback(this.items);
        });
    }

    getItemCount(): number {
        return this.items;
    }

    setOnItemCollectedCallback(callback: (count: number) => void): void {
        debug('Inventory: Adding new item collected callback');
        this.callbacks.push(callback);
        debug('Inventory: Callback added, current count:', this.items);
    }
} 
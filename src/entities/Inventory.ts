export class Inventory {
    private items: number = 0;
    private onItemCollected: ((count: number) => void) | null = null;

    addItem(): void {
        this.items++;
        if (this.onItemCollected) {
            this.onItemCollected(this.items);
        }
    }

    getItemCount(): number {
        return this.items;
    }

    setOnItemCollectedCallback(callback: (count: number) => void): void {
        this.onItemCollected = callback;
    }
} 
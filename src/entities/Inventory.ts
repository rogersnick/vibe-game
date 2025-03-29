import { CollectibleCategory } from './Collectible';

export interface InventoryItem {
    name: string;
    category: CollectibleCategory;
    power: number;
    uses: number;
    description: string;
}

export class Inventory {
    private items: InventoryItem[] = [];
    private onItemCollected: ((count: number) => void) | null = null;

    addItem(item: InventoryItem): void {
        this.items.push(item);
        if (this.onItemCollected) {
            this.onItemCollected(this.items.length);
        }
    }

    useItem(index: number): boolean {
        if (index < 0 || index >= this.items.length) return false;
        
        const item = this.items[index];
        if (item.uses <= 0) return false;

        item.uses--;
        if (item.uses <= 0) {
            this.items.splice(index, 1);
        }

        return true;
    }

    getItems(): InventoryItem[] {
        return [...this.items];
    }

    getItemCount(): number {
        return this.items.length;
    }

    setOnItemCollectedCallback(callback: (count: number) => void): void {
        this.onItemCollected = callback;
    }
} 
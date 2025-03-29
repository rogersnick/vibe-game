export type CollectibleCategory = 'healing' | 'power' | 'speed' | 'shield' | 'special';

export interface CollectibleConfig {
    name: string;
    category: CollectibleCategory;
    color: number;
    power: number;
    uses: number;
    description: string;
} 
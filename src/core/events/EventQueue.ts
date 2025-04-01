import { GameEvent, GameEventCallback, GameEventType } from './GameEvent';

export class EventQueue {
    private static instance: EventQueue;
    private listeners: Map<GameEventType, Set<GameEventCallback>> = new Map();
    private eventHistory: GameEvent[] = [];
    private maxHistorySize: number = 100;

    private constructor() {}

    static getInstance(): EventQueue {
        if (!EventQueue.instance) {
            EventQueue.instance = new EventQueue();
        }
        return EventQueue.instance;
    }

    subscribe(eventType: GameEventType, callback: GameEventCallback): () => void {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType)!.add(callback);

        // Return unsubscribe function
        return () => {
            this.unsubscribe(eventType, callback);
        };
    }

    unsubscribe(eventType: GameEventType, callback: GameEventCallback): void {
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            callbacks.delete(callback);
        }
    }

    emit(eventType: GameEventType, data?: any): void {
        const event: GameEvent = {
            type: eventType,
            data,
            timestamp: Date.now()
        };

        // Add to history
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }

        // Notify listeners
        const callbacks = this.listeners.get(eventType);
        if (callbacks) {
            callbacks.forEach(callback => callback(event));
        }
    }

    getEventHistory(): GameEvent[] {
        return [...this.eventHistory];
    }

    clearHistory(): void {
        this.eventHistory = [];
    }

    clearListeners(): void {
        this.listeners.clear();
    }
} 
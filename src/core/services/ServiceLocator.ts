import { EventQueue } from '../events/EventQueue';

export interface GameService {
    initialize?(): void;
    destroy?(): void;
}

export class ServiceLocator {
    private static instance: ServiceLocator;
    private services: Map<string, GameService> = new Map();
    private eventQueue: EventQueue;

    private constructor() {
        this.eventQueue = EventQueue.getInstance();
    }

    static getInstance(): ServiceLocator {
        if (!ServiceLocator.instance) {
            ServiceLocator.instance = new ServiceLocator();
        }
        return ServiceLocator.instance;
    }

    register(name: string, service: GameService): void {
        if (this.services.has(name)) {
            console.warn(`Service ${name} is already registered. Overwriting...`);
        }
        this.services.set(name, service);
        
        // Initialize the service if it has an initialize method
        if (service.initialize) {
            service.initialize();
        }
    }

    get<T extends GameService>(name: string): T {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service ${name} not found`);
        }
        return service as T;
    }

    has(name: string): boolean {
        return this.services.has(name);
    }

    unregister(name: string): void {
        const service = this.services.get(name);
        if (service && service.destroy) {
            service.destroy();
        }
        this.services.delete(name);
    }

    getEventQueue(): EventQueue {
        return this.eventQueue;
    }

    destroy(): void {
        // Destroy all services in reverse order of registration
        const serviceNames = Array.from(this.services.keys());
        for (let i = serviceNames.length - 1; i >= 0; i--) {
            this.unregister(serviceNames[i]);
        }
    }
} 
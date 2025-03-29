export class Logger {
    private static isDebugEnabled: boolean = false;

    static enableDebug(): void {
        this.isDebugEnabled = true;
    }

    static disableDebug(): void {
        this.isDebugEnabled = false;
    }

    static debug(message: string, ...args: any[]): void {
        if (this.isDebugEnabled) {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    }

    static info(message: string, ...args: any[]): void {
        console.log(`[INFO] ${message}`, ...args);
    }

    static warn(message: string, ...args: any[]): void {
        console.warn(`[WARN] ${message}`, ...args);
    }

    static error(message: string, ...args: any[]): void {
        console.error(`[ERROR] ${message}`, ...args);
    }
} 
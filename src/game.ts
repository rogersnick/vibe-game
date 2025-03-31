import debug from 'debug';

// Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
    debug.enable('vibe:*');
}

const config: Phaser.Types.Core.GameConfig = {
    // ... existing config ...
}; 
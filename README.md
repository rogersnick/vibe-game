# Vibe Game

A game built with Phaser and Electron.

## Prerequisites

- Node.js (v22 or higher recommended)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Available Scripts

- `npm start` - Builds the project and starts the Electron app in development mode
- `npm run dev` - Builds the project and starts both the webpack dev server and Electron app with hot reloading
- `npm run build` - Builds the project using webpack
- `npm run webpack:dev` - Starts the webpack dev server
- `npm run webpack:build` - Builds the project in production mode
- `npm run electron:build` - Builds the Electron app for distribution

## Development

For development with hot reloading:
```bash
npm run dev
```

For a simple build and run:
```bash
npm start
```

## Debug Logging

The game uses the `debug` package for logging. You can control which debug messages you see by setting the `DEBUG` environment variable. Available namespaces are:

- `vibe:player` - Player movement, state changes, and interactions
- `vibe:inventory` - Inventory management and item collection
- `vibe:collectible` - Collectible spawning and collection
- `vibe:achievements` - Achievement progress and unlocks
- `vibe:menu` - Menu interactions and scene transitions

Examples:
```bash
# Show all debug messages
DEBUG=vibe:* npm start

# Show only player and inventory messages
DEBUG=vibe:player,vibe:inventory npm start

# Show everything except menu messages
DEBUG=vibe:*,-vibe:menu npm start
```

Debug messages are automatically enabled in development mode (`npm run dev` or `npm start`). They are disabled in production builds.

## Project Structure

- `src/` - Source code
  - `main.ts` - Main game entry point
  - `index.html` - Main HTML file
  - `electron/` - Electron main process code
  - `scenes/` - Game scenes
  - `entities/` - Game entities
  - `systems/` - Game systems
  - `components/` - Game components
  - `config/` - Game configuration
  - `input/` - Input handling
  - `utils/` - Utility functions
- `assets/` - Game assets (images, sounds, etc.)
- `dist/` - Build output directory
- `release/` - Distribution builds

## Building for Distribution

To create a distributable version of the app:
```bash
npm run electron:build
```

The built application will be available in the `release` directory. 
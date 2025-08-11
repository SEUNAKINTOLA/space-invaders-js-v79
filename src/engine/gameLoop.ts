/**
 * @file gameLoop.ts
 * @description Implements the main game loop system with precise timing control and frame rate management.
 * Handles fixed timestep updates and variable rendering with interpolation.
 */

// Constants for timing configuration
const DEFAULT_FPS = 60;
const DEFAULT_FRAME_TIME = 1000 / DEFAULT_FPS;
const MAX_FRAME_TIME = 100; // Maximum time between frames to prevent spiral of death

/**
 * Interface for game loop update callbacks
 */
interface GameLoopCallbacks {
    update: (deltaTime: number) => void;
    render: (interpolation: number) => void;
    beforeUpdate?: () => void;
    afterUpdate?: () => void;
}

/**
 * Configuration options for the game loop
 */
interface GameLoopConfig {
    targetFps?: number;
    maxFrameTime?: number;
    debug?: boolean;
}

/**
 * Manages the main game loop with fixed timestep updates and variable rendering
 */
export class GameLoop {
    private running: boolean = false;
    private lastTime: number = 0;
    private accumulator: number = 0;
    private frameTime: number;
    private maxFrameTime: number;
    private fps: number = 0;
    private frameCount: number = 0;
    private fpsTimer: number = 0;
    private rafId: number | null = null;
    private debug: boolean;

    private readonly callbacks: GameLoopCallbacks;

    /**
     * Creates a new GameLoop instance
     * @param callbacks Object containing update and render callbacks
     * @param config Optional configuration parameters
     */
    constructor(callbacks: GameLoopCallbacks, config: GameLoopConfig = {}) {
        this.callbacks = callbacks;
        this.frameTime = 1000 / (config.targetFps || DEFAULT_FPS);
        this.maxFrameTime = config.maxFrameTime || MAX_FRAME_TIME;
        this.debug = config.debug || false;
    }

    /**
     * Starts the game loop
     */
    public start(): void {
        if (this.running) {
            return;
        }

        this.running = true;
        this.lastTime = performance.now();
        this.accumulator = 0;
        this.frameCount = 0;
        this.fpsTimer = 0;
        this.tick();
    }

    /**
     * Stops the game loop
     */
    public stop(): void {
        this.running = false;
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    /**
     * Returns the current FPS
     */
    public getFPS(): number {
        return this.fps;
    }

    /**
     * Main loop tick function
     */
    private tick = (): void => {
        if (!this.running) {
            return;
        }

        this.rafId = requestAnimationFrame(this.tick);

        const currentTime = performance.now();
        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // FPS calculation
        this.frameCount++;
        this.fpsTimer += deltaTime;
        if (this.fpsTimer >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer -= 1000;

            if (this.debug) {
                console.log(`FPS: ${this.fps}`);
            }
        }

        // Prevent spiral of death
        if (deltaTime > this.maxFrameTime) {
            deltaTime = this.maxFrameTime;
        }

        this.accumulator += deltaTime;

        // Fixed timestep updates
        if (this.callbacks.beforeUpdate) {
            this.callbacks.beforeUpdate();
        }

        try {
            while (this.accumulator >= this.frameTime) {
                this.callbacks.update(this.frameTime);
                this.accumulator -= this.frameTime;
            }

            if (this.callbacks.afterUpdate) {
                this.callbacks.afterUpdate();
            }

            // Render with interpolation
            const interpolation = this.accumulator / this.frameTime;
            this.callbacks.render(interpolation);
        } catch (error) {
            console.error('Error in game loop:', error);
            this.stop();
            throw error;
        }
    };

    /**
     * Updates the target FPS
     * @param newFps New target FPS value
     */
    public setTargetFPS(newFps: number): void {
        if (newFps <= 0) {
            throw new Error('Target FPS must be greater than 0');
        }
        this.frameTime = 1000 / newFps;
    }

    /**
     * Returns the current game loop state
     */
    public getState(): {
        running: boolean;
        fps: number;
        targetFrameTime: number;
    } {
        return {
            running: this.running,
            fps: this.fps,
            targetFrameTime: this.frameTime,
        };
    }
}

/**
 * Creates and configures a new GameLoop instance
 * @param callbacks Object containing update and render callbacks
 * @param config Optional configuration parameters
 * @returns Configured GameLoop instance
 */
export function createGameLoop(
    callbacks: GameLoopCallbacks,
    config?: GameLoopConfig
): GameLoop {
    return new GameLoop(callbacks, config);
}
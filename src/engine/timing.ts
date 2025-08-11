/**
 * @file timing.ts
 * @description Game timing and frame rate management system
 * Provides utilities for managing game loop timing, frame rate calculation,
 * and time-based game updates.
 */

// Constants for timing configuration
const DEFAULT_FPS = 60;
const MIN_FPS = 20;
const MAX_FPS = 120;
const DEFAULT_FRAME_TIME = 1000 / DEFAULT_FPS;
const MAX_DELTA_TIME = 100; // Maximum allowed delta time in ms

/**
 * Interface for timing statistics
 */
interface TimingStats {
    fps: number;
    frameTime: number;
    deltaTime: number;
    elapsedTime: number;
}

/**
 * Class to manage game timing and frame rate
 */
export class TimingSystem {
    private lastFrameTime: number;
    private frameCount: number;
    private fpsUpdateInterval: number;
    private lastFpsUpdate: number;
    private currentFps: number;
    private targetFps: number;
    private accumulator: number;
    private startTime: number;

    constructor(targetFps: number = DEFAULT_FPS) {
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fpsUpdateInterval = 1000; // Update FPS every second
        this.lastFpsUpdate = 0;
        this.currentFps = targetFps;
        this.targetFps = Math.min(Math.max(targetFps, MIN_FPS), MAX_FPS);
        this.accumulator = 0;
        this.startTime = performance.now();
    }

    /**
     * Initialize the timing system
     */
    public init(): void {
        this.lastFrameTime = performance.now();
        this.startTime = this.lastFrameTime;
    }

    /**
     * Update timing calculations for the current frame
     * @returns TimingStats object containing current timing information
     */
    public update(): TimingStats {
        const currentTime = performance.now();
        let deltaTime = currentTime - this.lastFrameTime;

        // Clamp delta time to prevent spiral of death
        deltaTime = Math.min(deltaTime, MAX_DELTA_TIME);

        this.lastFrameTime = currentTime;
        this.frameCount++;
        this.accumulator += deltaTime;

        // Update FPS calculation
        if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.currentFps = (this.frameCount * 1000) / (currentTime - this.lastFpsUpdate);
            this.lastFpsUpdate = currentTime;
            this.frameCount = 0;
        }

        return {
            fps: this.currentFps,
            frameTime: 1000 / this.currentFps,
            deltaTime: deltaTime,
            elapsedTime: currentTime - this.startTime
        };
    }

    /**
     * Check if it's time to process the next frame based on target FPS
     * @returns boolean indicating whether to process the next frame
     */
    public shouldProcessFrame(): boolean {
        const frameTime = 1000 / this.targetFps;
        return this.accumulator >= frameTime;
    }

    /**
     * Consume accumulated time for frame processing
     */
    public consumeFrameTime(): void {
        const frameTime = 1000 / this.targetFps;
        this.accumulator -= frameTime;
    }

    /**
     * Get interpolation factor for smooth rendering between frames
     * @returns number between 0 and 1 representing interpolation factor
     */
    public getInterpolationFactor(): number {
        const frameTime = 1000 / this.targetFps;
        return this.accumulator / frameTime;
    }

    /**
     * Get current FPS
     * @returns current frames per second
     */
    public getFps(): number {
        return this.currentFps;
    }

    /**
     * Set target FPS
     * @param fps desired frames per second
     */
    public setTargetFps(fps: number): void {
        this.targetFps = Math.min(Math.max(fps, MIN_FPS), MAX_FPS);
    }

    /**
     * Get elapsed time since game start
     * @returns elapsed time in milliseconds
     */
    public getElapsedTime(): number {
        return performance.now() - this.startTime;
    }

    /**
     * Calculate time scale factor for consistent movement speeds
     * @param deltaTime current frame delta time
     * @returns time scale factor
     */
    public static getTimeScale(deltaTime: number): number {
        return deltaTime / DEFAULT_FRAME_TIME;
    }
}

/**
 * Utility function to create a throttled version of a function
 * @param func function to throttle
 * @param limit minimum time between calls in milliseconds
 * @returns throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;
    return function(this: any, ...args: Parameters<T>): void {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Utility function to create a debounced version of a function
 * @param func function to debounce
 * @param delay delay in milliseconds
 * @returns debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: number;
    return function(this: any, ...args: Parameters<T>): void {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => func.apply(this, args), delay);
    };
}
/**
 * @file EnemyBehavior.ts
 * @description Defines enemy movement and behavior patterns for the game.
 * Implements various movement strategies that can be applied to enemy entities.
 */

import { Vector2D } from '../engine/gameState';

/**
 * Interface defining the basic structure for enemy movement patterns
 */
interface MovementPattern {
    update(deltaTime: number, position: Vector2D): Vector2D;
    reset(): void;
}

/**
 * Represents the configuration for movement patterns
 */
interface MovementConfig {
    speed: number;
    amplitude?: number;
    frequency?: number;
    radius?: number;
}

/**
 * Base class for enemy behavior implementation
 */
export class EnemyBehavior {
    private currentPattern: MovementPattern;
    private position: Vector2D;

    constructor(initialPosition: Vector2D) {
        this.position = { ...initialPosition };
        this.currentPattern = new LinearPattern({ speed: 100 });
    }

    /**
     * Updates the enemy position based on the current movement pattern
     * @param deltaTime Time elapsed since last update
     * @returns Updated position
     */
    public update(deltaTime: number): Vector2D {
        return this.currentPattern.update(deltaTime, this.position);
    }

    /**
     * Changes the current movement pattern
     * @param pattern New movement pattern to use
     */
    public setPattern(pattern: MovementPattern): void {
        this.currentPattern = pattern;
        pattern.reset();
    }
}

/**
 * Implements a linear movement pattern
 */
export class LinearPattern implements MovementPattern {
    private config: MovementConfig;
    private direction: Vector2D;

    constructor(config: MovementConfig) {
        this.config = config;
        this.direction = { x: 1, y: 0 };
    }

    public update(deltaTime: number, position: Vector2D): Vector2D {
        return {
            x: position.x + this.direction.x * this.config.speed * deltaTime,
            y: position.y + this.direction.y * this.config.speed * deltaTime
        };
    }

    public reset(): void {
        this.direction = { x: 1, y: 0 };
    }
}

/**
 * Implements a sine wave movement pattern
 */
export class SineWavePattern implements MovementPattern {
    private config: MovementConfig;
    private time: number;

    constructor(config: MovementConfig & { amplitude: number; frequency: number }) {
        this.config = config;
        this.time = 0;
    }

    public update(deltaTime: number, position: Vector2D): Vector2D {
        this.time += deltaTime;
        return {
            x: position.x + this.config.speed * deltaTime,
            y: position.y + Math.sin(this.time * this.config.frequency!) * this.config.amplitude!
        };
    }

    public reset(): void {
        this.time = 0;
    }
}

/**
 * Implements a circular movement pattern
 */
export class CircularPattern implements MovementPattern {
    private config: MovementConfig;
    private angle: number;
    private center: Vector2D;

    constructor(config: MovementConfig & { radius: number }) {
        this.config = config;
        this.angle = 0;
        this.center = { x: 0, y: 0 };
    }

    public update(deltaTime: number, position: Vector2D): Vector2D {
        this.angle += this.config.speed * deltaTime;
        
        return {
            x: this.center.x + Math.cos(this.angle) * this.config.radius!,
            y: this.center.y + Math.sin(this.angle) * this.config.radius!
        };
    }

    public reset(): void {
        this.angle = 0;
    }

    /**
     * Sets the center point for circular motion
     * @param center Center point coordinates
     */
    public setCenter(center: Vector2D): void {
        this.center = { ...center };
    }
}

/**
 * Factory for creating movement patterns
 */
export class MovementPatternFactory {
    /**
     * Creates a movement pattern based on the specified type
     * @param type Type of movement pattern to create
     * @param config Configuration for the movement pattern
     * @returns Instance of the requested movement pattern
     */
    public static createPattern(
        type: 'linear' | 'sine' | 'circular',
        config: MovementConfig
    ): MovementPattern {
        switch (type) {
            case 'linear':
                return new LinearPattern(config);
            case 'sine':
                if (!config.amplitude || !config.frequency) {
                    throw new Error('Sine wave pattern requires amplitude and frequency');
                }
                return new SineWavePattern(config as MovementConfig & { amplitude: number; frequency: number });
            case 'circular':
                if (!config.radius) {
                    throw new Error('Circular pattern requires radius');
                }
                return new CircularPattern(config as MovementConfig & { radius: number });
            default:
                throw new Error(`Unknown pattern type: ${type}`);
        }
    }
}

/**
 * Predefined movement configurations
 */
export const MovementConfigs = {
    SLOW_LINEAR: { speed: 50 },
    FAST_LINEAR: { speed: 200 },
    GENTLE_SINE: { speed: 100, amplitude: 50, frequency: 2 },
    AGGRESSIVE_SINE: { speed: 150, amplitude: 100, frequency: 4 },
    SMALL_CIRCLE: { speed: 2, radius: 50 },
    LARGE_CIRCLE: { speed: 1, radius: 150 }
};
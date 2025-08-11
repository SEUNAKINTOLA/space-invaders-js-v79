/**
 * @file Player.ts
 * @description Player entity implementation with movement mechanics and bounds checking
 */

import { Vector2D } from '../engine/gameState';
import { Canvas } from '../engine/canvas';

/**
 * Player movement configuration
 */
interface PlayerConfig {
    maxSpeed: number;
    acceleration: number;
    deceleration: number;
    rotationSpeed: number;
}

/**
 * Default player configuration values
 */
const DEFAULT_CONFIG: PlayerConfig = {
    maxSpeed: 5,
    acceleration: 0.2,
    deceleration: 0.1,
    rotationSpeed: 0.1
};

/**
 * Represents the player's ship in the game
 */
export class Player {
    private position: Vector2D;
    private velocity: Vector2D;
    private rotation: number;
    private config: PlayerConfig;
    private bounds: { width: number; height: number };

    /**
     * Creates a new Player instance
     * @param startPosition Initial position of the player
     * @param bounds Game boundaries
     * @param config Optional player configuration
     */
    constructor(
        startPosition: Vector2D,
        bounds: { width: number; height: number },
        config: Partial<PlayerConfig> = {}
    ) {
        this.position = { ...startPosition };
        this.velocity = { x: 0, y: 0 };
        this.rotation = 0;
        this.bounds = bounds;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Updates player position based on current velocity and input
     * @param deltaTime Time elapsed since last update
     * @param input Movement input vector (-1 to 1)
     */
    public update(deltaTime: number, input: Vector2D): void {
        // Update velocity based on input
        this.updateVelocity(input, deltaTime);
        
        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Enforce boundaries
        this.enforceBounds();
    }

    /**
     * Updates player's velocity based on input
     * @param input Movement input vector
     * @param deltaTime Time elapsed since last update
     */
    private updateVelocity(input: Vector2D, deltaTime: number): void {
        // Apply acceleration based on input
        this.velocity.x += input.x * this.config.acceleration * deltaTime;
        this.velocity.y += input.y * this.config.acceleration * deltaTime;

        // Apply deceleration when no input
        if (input.x === 0) {
            this.velocity.x *= (1 - this.config.deceleration);
        }
        if (input.y === 0) {
            this.velocity.y *= (1 - this.config.deceleration);
        }

        // Limit speed
        const currentSpeed = Math.sqrt(
            this.velocity.x * this.velocity.x + 
            this.velocity.y * this.velocity.y
        );

        if (currentSpeed > this.config.maxSpeed) {
            const scale = this.config.maxSpeed / currentSpeed;
            this.velocity.x *= scale;
            this.velocity.y *= scale;
        }
    }

    /**
     * Ensures player stays within game boundaries
     */
    private enforceBounds(): void {
        this.position.x = Math.max(0, Math.min(this.position.x, this.bounds.width));
        this.position.y = Math.max(0, Math.min(this.position.y, this.bounds.height));
    }

    /**
     * Rotates the player based on target angle
     * @param targetAngle Angle to rotate towards (in radians)
     */
    public rotate(targetAngle: number): void {
        const angleDiff = targetAngle - this.rotation;
        
        // Normalize angle difference to [-π, π]
        const normalizedDiff = Math.atan2(
            Math.sin(angleDiff),
            Math.cos(angleDiff)
        );

        // Apply rotation with smooth interpolation
        this.rotation += Math.sign(normalizedDiff) * 
            Math.min(Math.abs(normalizedDiff), this.config.rotationSpeed);
    }

    /**
     * Gets the current position of the player
     */
    public getPosition(): Vector2D {
        return { ...this.position };
    }

    /**
     * Gets the current rotation of the player
     */
    public getRotation(): number {
        return this.rotation;
    }

    /**
     * Gets the current velocity of the player
     */
    public getVelocity(): Vector2D {
        return { ...this.velocity };
    }

    /**
     * Sets the player's position
     * @param position New position
     */
    public setPosition(position: Vector2D): void {
        this.position = { ...position };
        this.enforceBounds();
    }

    /**
     * Resets the player's state
     * @param position Optional new position
     */
    public reset(position?: Vector2D): void {
        if (position) {
            this.position = { ...position };
        }
        this.velocity = { x: 0, y: 0 };
        this.rotation = 0;
    }
}
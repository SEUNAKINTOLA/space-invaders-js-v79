/**
 * @file ship.ts
 * @description Player ship entity implementation with basic rendering capabilities
 */

import { Vector2D } from '../engine/gameState';
import { Canvas } from '../engine/canvas';

/**
 * Ship configuration constants
 */
const SHIP_CONFIG = {
    DEFAULT_WIDTH: 40,
    DEFAULT_HEIGHT: 40,
    DEFAULT_SPEED: 5,
    MAX_HEALTH: 100,
    ROTATION_SPEED: 0.1,
} as const;

/**
 * Interface defining ship properties
 */
interface ShipProperties {
    position: Vector2D;
    width?: number;
    height?: number;
    speed?: number;
    health?: number;
}

/**
 * Represents the player's ship entity
 */
export class Ship {
    private position: Vector2D;
    private velocity: Vector2D;
    private width: number;
    private height: number;
    private speed: number;
    private health: number;
    private rotation: number;
    private isActive: boolean;

    /**
     * Creates a new Ship instance
     * @param props - Initial ship properties
     */
    constructor(props: ShipProperties) {
        this.position = props.position;
        this.velocity = { x: 0, y: 0 };
        this.width = props.width || SHIP_CONFIG.DEFAULT_WIDTH;
        this.height = props.height || SHIP_CONFIG.DEFAULT_HEIGHT;
        this.speed = props.speed || SHIP_CONFIG.DEFAULT_SPEED;
        this.health = props.health || SHIP_CONFIG.MAX_HEALTH;
        this.rotation = 0;
        this.isActive = true;
    }

    /**
     * Updates the ship's position and state
     * @param deltaTime - Time elapsed since last update
     */
    public update(deltaTime: number): void {
        if (!this.isActive) return;

        // Update position based on velocity
        this.position.x += this.velocity.x * this.speed * deltaTime;
        this.position.y += this.velocity.y * this.speed * deltaTime;

        // Keep ship within canvas bounds
        this.constrainToBounds();
    }

    /**
     * Renders the ship on the canvas
     * @param ctx - Canvas rendering context
     */
    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.isActive) return;

        ctx.save();
        
        // Translate to ship position and apply rotation
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        // Draw ship triangle
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.closePath();

        // Ship styling
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#333333';
        ctx.fill();

        ctx.restore();
    }

    /**
     * Sets the ship's velocity
     * @param velocity - New velocity vector
     */
    public setVelocity(velocity: Vector2D): void {
        this.velocity = velocity;
    }

    /**
     * Applies damage to the ship
     * @param amount - Amount of damage to apply
     * @returns Remaining health
     */
    public takeDamage(amount: number): number {
        this.health = Math.max(0, this.health - amount);
        if (this.health === 0) {
            this.isActive = false;
        }
        return this.health;
    }

    /**
     * Gets the ship's current position
     * @returns Current position vector
     */
    public getPosition(): Vector2D {
        return { ...this.position };
    }

    /**
     * Gets the ship's current health
     * @returns Current health value
     */
    public getHealth(): number {
        return this.health;
    }

    /**
     * Checks if the ship is still active
     * @returns Active status
     */
    public getIsActive(): boolean {
        return this.isActive;
    }

    /**
     * Sets the ship's rotation
     * @param angle - Rotation angle in radians
     */
    public setRotation(angle: number): void {
        this.rotation = angle;
    }

    /**
     * Keeps the ship within canvas bounds
     */
    private constrainToBounds(): void {
        const canvas = Canvas.getInstance();
        const bounds = canvas.getBounds();

        this.position.x = Math.max(this.width / 2, Math.min(bounds.width - this.width / 2, this.position.x));
        this.position.y = Math.max(this.height / 2, Math.min(bounds.height - this.height / 2, this.position.y));
    }
}
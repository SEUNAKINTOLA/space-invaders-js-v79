/**
 * @file Enemy.ts
 * @description Implements the base enemy entity class with movement patterns and behaviors
 * for the game's enemy wave system.
 */

import { Vector2D } from '../engine/gameState';
import { Sprite } from '../engine/sprite';
import { MovementPattern } from '../ai/MovementPatterns';
import { ShootingPattern } from '../ai/ShootingPatterns';

/**
 * Represents the possible states an enemy can be in
 */
export enum EnemyState {
    SPAWNING,
    ACTIVE,
    DYING,
    DESTROYED
}

/**
 * Configuration interface for enemy initialization
 */
export interface EnemyConfig {
    position: Vector2D;
    size: Vector2D;
    health: number;
    speed: number;
    scoreValue: number;
    spriteId: string;
    movementPattern?: MovementPattern;
    shootingPattern?: ShootingPattern;
}

/**
 * Represents a base enemy entity in the game
 */
export class Enemy {
    private position: Vector2D;
    private size: Vector2D;
    private velocity: Vector2D;
    private health: number;
    private maxHealth: number;
    private speed: number;
    private sprite: Sprite;
    private state: EnemyState;
    private scoreValue: number;
    private movementPattern?: MovementPattern;
    private shootingPattern?: ShootingPattern;
    private elapsedTime: number;

    /**
     * Creates a new Enemy instance
     * @param config - Configuration object for enemy initialization
     */
    constructor(config: EnemyConfig) {
        this.position = { ...config.position };
        this.size = { ...config.size };
        this.velocity = { x: 0, y: 0 };
        this.health = config.health;
        this.maxHealth = config.health;
        this.speed = config.speed;
        this.scoreValue = config.scoreValue;
        this.state = EnemyState.SPAWNING;
        this.sprite = new Sprite(config.spriteId);
        this.movementPattern = config.movementPattern;
        this.shootingPattern = config.shootingPattern;
        this.elapsedTime = 0;
    }

    /**
     * Updates the enemy's state and position
     * @param deltaTime - Time elapsed since last update
     */
    public update(deltaTime: number): void {
        if (this.state === EnemyState.DESTROYED) {
            return;
        }

        this.elapsedTime += deltaTime;

        if (this.state === EnemyState.SPAWNING) {
            this.state = EnemyState.ACTIVE;
        }

        if (this.state === EnemyState.ACTIVE) {
            this.updateMovement(deltaTime);
            this.updateShooting(deltaTime);
        }
    }

    /**
     * Updates the enemy's movement based on its pattern
     * @param deltaTime - Time elapsed since last update
     */
    private updateMovement(deltaTime: number): void {
        if (this.movementPattern) {
            const movement = this.movementPattern.getMovement(
                this.position,
                this.elapsedTime
            );
            
            this.velocity.x = movement.x * this.speed;
            this.velocity.y = movement.y * this.speed;
            
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
        }
    }

    /**
     * Updates the enemy's shooting behavior
     * @param deltaTime - Time elapsed since last update
     */
    private updateShooting(deltaTime: number): void {
        if (this.shootingPattern) {
            this.shootingPattern.update(deltaTime, this.position);
        }
    }

    /**
     * Applies damage to the enemy
     * @param damage - Amount of damage to apply
     * @returns boolean indicating if the enemy was destroyed
     */
    public takeDamage(damage: number): boolean {
        if (this.state !== EnemyState.ACTIVE) {
            return false;
        }

        this.health -= damage;
        
        if (this.health <= 0) {
            this.state = EnemyState.DYING;
            return true;
        }
        
        return false;
    }

    /**
     * Gets the current position of the enemy
     */
    public getPosition(): Vector2D {
        return { ...this.position };
    }

    /**
     * Gets the current size of the enemy
     */
    public getSize(): Vector2D {
        return { ...this.size };
    }

    /**
     * Gets the current state of the enemy
     */
    public getState(): EnemyState {
        return this.state;
    }

    /**
     * Gets the score value of the enemy
     */
    public getScoreValue(): number {
        return this.scoreValue;
    }

    /**
     * Gets the current health percentage of the enemy
     */
    public getHealthPercentage(): number {
        return this.health / this.maxHealth;
    }

    /**
     * Marks the enemy as destroyed
     */
    public destroy(): void {
        this.state = EnemyState.DESTROYED;
    }

    /**
     * Checks if the enemy is active
     */
    public isActive(): boolean {
        return this.state === EnemyState.ACTIVE;
    }

    /**
     * Renders the enemy
     * @param context - The rendering context
     */
    public render(context: CanvasRenderingContext2D): void {
        if (this.state === EnemyState.DESTROYED) {
            return;
        }

        this.sprite.render(context, this.position, this.size);
        
        // Optionally render health bar
        if (this.state === EnemyState.ACTIVE) {
            this.renderHealthBar(context);
        }
    }

    /**
     * Renders the enemy's health bar
     * @param context - The rendering context
     */
    private renderHealthBar(context: CanvasRenderingContext2D): void {
        const healthBarWidth = this.size.x;
        const healthBarHeight = 5;
        const healthPercentage = this.getHealthPercentage();

        context.fillStyle = 'red';
        context.fillRect(
            this.position.x,
            this.position.y - 10,
            healthBarWidth,
            healthBarHeight
        );

        context.fillStyle = 'green';
        context.fillRect(
            this.position.x,
            this.position.y - 10,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );
    }
}
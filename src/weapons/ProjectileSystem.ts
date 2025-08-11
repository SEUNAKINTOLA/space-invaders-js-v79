/**
 * @file ProjectileSystem.ts
 * @description Manages projectile creation, pooling, and lifecycle for the game's weapon systems.
 * Handles both player and enemy projectiles with efficient object pooling.
 */

import { Vector2D } from '../engine/gameState';
import { Sprite } from '../engine/sprite';
import { Projectile } from '../entities/Projectile';

/**
 * Configuration for different projectile types
 */
interface ProjectileConfig {
    speed: number;
    damage: number;
    lifetime: number;
    sprite: Sprite;
}

/**
 * Manages the creation, updating, and recycling of projectiles in the game
 */
export class ProjectileSystem {
    private readonly poolSize: number = 100;
    private projectilePool: Projectile[] = [];
    private activeProjectiles: Set<Projectile> = new Set();
    private configs: Map<string, ProjectileConfig> = new Map();

    constructor() {
        this.initializePool();
        this.setupDefaultConfigs();
    }

    /**
     * Initialize the object pool with inactive projectiles
     */
    private initializePool(): void {
        for (let i = 0; i < this.poolSize; i++) {
            this.projectilePool.push(new Projectile());
        }
    }

    /**
     * Set up default projectile configurations
     */
    private setupDefaultConfigs(): void {
        this.configs.set('playerBasic', {
            speed: 800,
            damage: 10,
            lifetime: 2000,
            sprite: new Sprite('playerProjectile')
        });

        this.configs.set('enemyBasic', {
            speed: 400,
            damage: 5,
            lifetime: 3000,
            sprite: new Sprite('enemyProjectile')
        });
    }

    /**
     * Get an available projectile from the pool
     * @returns Projectile or null if pool is empty
     */
    private getFromPool(): Projectile | null {
        const projectile = this.projectilePool.pop();
        if (!projectile) {
            console.warn('Projectile pool depleted');
            return null;
        }
        return projectile;
    }

    /**
     * Return a projectile to the pool
     * @param projectile The projectile to recycle
     */
    private returnToPool(projectile: Projectile): void {
        this.activeProjectiles.delete(projectile);
        projectile.reset();
        this.projectilePool.push(projectile);
    }

    /**
     * Spawn a new projectile
     * @param position Starting position
     * @param direction Direction vector
     * @param type Projectile type
     * @param sourceId ID of the entity that fired the projectile
     * @returns The spawned projectile or null if spawn failed
     */
    public spawnProjectile(
        position: Vector2D,
        direction: Vector2D,
        type: string,
        sourceId: string
    ): Projectile | null {
        const config = this.configs.get(type);
        if (!config) {
            console.error(`Invalid projectile type: ${type}`);
            return null;
        }

        const projectile = this.getFromPool();
        if (!projectile) return null;

        projectile.initialize(
            position,
            direction,
            config.speed,
            config.damage,
            config.lifetime,
            config.sprite,
            sourceId
        );

        this.activeProjectiles.add(projectile);
        return projectile;
    }

    /**
     * Update all active projectiles
     * @param deltaTime Time elapsed since last update
     */
    public update(deltaTime: number): void {
        for (const projectile of this.activeProjectiles) {
            projectile.update(deltaTime);

            if (projectile.isExpired()) {
                this.returnToPool(projectile);
            }
        }
    }

    /**
     * Get all active projectiles
     * @returns Array of active projectiles
     */
    public getActiveProjectiles(): Projectile[] {
        return Array.from(this.activeProjectiles);
    }

    /**
     * Remove a specific projectile from active projectiles
     * @param projectile The projectile to remove
     */
    public removeProjectile(projectile: Projectile): void {
        if (this.activeProjectiles.has(projectile)) {
            this.returnToPool(projectile);
        }
    }

    /**
     * Clear all active projectiles
     */
    public clearAll(): void {
        for (const projectile of this.activeProjectiles) {
            this.returnToPool(projectile);
        }
    }

    /**
     * Add a new projectile configuration
     * @param type Projectile type identifier
     * @param config Projectile configuration
     */
    public addProjectileConfig(type: string, config: ProjectileConfig): void {
        this.configs.set(type, config);
    }
}
/**
 * @file Projectile.ts
 * @description Implements the projectile entity system for player and enemy weapons
 * Contains logic for projectile movement, lifecycle and collision detection
 */

// Types and interfaces
interface ProjectileConfig {
    x: number;
    y: number;
    speed: number;
    direction: Vector2D;
    damage: number;
    lifespan: number;
    sourceId: string;
}

interface Vector2D {
    x: number;
    y: number;
}

/**
 * Represents a projectile in the game
 * Handles movement, collision detection, and lifecycle management
 */
export class Projectile {
    private position: Vector2D;
    private velocity: Vector2D;
    private readonly speed: number;
    private readonly damage: number;
    private readonly sourceId: string;
    private createdAt: number;
    private readonly lifespan: number;
    private active: boolean = true;

    /**
     * Creates a new projectile instance
     * @param config - Configuration object for the projectile
     */
    constructor(config: ProjectileConfig) {
        this.position = { x: config.x, y: config.y };
        this.speed = config.speed;
        this.velocity = {
            x: config.direction.x * config.speed,
            y: config.direction.y * config.speed
        };
        this.damage = config.damage;
        this.sourceId = config.sourceId;
        this.createdAt = Date.now();
        this.lifespan = config.lifespan;
    }

    /**
     * Updates the projectile's position and checks lifetime
     * @param deltaTime - Time elapsed since last update in milliseconds
     * @returns boolean indicating if the projectile is still active
     */
    public update(deltaTime: number): boolean {
        if (!this.active) return false;

        // Update position based on velocity and delta time
        this.position.x += this.velocity.x * (deltaTime / 1000);
        this.position.y += this.velocity.y * (deltaTime / 1000);

        // Check if projectile has exceeded its lifespan
        if (Date.now() - this.createdAt >= this.lifespan) {
            this.deactivate();
            return false;
        }

        return true;
    }

    /**
     * Checks if the projectile is within the game bounds
     * @param bounds - Game boundary rectangle {width, height}
     * @returns boolean indicating if the projectile is in bounds
     */
    public isInBounds(bounds: { width: number; height: number }): boolean {
        return (
            this.position.x >= 0 &&
            this.position.x <= bounds.width &&
            this.position.y >= 0 &&
            this.position.y <= bounds.height
        );
    }

    /**
     * Deactivates the projectile
     */
    public deactivate(): void {
        this.active = false;
    }

    /**
     * Gets the current position of the projectile
     * @returns Current position vector
     */
    public getPosition(): Vector2D {
        return { ...this.position };
    }

    /**
     * Gets the damage value of the projectile
     * @returns Damage value
     */
    public getDamage(): number {
        return this.damage;
    }

    /**
     * Gets the source ID of the entity that created this projectile
     * @returns Source entity ID
     */
    public getSourceId(): string {
        return this.sourceId;
    }

    /**
     * Checks if the projectile is still active
     * @returns boolean indicating active status
     */
    public isActive(): boolean {
        return this.active;
    }

    /**
     * Gets the current velocity of the projectile
     * @returns Velocity vector
     */
    public getVelocity(): Vector2D {
        return { ...this.velocity };
    }

    /**
     * Checks for collision with another entity
     * @param entity - Entity to check collision with
     * @returns boolean indicating if collision occurred
     */
    public checkCollision(entity: { 
        getPosition: () => Vector2D, 
        getRadius?: () => number 
    }): boolean {
        if (!this.active) return false;

        const entityPos = entity.getPosition();
        const radius = entity.getRadius?.() || 1;

        // Simple circle collision detection
        const dx = this.position.x - entityPos.x;
        const dy = this.position.y - entityPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < radius;
    }
}

/**
 * Factory function to create a projectile with default values
 * @param config Partial projectile configuration
 * @returns New Projectile instance
 */
export function createProjectile(config: Partial<ProjectileConfig>): Projectile {
    const defaultConfig: ProjectileConfig = {
        x: 0,
        y: 0,
        speed: 500,
        direction: { x: 0, y: -1 },
        damage: 1,
        lifespan: 2000,
        sourceId: 'unknown',
        ...config
    };

    return new Projectile(defaultConfig);
}
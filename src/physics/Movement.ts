/**
 * @file Movement.ts
 * @description Handles movement physics and mechanics for game entities, with a focus on player ship movement.
 * Implements smooth acceleration, deceleration, and boundary checking.
 */

// Types and interfaces
interface Vector2D {
    x: number;
    y: number;
}

interface MovementBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

interface MovementConfig {
    maxSpeed: number;
    acceleration: number;
    deceleration: number;
    rotationSpeed: number;
}

/**
 * Movement class handling physics-based movement mechanics
 */
export class Movement {
    private position: Vector2D;
    private velocity: Vector2D;
    private rotation: number;
    private bounds: MovementBounds;
    private config: MovementConfig;

    /**
     * Creates a new Movement instance
     * @param initialPosition Starting position
     * @param bounds Movement boundaries
     * @param config Movement configuration parameters
     */
    constructor(
        initialPosition: Vector2D,
        bounds: MovementBounds,
        config: MovementConfig = {
            maxSpeed: 5,
            acceleration: 0.5,
            deceleration: 0.3,
            rotationSpeed: 0.1
        }
    ) {
        this.position = { ...initialPosition };
        this.velocity = { x: 0, y: 0 };
        this.rotation = 0;
        this.bounds = { ...bounds };
        this.config = { ...config };
    }

    /**
     * Updates entity position based on current velocity and time delta
     * @param deltaTime Time elapsed since last update
     */
    public update(deltaTime: number): void {
        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Apply boundary constraints
        this.enforceBoundaries();

        // Apply natural deceleration
        this.applyDeceleration(deltaTime);
    }

    /**
     * Applies acceleration in the specified direction
     * @param direction Direction vector
     * @param deltaTime Time elapsed since last update
     */
    public accelerate(direction: Vector2D, deltaTime: number): void {
        const normalizedDir = this.normalizeVector(direction);
        
        this.velocity.x += normalizedDir.x * this.config.acceleration * deltaTime;
        this.velocity.y += normalizedDir.y * this.config.acceleration * deltaTime;

        // Limit speed to maximum
        this.limitSpeed();
    }

    /**
     * Rotates the entity
     * @param angle Rotation angle in radians
     */
    public rotate(angle: number): void {
        this.rotation += angle * this.config.rotationSpeed;
        // Normalize rotation to 0-2π
        this.rotation = this.rotation % (Math.PI * 2);
    }

    /**
     * Gets current position
     * @returns Current position vector
     */
    public getPosition(): Vector2D {
        return { ...this.position };
    }

    /**
     * Gets current rotation
     * @returns Current rotation in radians
     */
    public getRotation(): number {
        return this.rotation;
    }

    /**
     * Gets current velocity
     * @returns Current velocity vector
     */
    public getVelocity(): Vector2D {
        return { ...this.velocity };
    }

    /**
     * Sets new position
     * @param position New position vector
     */
    public setPosition(position: Vector2D): void {
        this.position = { ...position };
        this.enforceBoundaries();
    }

    /**
     * Enforces movement boundaries
     */
    private enforceBoundaries(): void {
        this.position.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.position.x));
        this.position.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, this.position.y));
    }

    /**
     * Applies natural deceleration to velocity
     * @param deltaTime Time elapsed since last update
     */
    private applyDeceleration(deltaTime: number): void {
        const deceleration = this.config.deceleration * deltaTime;
        
        this.velocity.x = this.moveTowardsZero(this.velocity.x, deceleration);
        this.velocity.y = this.moveTowardsZero(this.velocity.y, deceleration);
    }

    /**
     * Limits velocity to maximum speed
     */
    private limitSpeed(): void {
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
     * Normalizes a vector to unit length
     * @param vector Vector to normalize
     * @returns Normalized vector
     */
    private normalizeVector(vector: Vector2D): Vector2D {
        const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (magnitude === 0) return { x: 0, y: 0 };
        return {
            x: vector.x / magnitude,
            y: vector.y / magnitude
        };
    }

    /**
     * Moves a value towards zero by the specified amount
     * @param value Current value
     * @param amount Amount to move towards zero
     * @returns New value
     */
    private moveTowardsZero(value: number, amount: number): number {
        if (value > 0) {
            return Math.max(0, value - amount);
        }
        if (value < 0) {
            return Math.min(0, value + amount);
        }
        return 0;
    }
}

export default Movement;
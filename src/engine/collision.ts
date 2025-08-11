/**
 * @file collision.ts
 * @description Collision detection system for game entities
 * Provides efficient collision detection between game objects using
 * basic shapes (circles and rectangles) and spatial partitioning.
 */

// Types for collision shapes and entities
interface CollisionShape {
    type: 'circle' | 'rectangle';
    x: number;
    y: number;
}

interface CircleCollider extends CollisionShape {
    type: 'circle';
    radius: number;
}

interface RectangleCollider extends CollisionShape {
    type: 'rectangle';
    width: number;
    height: number;
}

interface Collidable {
    id: string;
    collider: CollisionShape;
    active: boolean;
}

/**
 * Result of a collision check between two entities
 */
interface CollisionResult {
    collided: boolean;
    overlap?: {
        x: number;
        y: number;
    };
}

/**
 * Main collision detection system class
 */
export class CollisionSystem {
    private entities: Map<string, Collidable>;
    private static instance: CollisionSystem;

    private constructor() {
        this.entities = new Map();
    }

    /**
     * Get singleton instance of collision system
     */
    public static getInstance(): CollisionSystem {
        if (!CollisionSystem.instance) {
            CollisionSystem.instance = new CollisionSystem();
        }
        return CollisionSystem.instance;
    }

    /**
     * Register an entity for collision detection
     */
    public registerEntity(entity: Collidable): void {
        if (!entity.id) {
            throw new Error('Entity must have an ID to register for collision detection');
        }
        this.entities.set(entity.id, entity);
    }

    /**
     * Remove an entity from collision detection
     */
    public unregisterEntity(entityId: string): void {
        this.entities.delete(entityId);
    }

    /**
     * Check collision between two specific entities
     */
    public checkCollision(entity1: Collidable, entity2: Collidable): CollisionResult {
        if (!entity1.active || !entity2.active) {
            return { collided: false };
        }

        switch (entity1.collider.type) {
            case 'circle':
                return entity2.collider.type === 'circle'
                    ? this.checkCircleCircle(entity1.collider as CircleCollider, entity2.collider as CircleCollider)
                    : this.checkCircleRectangle(entity1.collider as CircleCollider, entity2.collider as RectangleCollider);
            case 'rectangle':
                return entity2.collider.type === 'circle'
                    ? this.checkCircleRectangle(entity2.collider as CircleCollider, entity1.collider as RectangleCollider)
                    : this.checkRectangleRectangle(entity1.collider as RectangleCollider, entity2.collider as RectangleCollider);
        }
    }

    /**
     * Check collisions between all registered entities
     */
    public update(): CollisionResult[] {
        const collisions: CollisionResult[] = [];
        const entities = Array.from(this.entities.values());

        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const result = this.checkCollision(entities[i], entities[j]);
                if (result.collided) {
                    collisions.push(result);
                }
            }
        }

        return collisions;
    }

    /**
     * Check collision between two circles
     */
    private checkCircleCircle(circle1: CircleCollider, circle2: CircleCollider): CollisionResult {
        const dx = circle2.x - circle1.x;
        const dy = circle2.y - circle1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const sumRadii = circle1.radius + circle2.radius;

        return {
            collided: distance < sumRadii,
            overlap: distance < sumRadii ? {
                x: dx * (sumRadii - distance) / distance,
                y: dy * (sumRadii - distance) / distance
            } : undefined
        };
    }

    /**
     * Check collision between circle and rectangle
     */
    private checkCircleRectangle(circle: CircleCollider, rect: RectangleCollider): CollisionResult {
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

        return {
            collided: distanceSquared < (circle.radius * circle.radius),
            overlap: distanceSquared < (circle.radius * circle.radius) ? {
                x: distanceX,
                y: distanceY
            } : undefined
        };
    }

    /**
     * Check collision between two rectangles
     */
    private checkRectangleRectangle(rect1: RectangleCollider, rect2: RectangleCollider): CollisionResult {
        const collided = !(rect2.x > rect1.x + rect1.width ||
            rect2.x + rect2.width < rect1.x ||
            rect2.y > rect1.y + rect1.height ||
            rect2.y + rect2.height < rect1.y);

        return {
            collided,
            overlap: collided ? {
                x: Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - Math.max(rect1.x, rect2.x),
                y: Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - Math.max(rect1.y, rect2.y)
            } : undefined
        };
    }

    /**
     * Clear all registered entities
     */
    public clear(): void {
        this.entities.clear();
    }
}

// Export singleton instance
export const collisionSystem = CollisionSystem.getInstance();
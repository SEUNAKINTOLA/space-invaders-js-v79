/**
 * @file ShootingPatterns.ts
 * @description Defines various shooting patterns and behaviors for enemy entities
 * Contains reusable shooting pattern algorithms that can be used by enemy ships
 */

// Types and interfaces
interface ShootingPattern {
    calculateShots(
        sourceX: number, 
        sourceY: number, 
        targetX: number, 
        targetY: number,
        time: number
    ): ProjectileConfig[];
}

interface ProjectileConfig {
    x: number;
    y: number;
    angle: number;
    speed: number;
    type: ProjectileType;
}

enum ProjectileType {
    STANDARD = 'standard',
    SPREAD = 'spread',
    HOMING = 'homing',
    BURST = 'burst'
}

// Constants
const DEFAULT_PROJECTILE_SPEED = 5;
const SPREAD_ANGLE = Math.PI / 6; // 30 degrees
const BURST_COUNT = 3;
const SPIRAL_ROTATION_SPEED = 0.1;

/**
 * Base class for shooting patterns
 */
export abstract class BaseShootingPattern implements ShootingPattern {
    protected speed: number;
    
    constructor(speed: number = DEFAULT_PROJECTILE_SPEED) {
        this.speed = speed;
    }

    abstract calculateShots(
        sourceX: number, 
        sourceY: number, 
        targetX: number, 
        targetY: number,
        time: number
    ): ProjectileConfig[];

    /**
     * Calculate angle between source and target
     */
    protected calculateTargetAngle(
        sourceX: number, 
        sourceY: number, 
        targetX: number, 
        targetY: number
    ): number {
        return Math.atan2(targetY - sourceY, targetX - sourceX);
    }
}

/**
 * Single shot directly at target
 */
export class DirectShot extends BaseShootingPattern {
    calculateShots(
        sourceX: number, 
        sourceY: number, 
        targetX: number, 
        targetY: number,
        time: number
    ): ProjectileConfig[] {
        const angle = this.calculateTargetAngle(sourceX, sourceY, targetX, targetY);
        
        return [{
            x: sourceX,
            y: sourceY,
            angle,
            speed: this.speed,
            type: ProjectileType.STANDARD
        }];
    }
}

/**
 * Multiple shots in a spread pattern
 */
export class SpreadShot extends BaseShootingPattern {
    private spreadCount: number;

    constructor(spreadCount: number = 3, speed: number = DEFAULT_PROJECTILE_SPEED) {
        super(speed);
        this.spreadCount = Math.max(1, spreadCount);
    }

    calculateShots(
        sourceX: number, 
        sourceY: number, 
        targetX: number, 
        targetY: number,
        time: number
    ): ProjectileConfig[] {
        const centerAngle = this.calculateTargetAngle(sourceX, sourceY, targetX, targetY);
        const shots: ProjectileConfig[] = [];

        for (let i = 0; i < this.spreadCount; i++) {
            const angleOffset = SPREAD_ANGLE * (i - (this.spreadCount - 1) / 2);
            shots.push({
                x: sourceX,
                y: sourceY,
                angle: centerAngle + angleOffset,
                speed: this.speed,
                type: ProjectileType.SPREAD
            });
        }

        return shots;
    }
}

/**
 * Burst of shots in quick succession
 */
export class BurstShot extends BaseShootingPattern {
    calculateShots(
        sourceX: number, 
        sourceY: number, 
        targetX: number, 
        targetY: number,
        time: number
    ): ProjectileConfig[] {
        const angle = this.calculateTargetAngle(sourceX, sourceY, targetX, targetY);
        const shots: ProjectileConfig[] = [];

        for (let i = 0; i < BURST_COUNT; i++) {
            shots.push({
                x: sourceX,
                y: sourceY,
                angle,
                speed: this.speed * (1 + i * 0.1), // Slightly different speeds
                type: ProjectileType.BURST
            });
        }

        return shots;
    }
}

/**
 * Spiral pattern that rotates over time
 */
export class SpiralShot extends BaseShootingPattern {
    private bulletCount: number;

    constructor(bulletCount: number = 8, speed: number = DEFAULT_PROJECTILE_SPEED) {
        super(speed);
        this.bulletCount = Math.max(1, bulletCount);
    }

    calculateShots(
        sourceX: number, 
        sourceY: number, 
        targetX: number, 
        targetY: number,
        time: number
    ): ProjectileConfig[] {
        const shots: ProjectileConfig[] = [];
        const baseAngle = time * SPIRAL_ROTATION_SPEED;
        const angleStep = (2 * Math.PI) / this.bulletCount;

        for (let i = 0; i < this.bulletCount; i++) {
            shots.push({
                x: sourceX,
                y: sourceY,
                angle: baseAngle + (i * angleStep),
                speed: this.speed,
                type: ProjectileType.STANDARD
            });
        }

        return shots;
    }
}

/**
 * Factory for creating shooting patterns
 */
export class ShootingPatternFactory {
    static createPattern(
        type: string, 
        config: { speed?: number, count?: number } = {}
    ): ShootingPattern {
        switch (type.toLowerCase()) {
            case 'direct':
                return new DirectShot(config.speed);
            case 'spread':
                return new SpreadShot(config.count, config.speed);
            case 'burst':
                return new BurstShot(config.speed);
            case 'spiral':
                return new SpiralShot(config.count, config.speed);
            default:
                throw new Error(`Unknown shooting pattern type: ${type}`);
        }
    }
}
/**
 * @file MovementPatterns.ts
 * @description Implements various movement patterns for enemy entities in the game.
 * Each pattern provides a way to calculate the next position of an enemy based on
 * different algorithms and parameters.
 */

// Types and interfaces
interface Position {
    x: number;
    y: number;
}

interface MovementPattern {
    calculate(
        currentPos: Position,
        time: number,
        params: MovementParams
    ): Position;
}

interface MovementParams {
    amplitude?: number;
    frequency?: number;
    speed?: number;
    radius?: number;
    centerX?: number;
    centerY?: number;
    direction?: number;
}

/**
 * Base class for movement patterns that handles common functionality
 * and parameter validation
 */
abstract class BaseMovementPattern implements MovementPattern {
    protected validateParams(params: MovementParams): void {
        if (params.speed && params.speed < 0) {
            throw new Error('Speed must be a positive number');
        }
        if (params.amplitude && params.amplitude < 0) {
            throw new Error('Amplitude must be a positive number');
        }
    }

    abstract calculate(
        currentPos: Position,
        time: number,
        params: MovementParams
    ): Position;
}

/**
 * Implements a sine wave movement pattern
 */
export class SineWavePattern extends BaseMovementPattern {
    calculate(
        currentPos: Position,
        time: number,
        params: MovementParams
    ): Position {
        this.validateParams(params);
        const amplitude = params.amplitude || 50;
        const frequency = params.frequency || 0.002;
        const speed = params.speed || 2;

        return {
            x: currentPos.x - speed,
            y: currentPos.y + Math.sin(time * frequency) * amplitude
        };
    }
}

/**
 * Implements a circular movement pattern
 */
export class CircularPattern extends BaseMovementPattern {
    calculate(
        currentPos: Position,
        time: number,
        params: MovementParams
    ): Position {
        this.validateParams(params);
        const radius = params.radius || 50;
        const speed = params.speed || 0.002;
        const centerX = params.centerX || currentPos.x;
        const centerY = params.centerY || currentPos.y;

        return {
            x: centerX + radius * Math.cos(time * speed),
            y: centerY + radius * Math.sin(time * speed)
        };
    }
}

/**
 * Implements a zigzag movement pattern
 */
export class ZigZagPattern extends BaseMovementPattern {
    calculate(
        currentPos: Position,
        time: number,
        params: MovementParams
    ): Position {
        this.validateParams(params);
        const amplitude = params.amplitude || 50;
        const frequency = params.frequency || 0.005;
        const speed = params.speed || 2;

        return {
            x: currentPos.x - speed,
            y: currentPos.y + (amplitude * Math.sign(Math.sin(time * frequency)))
        };
    }
}

/**
 * Implements a straight line movement pattern
 */
export class LinearPattern extends BaseMovementPattern {
    calculate(
        currentPos: Position,
        time: number,
        params: MovementParams
    ): Position {
        this.validateParams(params);
        const speed = params.speed || 2;
        const direction = params.direction || 0;

        return {
            x: currentPos.x + Math.cos(direction) * speed,
            y: currentPos.y + Math.sin(direction) * speed
        };
    }
}

/**
 * Factory class for creating movement patterns
 */
export class MovementPatternFactory {
    static createPattern(type: string): MovementPattern {
        switch (type.toLowerCase()) {
            case 'sine':
                return new SineWavePattern();
            case 'circular':
                return new CircularPattern();
            case 'zigzag':
                return new ZigZagPattern();
            case 'linear':
                return new LinearPattern();
            default:
                throw new Error(`Unknown movement pattern type: ${type}`);
        }
    }
}

/**
 * Utility functions for movement patterns
 */
export const MovementUtils = {
    /**
     * Combines multiple movement patterns with weighted influences
     */
    combinePatterns(
        patterns: MovementPattern[],
        weights: number[],
        currentPos: Position,
        time: number,
        params: MovementParams
    ): Position {
        if (patterns.length !== weights.length) {
            throw new Error('Number of patterns must match number of weights');
        }

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        if (Math.abs(totalWeight - 1) > 0.001) {
            throw new Error('Weights must sum to 1');
        }

        let resultX = 0;
        let resultY = 0;

        patterns.forEach((pattern, index) => {
            const pos = pattern.calculate(currentPos, time, params);
            resultX += pos.x * weights[index];
            resultY += pos.y * weights[index];
        });

        return { x: resultX, y: resultY };
    }
};
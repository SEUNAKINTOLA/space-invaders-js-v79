/**
 * @file WavePatterns.ts
 * @description Defines enemy wave patterns and configurations for the game.
 * Contains wave templates, spawn configurations, and pattern definitions.
 */

import { Enemy } from '../entities/Enemy';

/**
 * Represents the position and timing for enemy spawns
 */
interface SpawnPoint {
    x: number;
    y: number;
    delay: number;
}

/**
 * Defines the configuration for a single enemy in a wave
 */
interface EnemyConfig {
    type: string;
    health: number;
    speed: number;
    points: number;
    behavior: string;
    shootingPattern?: string;
}

/**
 * Defines a complete wave configuration
 */
interface WaveConfig {
    id: string;
    name: string;
    difficulty: number;
    totalEnemies: number;
    spawnInterval: number;
    enemies: EnemyConfig[];
    spawnPoints: SpawnPoint[];
}

/**
 * Enum for different wave formation types
 */
enum WaveFormation {
    V_FORMATION = 'v_formation',
    LINE = 'line',
    CIRCLE = 'circle',
    RANDOM = 'random',
    DIAGONAL = 'diagonal'
}

/**
 * Class responsible for managing wave patterns and configurations
 */
export class WavePatterns {
    private static readonly DEFAULT_SPAWN_INTERVAL = 1000; // ms
    private static readonly DEFAULT_ENEMY_HEALTH = 100;
    private static readonly DEFAULT_ENEMY_SPEED = 2;

    /**
     * Predefined wave patterns that can be used in the game
     */
    private static readonly waveTemplates: Record<string, WaveConfig> = {
        basic: {
            id: 'wave_basic',
            name: 'Basic Wave',
            difficulty: 1,
            totalEnemies: 5,
            spawnInterval: 1000,
            enemies: [
                {
                    type: 'basic',
                    health: 100,
                    speed: 2,
                    points: 100,
                    behavior: 'linear'
                }
            ],
            spawnPoints: [
                { x: 0.2, y: 0, delay: 0 },
                { x: 0.4, y: 0, delay: 200 },
                { x: 0.6, y: 0, delay: 400 },
                { x: 0.8, y: 0, delay: 600 }
            ]
        },
        // Add more wave templates as needed
    };

    /**
     * Creates a new wave configuration based on difficulty level
     * @param difficulty - The difficulty level of the wave
     * @returns A new wave configuration
     */
    public static createWaveConfig(difficulty: number): WaveConfig {
        const baseConfig = this.getBaseWaveConfig(difficulty);
        return this.adjustWaveForDifficulty(baseConfig, difficulty);
    }

    /**
     * Generates spawn points for a given formation
     * @param formation - The formation type to generate
     * @param count - Number of spawn points to generate
     * @returns Array of spawn points
     */
    public static generateFormation(formation: WaveFormation, count: number): SpawnPoint[] {
        switch (formation) {
            case WaveFormation.V_FORMATION:
                return this.generateVFormation(count);
            case WaveFormation.LINE:
                return this.generateLineFormation(count);
            case WaveFormation.CIRCLE:
                return this.generateCircleFormation(count);
            case WaveFormation.RANDOM:
                return this.generateRandomFormation(count);
            default:
                return this.generateLineFormation(count);
        }
    }

    /**
     * Gets a predefined wave template by ID
     * @param templateId - The ID of the template to retrieve
     * @returns The wave template configuration
     */
    public static getWaveTemplate(templateId: string): WaveConfig {
        if (!this.waveTemplates[templateId]) {
            throw new Error(`Wave template '${templateId}' not found`);
        }
        return { ...this.waveTemplates[templateId] };
    }

    /**
     * Generates a base wave configuration
     * @param difficulty - The difficulty level
     * @returns Base wave configuration
     */
    private static getBaseWaveConfig(difficulty: number): WaveConfig {
        return {
            id: `wave_${Date.now()}`,
            name: `Wave ${difficulty}`,
            difficulty,
            totalEnemies: Math.floor(5 + difficulty * 1.5),
            spawnInterval: this.DEFAULT_SPAWN_INTERVAL,
            enemies: [],
            spawnPoints: []
        };
    }

    /**
     * Adjusts wave configuration based on difficulty
     * @param config - Base wave configuration
     * @param difficulty - Difficulty level
     * @returns Adjusted wave configuration
     */
    private static adjustWaveForDifficulty(config: WaveConfig, difficulty: number): WaveConfig {
        const adjusted = { ...config };
        adjusted.spawnInterval = Math.max(
            200,
            this.DEFAULT_SPAWN_INTERVAL - (difficulty * 50)
        );
        
        // Add enemies based on difficulty
        adjusted.enemies = this.generateEnemyTypes(difficulty);
        
        return adjusted;
    }

    /**
     * Generates enemy types based on difficulty
     * @param difficulty - The difficulty level
     * @returns Array of enemy configurations
     */
    private static generateEnemyTypes(difficulty: number): EnemyConfig[] {
        const enemies: EnemyConfig[] = [];
        const baseHealth = this.DEFAULT_ENEMY_HEALTH + (difficulty * 20);
        const baseSpeed = this.DEFAULT_ENEMY_SPEED + (difficulty * 0.2);

        enemies.push({
            type: 'basic',
            health: baseHealth,
            speed: baseSpeed,
            points: 100 * difficulty,
            behavior: 'linear'
        });

        if (difficulty > 2) {
            enemies.push({
                type: 'advanced',
                health: baseHealth * 1.5,
                speed: baseSpeed * 1.2,
                points: 200 * difficulty,
                behavior: 'zigzag',
                shootingPattern: 'burst'
            });
        }

        return enemies;
    }

    // Formation generation helper methods
    private static generateVFormation(count: number): SpawnPoint[] {
        const points: SpawnPoint[] = [];
        const spacing = 0.8 / count;
        
        for (let i = 0; i < count; i++) {
            points.push({
                x: 0.1 + (i * spacing),
                y: Math.abs(count/2 - i) * 0.1,
                delay: i * 200
            });
        }
        return points;
    }

    private static generateLineFormation(count: number): SpawnPoint[] {
        const points: SpawnPoint[] = [];
        const spacing = 0.8 / count;
        
        for (let i = 0; i < count; i++) {
            points.push({
                x: 0.1 + (i * spacing),
                y: 0,
                delay: i * 200
            });
        }
        return points;
    }

    private static generateCircleFormation(count: number): SpawnPoint[] {
        const points: SpawnPoint[] = [];
        const radius = 0.3;
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            points.push({
                x: 0.5 + Math.cos(angle) * radius,
                y: 0.2 + Math.sin(angle) * radius,
                delay: i * 200
            });
        }
        return points;
    }

    private static generateRandomFormation(count: number): SpawnPoint[] {
        const points: SpawnPoint[] = [];
        
        for (let i = 0; i < count; i++) {
            points.push({
                x: 0.1 + Math.random() * 0.8,
                y: Math.random() * 0.3,
                delay: i * 200
            });
        }
        return points;
    }
}
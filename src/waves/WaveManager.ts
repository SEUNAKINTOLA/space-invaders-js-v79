/**
 * @file WaveManager.ts
 * @description Manages enemy wave spawning, progression, and difficulty scaling
 * in the game. Handles wave patterns, timing, and enemy distribution.
 */

import { Enemy } from '../entities/Enemy';
import { WavePatterns } from './WavePatterns';
import { GameState } from '../engine/gameState';

/**
 * Wave configuration interface
 */
interface WaveConfig {
    enemyCount: number;
    spawnDelay: number;
    difficulty: number;
    patterns: string[];
}

/**
 * Manages the spawning and progression of enemy waves
 */
export class WaveManager {
    private currentWave: number;
    private enemiesSpawned: number;
    private enemiesRemaining: number;
    private spawnTimer: number;
    private isWaveActive: boolean;
    private waveConfigs: Map<number, WaveConfig>;
    private activeEnemies: Enemy[];
    private gameState: GameState;

    /**
     * Creates a new WaveManager instance
     * @param gameState Current game state instance
     */
    constructor(gameState: GameState) {
        this.currentWave = 0;
        this.enemiesSpawned = 0;
        this.enemiesRemaining = 0;
        this.spawnTimer = 0;
        this.isWaveActive = false;
        this.activeEnemies = [];
        this.gameState = gameState;
        this.waveConfigs = this.initializeWaveConfigs();
    }

    /**
     * Initializes wave configurations with increasing difficulty
     */
    private initializeWaveConfigs(): Map<number, WaveConfig> {
        const configs = new Map<number, WaveConfig>();
        
        // Define wave configurations with progressive difficulty
        configs.set(1, {
            enemyCount: 5,
            spawnDelay: 1000,
            difficulty: 1,
            patterns: ['basic']
        });

        configs.set(2, {
            enemyCount: 8,
            spawnDelay: 800,
            difficulty: 1.2,
            patterns: ['basic', 'zigzag']
        });

        // Add more wave configurations...

        return configs;
    }

    /**
     * Starts a new wave
     */
    public startWave(): void {
        try {
            this.currentWave++;
            const config = this.waveConfigs.get(this.currentWave);
            
            if (!config) {
                throw new Error(`Wave configuration not found for wave ${this.currentWave}`);
            }

            this.enemiesRemaining = config.enemyCount;
            this.enemiesSpawned = 0;
            this.isWaveActive = true;
            this.spawnTimer = 0;

            this.gameState.onWaveStart(this.currentWave);
        } catch (error) {
            console.error('Error starting wave:', error);
            this.handleWaveError();
        }
    }

    /**
     * Updates the wave manager state
     * @param deltaTime Time elapsed since last update
     */
    public update(deltaTime: number): void {
        if (!this.isWaveActive) return;

        try {
            this.spawnTimer += deltaTime;
            const config = this.waveConfigs.get(this.currentWave);

            if (!config) return;

            if (this.spawnTimer >= config.spawnDelay && this.enemiesSpawned < config.enemyCount) {
                this.spawnEnemy(config);
                this.spawnTimer = 0;
            }

            this.checkWaveCompletion();
        } catch (error) {
            console.error('Error updating wave:', error);
            this.handleWaveError();
        }
    }

    /**
     * Spawns a new enemy based on wave configuration
     * @param config Current wave configuration
     */
    private spawnEnemy(config: WaveConfig): void {
        const pattern = this.selectPattern(config.patterns);
        const enemy = new Enemy({
            pattern,
            difficulty: config.difficulty,
            wave: this.currentWave
        });

        this.activeEnemies.push(enemy);
        this.enemiesSpawned++;
    }

    /**
     * Selects a movement pattern for the enemy
     * @param patterns Available patterns for the current wave
     * @returns Selected pattern name
     */
    private selectPattern(patterns: string[]): string {
        const index = Math.floor(Math.random() * patterns.length);
        return patterns[index];
    }

    /**
     * Checks if the current wave is complete
     */
    private checkWaveCompletion(): void {
        if (this.enemiesRemaining <= 0 && this.activeEnemies.length === 0) {
            this.isWaveActive = false;
            this.gameState.onWaveComplete(this.currentWave);
        }
    }

    /**
     * Handles enemy destruction and updates remaining count
     * @param enemy Destroyed enemy instance
     */
    public onEnemyDestroyed(enemy: Enemy): void {
        const index = this.activeEnemies.indexOf(enemy);
        if (index !== -1) {
            this.activeEnemies.splice(index, 1);
            this.enemiesRemaining--;
        }
    }

    /**
     * Handles wave-related errors
     */
    private handleWaveError(): void {
        this.isWaveActive = false;
        this.gameState.onWaveError(this.currentWave);
    }

    /**
     * Gets the current wave number
     */
    public getCurrentWave(): number {
        return this.currentWave;
    }

    /**
     * Gets the number of remaining enemies
     */
    public getRemainingEnemies(): number {
        return this.enemiesRemaining;
    }

    /**
     * Resets the wave manager to initial state
     */
    public reset(): void {
        this.currentWave = 0;
        this.enemiesSpawned = 0;
        this.enemiesRemaining = 0;
        this.spawnTimer = 0;
        this.isWaveActive = false;
        this.activeEnemies = [];
    }
}
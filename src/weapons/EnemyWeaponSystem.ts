/**
 * @file EnemyWeaponSystem.ts
 * @description Manages enemy weapon systems and shooting patterns
 * @module weapons/EnemyWeaponSystem
 */

import { Projectile } from '../entities/Projectile';
import { Enemy } from '../entities/Enemy';
import { ShootingPatterns } from '../ai/ShootingPatterns';
import { gameState } from '../engine/gameState';

/**
 * Represents weapon configuration for enemies
 */
interface WeaponConfig {
    damage: number;
    speed: number;
    cooldown: number;
    projectileSize: number;
    pattern: string;
}

/**
 * Manages enemy weapon systems and shooting behavior
 */
export class EnemyWeaponSystem {
    private enemies: Enemy[];
    private projectiles: Projectile[];
    private lastShotTime: Map<number, number>;
    private shootingPatterns: ShootingPatterns;

    constructor() {
        this.enemies = [];
        this.projectiles = [];
        this.lastShotTime = new Map();
        this.shootingPatterns = new ShootingPatterns();
    }

    /**
     * Registers an enemy with the weapon system
     * @param enemy - Enemy entity to register
     */
    public registerEnemy(enemy: Enemy): void {
        if (!enemy) {
            throw new Error('Cannot register null enemy');
        }
        this.enemies.push(enemy);
        this.lastShotTime.set(enemy.getId(), 0);
    }

    /**
     * Unregisters an enemy from the weapon system
     * @param enemy - Enemy entity to unregister
     */
    public unregisterEnemy(enemy: Enemy): void {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            this.lastShotTime.delete(enemy.getId());
        }
    }

    /**
     * Updates the weapon system state
     * @param deltaTime - Time elapsed since last update
     */
    public update(deltaTime: number): void {
        this.enemies.forEach(enemy => {
            if (this.canEnemyShoot(enemy)) {
                this.handleEnemyShooting(enemy);
            }
        });

        // Update projectiles
        this.projectiles = this.projectiles.filter(projectile => {
            projectile.update(deltaTime);
            return !this.isProjectileOutOfBounds(projectile);
        });
    }

    /**
     * Checks if an enemy can shoot based on cooldown
     * @param enemy - Enemy to check
     * @returns boolean indicating if enemy can shoot
     */
    private canEnemyShoot(enemy: Enemy): boolean {
        const currentTime = Date.now();
        const lastShot = this.lastShotTime.get(enemy.getId()) || 0;
        const weaponConfig = this.getWeaponConfig(enemy);

        return currentTime - lastShot >= weaponConfig.cooldown;
    }

    /**
     * Handles enemy shooting logic
     * @param enemy - Enemy that is shooting
     */
    private handleEnemyShooting(enemy: Enemy): void {
        const weaponConfig = this.getWeaponConfig(enemy);
        const pattern = this.shootingPatterns.getPattern(weaponConfig.pattern);
        
        if (!pattern) {
            console.warn(`Invalid shooting pattern for enemy: ${enemy.getId()}`);
            return;
        }

        const projectilePositions = pattern.calculateProjectilePositions(enemy);
        
        projectilePositions.forEach(position => {
            const projectile = new Projectile({
                x: position.x,
                y: position.y,
                speed: weaponConfig.speed,
                damage: weaponConfig.damage,
                size: weaponConfig.projectileSize,
                isEnemy: true
            });

            this.projectiles.push(projectile);
        });

        this.lastShotTime.set(enemy.getId(), Date.now());
    }

    /**
     * Gets weapon configuration for an enemy
     * @param enemy - Enemy to get configuration for
     * @returns WeaponConfig for the enemy
     */
    private getWeaponConfig(enemy: Enemy): WeaponConfig {
        // This could be expanded to handle different enemy types
        return {
            damage: 10,
            speed: 5,
            cooldown: 1000,
            projectileSize: 5,
            pattern: 'standard'
        };
    }

    /**
     * Checks if a projectile is out of bounds
     * @param projectile - Projectile to check
     * @returns boolean indicating if projectile is out of bounds
     */
    private isProjectileOutOfBounds(projectile: Projectile): boolean {
        const bounds = gameState.getBounds();
        const pos = projectile.getPosition();
        
        return pos.x < 0 || 
               pos.x > bounds.width || 
               pos.y < 0 || 
               pos.y > bounds.height;
    }

    /**
     * Gets all active projectiles
     * @returns Array of active projectiles
     */
    public getProjectiles(): Projectile[] {
        return this.projectiles;
    }

    /**
     * Clears all projectiles
     */
    public clearProjectiles(): void {
        this.projectiles = [];
    }
}
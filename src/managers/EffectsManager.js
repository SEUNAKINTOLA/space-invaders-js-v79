/**
 * @fileoverview EffectsManager handles visual feedback effects for game events
 * such as scoring, collisions, power-ups, and other game state changes.
 * 
 * @module managers/EffectsManager
 */

// Constants for effect types and configurations
const EFFECT_TYPES = {
    SCORE_POPUP: 'scorePopup',
    EXPLOSION: 'explosion',
    POWERUP: 'powerup',
    HIT_FLASH: 'hitFlash',
    SHIELD: 'shield'
};

const EFFECT_CONFIGS = {
    scorePopup: {
        duration: 1000,
        fadeStart: 800,
        fontSize: '20px'
    },
    explosion: {
        duration: 500,
        particleCount: 15,
        maxSize: 3
    },
    powerup: {
        duration: 300,
        glowColor: '#ffff00'
    },
    hitFlash: {
        duration: 100,
        color: '#ff0000'
    },
    shield: {
        duration: 2000,
        pulseRate: 200
    }
};

/**
 * Manages visual effects and animations for game feedback
 */
class EffectsManager {
    /**
     * Initialize the effects manager
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    constructor(ctx) {
        if (!ctx) {
            throw new Error('Canvas context is required for EffectsManager');
        }
        
        this.ctx = ctx;
        this.activeEffects = new Map();
        this.effectId = 0;
    }

    /**
     * Creates a score popup effect at the specified position
     * @param {number} score - Score value to display
     * @param {Object} position - Position coordinates {x, y}
     * @returns {string} Effect ID
     */
    createScorePopup(score, position) {
        try {
            const id = this._generateEffectId();
            const effect = {
                type: EFFECT_TYPES.SCORE_POPUP,
                value: score,
                position: { ...position },
                startTime: Date.now(),
                config: EFFECT_CONFIGS.scorePopup
            };
            
            this.activeEffects.set(id, effect);
            return id;
        } catch (error) {
            console.error('Failed to create score popup:', error);
            return null;
        }
    }

    /**
     * Creates an explosion effect
     * @param {Object} position - Position coordinates {x, y}
     * @param {number} size - Size of the explosion
     * @returns {string} Effect ID
     */
    createExplosion(position, size) {
        try {
            const id = this._generateEffectId();
            const effect = {
                type: EFFECT_TYPES.EXPLOSION,
                position: { ...position },
                size,
                startTime: Date.now(),
                particles: this._generateExplosionParticles(size),
                config: EFFECT_CONFIGS.explosion
            };
            
            this.activeEffects.set(id, effect);
            return id;
        } catch (error) {
            console.error('Failed to create explosion:', error);
            return null;
        }
    }

    /**
     * Updates all active effects
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        try {
            const currentTime = Date.now();
            
            for (const [id, effect] of this.activeEffects.entries()) {
                const elapsed = currentTime - effect.startTime;
                
                if (elapsed >= effect.config.duration) {
                    this.activeEffects.delete(id);
                    continue;
                }

                this._updateEffect(effect, elapsed, deltaTime);
            }
        } catch (error) {
            console.error('Error updating effects:', error);
        }
    }

    /**
     * Renders all active effects
     */
    render() {
        try {
            for (const effect of this.activeEffects.values()) {
                this._renderEffect(effect);
            }
        } catch (error) {
            console.error('Error rendering effects:', error);
        }
    }

    /**
     * Clears all active effects
     */
    clearEffects() {
        this.activeEffects.clear();
    }

    /**
     * Generates a unique effect ID
     * @private
     * @returns {string}
     */
    _generateEffectId() {
        return `effect_${++this.effectId}`;
    }

    /**
     * Updates a single effect
     * @private
     * @param {Object} effect - Effect object to update
     * @param {number} elapsed - Time elapsed since effect start
     * @param {number} deltaTime - Time since last update
     */
    _updateEffect(effect, elapsed, deltaTime) {
        switch (effect.type) {
            case EFFECT_TYPES.SCORE_POPUP:
                effect.position.y -= deltaTime * 0.05; // Float upward
                effect.alpha = Math.max(0, 1 - (elapsed / effect.config.duration));
                break;
            case EFFECT_TYPES.EXPLOSION:
                this._updateExplosionParticles(effect, deltaTime);
                break;
            // Add other effect type updates as needed
        }
    }

    /**
     * Renders a single effect
     * @private
     * @param {Object} effect - Effect object to render
     */
    _renderEffect(effect) {
        this.ctx.save();
        
        switch (effect.type) {
            case EFFECT_TYPES.SCORE_POPUP:
                this._renderScorePopup(effect);
                break;
            case EFFECT_TYPES.EXPLOSION:
                this._renderExplosion(effect);
                break;
            // Add other effect type renders as needed
        }
        
        this.ctx.restore();
    }

    /**
     * Generates particles for explosion effect
     * @private
     * @param {number} size - Size of explosion
     * @returns {Array} Array of particle objects
     */
    _generateExplosionParticles(size) {
        const particles = [];
        const count = EFFECT_CONFIGS.explosion.particleCount;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            particles.push({
                angle,
                speed: Math.random() * size * 0.5,
                size: Math.random() * EFFECT_CONFIGS.explosion.maxSize,
                life: 1.0
            });
        }
        
        return particles;
    }

    /**
     * Updates explosion particles
     * @private
     * @param {Object} effect - Explosion effect object
     * @param {number} deltaTime - Time since last update
     */
    _updateExplosionParticles(effect, deltaTime) {
        for (const particle of effect.particles) {
            particle.life -= deltaTime * 0.001;
            particle.x += Math.cos(particle.angle) * particle.speed * deltaTime;
            particle.y += Math.sin(particle.angle) * particle.speed * deltaTime;
        }
    }

    /**
     * Renders score popup effect
     * @private
     * @param {Object} effect - Score popup effect object
     */
    _renderScorePopup(effect) {
        this.ctx.globalAlpha = effect.alpha;
        this.ctx.font = effect.config.fontSize + ' Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `+${effect.value}`,
            effect.position.x,
            effect.position.y
        );
    }

    /**
     * Renders explosion effect
     * @private
     * @param {Object} effect - Explosion effect object
     */
    _renderExplosion(effect) {
        for (const particle of effect.particles) {
            if (particle.life <= 0) continue;
            
            this.ctx.globalAlpha = particle.life;
            this.ctx.beginPath();
            this.ctx.arc(
                effect.position.x + particle.x,
                effect.position.y + particle.y,
                particle.size,
                0,
                Math.PI * 2
            );
            this.ctx.fillStyle = '#ff7700';
            this.ctx.fill();
        }
    }
}

export default EffectsManager;
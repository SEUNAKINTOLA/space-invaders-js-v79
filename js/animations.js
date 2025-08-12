/**
 * @fileoverview Animation system for game visual effects and polish
 * Handles sprite animations, transitions, and visual feedback
 * 
 * @module animations
 */

// Constants for animation settings
const ANIMATION_DEFAULTS = {
    duration: 300,  // Default animation duration in ms
    fps: 60,        // Target frames per second
    easing: 'linear' // Default easing function
};

// Easing functions for smooth animations
const EASING = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
};

/**
 * Manages sprite-based animations and visual effects
 */
class AnimationManager {
    constructor() {
        this.activeAnimations = new Map();
        this.animationFrameId = null;
        this.lastTimestamp = 0;
    }

    /**
     * Starts a new sprite animation
     * @param {Object} sprite - The sprite to animate
     * @param {Object} properties - Target properties to animate
     * @param {Object} options - Animation options
     * @returns {string} Animation ID
     */
    animate(sprite, properties, options = {}) {
        try {
            const id = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const animation = {
                sprite,
                startProps: { ...this._getCurrentProperties(sprite) },
                targetProps: properties,
                startTime: performance.now(),
                duration: options.duration || ANIMATION_DEFAULTS.duration,
                easing: EASING[options.easing] || EASING.linear,
                onComplete: options.onComplete
            };

            this.activeAnimations.set(id, animation);
            this._startAnimationLoop();
            return id;

        } catch (error) {
            console.error('Error starting animation:', error);
            return null;
        }
    }

    /**
     * Cancels an active animation
     * @param {string} animationId - ID of animation to cancel
     */
    cancelAnimation(animationId) {
        if (this.activeAnimations.has(animationId)) {
            this.activeAnimations.delete(animationId);
            
            if (this.activeAnimations.size === 0) {
                this._stopAnimationLoop();
            }
        }
    }

    /**
     * Creates a sprite sheet animation
     * @param {Object} sprite - Sprite object to animate
     * @param {Array} frames - Array of frame indices
     * @param {Object} options - Animation options
     * @returns {Object} Animation controller
     */
    createSpriteAnimation(sprite, frames, options = {}) {
        const controller = {
            sprite,
            frames,
            currentFrame: 0,
            frameDelay: 1000 / (options.fps || ANIMATION_DEFAULTS.fps),
            lastFrameTime: 0,
            isPlaying: false,
            loop: options.loop !== false,
            
            play() {
                this.isPlaying = true;
            },
            
            pause() {
                this.isPlaying = false;
            },
            
            reset() {
                this.currentFrame = 0;
                this.lastFrameTime = 0;
            }
        };

        return controller;
    }

    /**
     * Updates all active animations
     * @param {number} timestamp - Current animation timestamp
     * @private
     */
    _updateAnimations(timestamp) {
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        for (const [id, animation] of this.activeAnimations) {
            const progress = Math.min(
                (timestamp - animation.startTime) / animation.duration,
                1
            );

            if (progress >= 1) {
                this._completeAnimation(id, animation);
                continue;
            }

            const easedProgress = animation.easing(progress);
            this._interpolateProperties(animation.sprite, 
                                     animation.startProps, 
                                     animation.targetProps, 
                                     easedProgress);
        }

        if (this.activeAnimations.size > 0) {
            this.animationFrameId = requestAnimationFrame(
                this._updateAnimations.bind(this)
            );
        }
    }

    /**
     * Starts the animation update loop
     * @private
     */
    _startAnimationLoop() {
        if (!this.animationFrameId) {
            this.lastTimestamp = performance.now();
            this.animationFrameId = requestAnimationFrame(
                this._updateAnimations.bind(this)
            );
        }
    }

    /**
     * Stops the animation update loop
     * @private
     */
    _stopAnimationLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Gets current animated properties of a sprite
     * @param {Object} sprite - The sprite object
     * @returns {Object} Current properties
     * @private
     */
    _getCurrentProperties(sprite) {
        const props = {};
        for (const key in sprite) {
            if (typeof sprite[key] === 'number') {
                props[key] = sprite[key];
            }
        }
        return props;
    }

    /**
     * Interpolates between start and target properties
     * @param {Object} sprite - The sprite to update
     * @param {Object} start - Starting properties
     * @param {Object} target - Target properties
     * @param {number} progress - Animation progress (0-1)
     * @private
     */
    _interpolateProperties(sprite, start, target, progress) {
        for (const key in target) {
            if (start.hasOwnProperty(key)) {
                sprite[key] = start[key] + (target[key] - start[key]) * progress;
            }
        }
    }

    /**
     * Completes an animation and cleans up
     * @param {string} id - Animation ID
     * @param {Object} animation - Animation object
     * @private
     */
    _completeAnimation(id, animation) {
        // Set final values
        this._interpolateProperties(
            animation.sprite,
            animation.startProps,
            animation.targetProps,
            1
        );

        // Call completion callback if provided
        if (typeof animation.onComplete === 'function') {
            try {
                animation.onComplete();
            } catch (error) {
                console.error('Error in animation completion callback:', error);
            }
        }

        this.activeAnimations.delete(id);
    }
}

// Export the animation manager
export const animationManager = new AnimationManager();

// Export animation utility functions
export const AnimationUtils = {
    /**
     * Creates a shake animation effect
     * @param {Object} sprite - Sprite to animate
     * @param {Object} options - Shake options
     * @returns {string} Animation ID
     */
    shake(sprite, options = {}) {
        const intensity = options.intensity || 5;
        const duration = options.duration || 500;
        const originalX = sprite.x;
        const originalY = sprite.y;

        let lastTime = performance.now();
        let elapsed = 0;

        const shakeAnimation = {
            sprite,
            update(timestamp) {
                const delta = timestamp - lastTime;
                lastTime = timestamp;
                elapsed += delta;

                if (elapsed >= duration) {
                    sprite.x = originalX;
                    sprite.y = originalY;
                    return true; // Animation complete
                }

                const progress = elapsed / duration;
                const decrease = 1 - progress;
                
                sprite.x = originalX + (Math.random() * 2 - 1) * intensity * decrease;
                sprite.y = originalY + (Math.random() * 2 - 1) * intensity * decrease;
                
                return false; // Animation ongoing
            }
        };

        return animationManager.animate(sprite, shakeAnimation, { duration });
    },

    /**
     * Creates a fade animation
     * @param {Object} sprite - Sprite to animate
     * @param {number} targetAlpha - Target alpha value
     * @param {Object} options - Animation options
     * @returns {string} Animation ID
     */
    fade(sprite, targetAlpha, options = {}) {
        return animationManager.animate(sprite, 
            { alpha: targetAlpha },
            { 
                duration: options.duration || 500,
                easing: 'easeInOutQuad',
                ...options
            }
        );
    }
};
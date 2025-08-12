/**
 * @fileoverview Score Display UI Component
 * Handles rendering and animating the player's score on the game canvas
 * 
 * @module ui/ScoreDisplay
 */

// Constants for score display configuration
const SCORE_CONFIG = {
    FONT_FAMILY: 'Arial, sans-serif',
    BASE_FONT_SIZE: 24,
    COLOR: '#FFFFFF',
    POSITION: {
        x: 20,
        y: 40
    },
    ANIMATION: {
        DURATION: 500, // ms
        SCALE_UP: 1.5,
        SCALE_DOWN: 1.0
    }
};

/**
 * Class representing the score display UI component
 */
class ScoreDisplay {
    /**
     * Create a score display
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    constructor(ctx) {
        if (!ctx) {
            throw new Error('Canvas context is required for ScoreDisplay');
        }
        
        this.ctx = ctx;
        this.currentScore = 0;
        this.displayScore = 0;
        this.isAnimating = false;
        this.animationStartTime = 0;
        this.lastScoreUpdate = 0;
    }

    /**
     * Update the score value
     * @param {number} newScore - The new score value to display
     */
    updateScore(newScore) {
        if (typeof newScore !== 'number' || isNaN(newScore)) {
            console.error('Invalid score value:', newScore);
            return;
        }

        this.lastScoreUpdate = this.currentScore;
        this.currentScore = newScore;
        this.startAnimation();
    }

    /**
     * Start the score change animation
     * @private
     */
    startAnimation() {
        this.isAnimating = true;
        this.animationStartTime = performance.now();
    }

    /**
     * Calculate the current animation state
     * @private
     * @param {number} currentTime - Current timestamp
     * @returns {Object} Animation properties
     */
    calculateAnimationState(currentTime) {
        const elapsed = currentTime - this.animationStartTime;
        const progress = Math.min(elapsed / SCORE_CONFIG.ANIMATION.DURATION, 1);
        
        // Smooth easing function
        const easeOut = t => 1 - Math.pow(1 - t, 3);
        const easeValue = easeOut(progress);

        // Calculate scale and interpolated score
        const scale = SCORE_CONFIG.ANIMATION.SCALE_DOWN +
            (SCORE_CONFIG.ANIMATION.SCALE_UP - SCORE_CONFIG.ANIMATION.SCALE_DOWN) *
            Math.sin(progress * Math.PI) * (1 - progress);

        this.displayScore = Math.round(
            this.lastScoreUpdate + (this.currentScore - this.lastScoreUpdate) * easeValue
        );

        return {
            scale,
            progress,
            displayScore: this.displayScore
        };
    }

    /**
     * Render the score display
     * @param {number} timestamp - Current frame timestamp
     */
    render(timestamp) {
        if (!this.ctx) {
            return;
        }

        this.ctx.save();
        
        // Set up text rendering properties
        this.ctx.font = `${SCORE_CONFIG.BASE_FONT_SIZE}px ${SCORE_CONFIG.FONT_FAMILY}`;
        this.ctx.fillStyle = SCORE_CONFIG.COLOR;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        let scale = 1;
        let scoreToDisplay = this.currentScore;

        // Handle animation if active
        if (this.isAnimating) {
            const animState = this.calculateAnimationState(timestamp);
            scale = animState.scale;
            scoreToDisplay = animState.displayScore;

            if (animState.progress >= 1) {
                this.isAnimating = false;
            }
        }

        // Apply scale transform
        this.ctx.translate(SCORE_CONFIG.POSITION.x, SCORE_CONFIG.POSITION.y);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-SCORE_CONFIG.POSITION.x, -SCORE_CONFIG.POSITION.y);

        // Draw score text
        const scoreText = `Score: ${scoreToDisplay.toLocaleString()}`;
        this.ctx.fillText(
            scoreText,
            SCORE_CONFIG.POSITION.x,
            SCORE_CONFIG.POSITION.y
        );

        this.ctx.restore();
    }

    /**
     * Reset the score display
     */
    reset() {
        this.currentScore = 0;
        this.displayScore = 0;
        this.isAnimating = false;
        this.animationStartTime = 0;
        this.lastScoreUpdate = 0;
    }
}

export default ScoreDisplay;
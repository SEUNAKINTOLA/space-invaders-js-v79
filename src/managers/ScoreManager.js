/**
 * @fileoverview Score Manager Module
 * Handles tracking and updating player scores during gameplay.
 * Manages score calculations, multipliers, and high score tracking.
 */

/**
 * Class representing the Score Manager
 * Handles all score-related operations and state management
 */
class ScoreManager {
    /**
     * Create a score manager instance
     * @param {Object} config - Configuration options
     * @param {number} [config.initialScore=0] - Starting score
     * @param {number} [config.multiplier=1] - Initial score multiplier
     */
    constructor(config = {}) {
        this.score = config.initialScore || 0;
        this.multiplier = config.multiplier || 1;
        this.highScore = this.loadHighScore();
        this.scoreHistory = [];
        this.lastScoreUpdate = Date.now();
        
        // Score thresholds for different achievements
        this.scoreThresholds = {
            BRONZE: 1000,
            SILVER: 5000,
            GOLD: 10000
        };

        // Bind methods to ensure proper 'this' context
        this.updateScore = this.updateScore.bind(this);
        this.resetScore = this.resetScore.bind(this);
    }

    /**
     * Update the current score
     * @param {number} points - Points to add to current score
     * @param {Object} [options] - Additional options
     * @param {boolean} [options.applyMultiplier=true] - Whether to apply score multiplier
     * @throws {Error} If points parameter is invalid
     */
    updateScore(points, options = { applyMultiplier: true }) {
        if (typeof points !== 'number' || isNaN(points)) {
            throw new Error('Invalid points value provided to updateScore');
        }

        try {
            const scoreToAdd = options.applyMultiplier ? 
                points * this.multiplier : points;
            
            this.score += Math.round(scoreToAdd);
            this.lastScoreUpdate = Date.now();
            this.scoreHistory.push({
                points: scoreToAdd,
                timestamp: this.lastScoreUpdate
            });

            // Update high score if current score is higher
            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.saveHighScore();
            }

            // Emit score update event
            this.emitScoreUpdate();
        } catch (error) {
            console.error('Error updating score:', error);
            throw error;
        }
    }

    /**
     * Update the score multiplier
     * @param {number} newMultiplier - New multiplier value
     */
    setMultiplier(newMultiplier) {
        if (typeof newMultiplier !== 'number' || newMultiplier < 0) {
            throw new Error('Invalid multiplier value');
        }
        this.multiplier = newMultiplier;
    }

    /**
     * Reset score to initial state
     */
    resetScore() {
        this.score = 0;
        this.multiplier = 1;
        this.scoreHistory = [];
        this.lastScoreUpdate = Date.now();
        this.emitScoreUpdate();
    }

    /**
     * Get current score
     * @returns {number} Current score
     */
    getCurrentScore() {
        return this.score;
    }

    /**
     * Get current high score
     * @returns {number} Current high score
     */
    getHighScore() {
        return this.highScore;
    }

    /**
     * Check if score meets achievement threshold
     * @param {string} level - Achievement level to check
     * @returns {boolean} Whether threshold is met
     */
    checkAchievement(level) {
        if (!this.scoreThresholds[level]) {
            throw new Error('Invalid achievement level');
        }
        return this.score >= this.scoreThresholds[level];
    }

    /**
     * Load high score from local storage
     * @private
     * @returns {number} Stored high score or 0
     */
    loadHighScore() {
        try {
            const stored = localStorage.getItem('highScore');
            return stored ? parseInt(stored, 10) : 0;
        } catch (error) {
            console.warn('Could not load high score from storage:', error);
            return 0;
        }
    }

    /**
     * Save current high score to local storage
     * @private
     */
    saveHighScore() {
        try {
            localStorage.setItem('highScore', this.highScore.toString());
        } catch (error) {
            console.warn('Could not save high score to storage:', error);
        }
    }

    /**
     * Emit score update event
     * @private
     */
    emitScoreUpdate() {
        const event = new CustomEvent('scoreUpdate', {
            detail: {
                score: this.score,
                highScore: this.highScore,
                multiplier: this.multiplier
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get score statistics
     * @returns {Object} Score statistics
     */
    getScoreStats() {
        return {
            current: this.score,
            highScore: this.highScore,
            multiplier: this.multiplier,
            lastUpdate: this.lastScoreUpdate,
            historyLength: this.scoreHistory.length
        };
    }
}

// Export the ScoreManager class
export default ScoreManager;
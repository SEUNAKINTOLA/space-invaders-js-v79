/**
 * @fileoverview High Score Management System
 * Handles tracking, storing, and retrieving high scores with persistence
 * using localStorage. Includes validation, sorting, and score limit management.
 * 
 * @module managers/HighScoreManager
 */

// Constants
const STORAGE_KEY = 'gameHighScores';
const MAX_SCORES = 10; // Maximum number of high scores to keep
const DEFAULT_SCORES = [
    { name: 'CPU', score: 1000, date: '2023-01-01' },
    { name: 'CPU', score: 750, date: '2023-01-01' },
    { name: 'CPU', score: 500, date: '2023-01-01' }
];

/**
 * Manages game high scores with persistence
 */
class HighScoreManager {
    constructor() {
        this.scores = [];
        this.initialized = false;
        this.init();
    }

    /**
     * Initialize the high score system
     * @private
     */
    init() {
        try {
            this.loadScores();
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize high scores:', error);
            this.resetToDefault();
        }
    }

    /**
     * Load scores from localStorage
     * @private
     */
    loadScores() {
        try {
            const savedScores = localStorage.getItem(STORAGE_KEY);
            if (savedScores) {
                this.scores = JSON.parse(savedScores);
                this.validateScores();
            } else {
                this.resetToDefault();
            }
        } catch (error) {
            console.error('Error loading scores:', error);
            this.resetToDefault();
        }
    }

    /**
     * Save current scores to localStorage
     * @private
     */
    saveScores() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.scores));
        } catch (error) {
            console.error('Error saving scores:', error);
        }
    }

    /**
     * Reset scores to default values
     * @private
     */
    resetToDefault() {
        this.scores = [...DEFAULT_SCORES];
        this.saveScores();
    }

    /**
     * Validate and sanitize loaded scores
     * @private
     */
    validateScores() {
        const validScores = this.scores.filter(score => {
            return (
                typeof score === 'object' &&
                typeof score.name === 'string' &&
                typeof score.score === 'number' &&
                !isNaN(score.score) &&
                typeof score.date === 'string'
            );
        });

        this.scores = validScores.sort((a, b) => b.score - a.score)
            .slice(0, MAX_SCORES);
    }

    /**
     * Add a new high score if it qualifies
     * @param {string} name - Player name
     * @param {number} score - Score value
     * @returns {boolean} Whether the score was added
     */
    addScore(name, score) {
        if (!this.initialized) {
            console.error('HighScoreManager not initialized');
            return false;
        }

        if (typeof score !== 'number' || isNaN(score)) {
            console.error('Invalid score value');
            return false;
        }

        const sanitizedName = this.sanitizeName(name);
        const newScore = {
            name: sanitizedName,
            score: Math.floor(score),
            date: new Date().toISOString().split('T')[0]
        };

        const isHighScore = this.isNewHighScore(score);
        
        if (isHighScore) {
            this.scores.push(newScore);
            this.scores.sort((a, b) => b.score - a.score);
            this.scores = this.scores.slice(0, MAX_SCORES);
            this.saveScores();
        }

        return isHighScore;
    }

    /**
     * Check if a score qualifies as a high score
     * @param {number} score - Score to check
     * @returns {boolean} Whether it's a high score
     */
    isNewHighScore(score) {
        if (this.scores.length < MAX_SCORES) return true;
        return score > this.scores[this.scores.length - 1].score;
    }

    /**
     * Get all high scores
     * @returns {Array} Array of high score objects
     */
    getHighScores() {
        return [...this.scores];
    }

    /**
     * Get the current highest score
     * @returns {number} Highest score value
     */
    getTopScore() {
        return this.scores.length > 0 ? this.scores[0].score : 0;
    }

    /**
     * Sanitize player name input
     * @private
     * @param {string} name - Raw name input
     * @returns {string} Sanitized name
     */
    sanitizeName(name) {
        if (!name || typeof name !== 'string') return 'Anonymous';
        return name.trim()
            .replace(/[^\w\s-]/g, '')
            .substring(0, 20) || 'Anonymous';
    }

    /**
     * Clear all high scores
     * @returns {boolean} Success status
     */
    clearScores() {
        try {
            this.scores = [];
            this.saveScores();
            return true;
        } catch (error) {
            console.error('Error clearing scores:', error);
            return false;
        }
    }
}

// Export singleton instance
const highScoreManager = new HighScoreManager();
Object.freeze(highScoreManager);

export default highScoreManager;
/**
 * @file scoreManager.ts
 * @description Score management system for tracking and managing game scores and statistics
 * 
 * Handles:
 * - Current score tracking
 * - High score management
 * - Score multipliers
 * - Score persistence
 * - Score-based events
 */

// Types and interfaces
interface ScoreData {
    currentScore: number;
    highScore: number;
    multiplier: number;
    lastScoreUpdate: number;
    combo: number;
}

interface ScoreEvent {
    points: number;
    timestamp: number;
    type: ScoreEventType;
}

enum ScoreEventType {
    ENEMY_DESTROYED = 'enemyDestroyed',
    POWERUP_COLLECTED = 'powerupCollected',
    COMBO_BONUS = 'comboBonus',
    WAVE_COMPLETED = 'waveCompleted'
}

/**
 * Manages game scoring system and related functionality
 */
export class ScoreManager {
    private static instance: ScoreManager;
    private scoreData: ScoreData;
    private readonly COMBO_TIMEOUT = 5000; // milliseconds
    private readonly MAX_MULTIPLIER = 10;
    private scoreHistory: ScoreEvent[] = [];
    private scoreUpdateCallbacks: ((score: number) => void)[] = [];

    private constructor() {
        this.scoreData = this.initializeScoreData();
    }

    /**
     * Gets the singleton instance of ScoreManager
     */
    public static getInstance(): ScoreManager {
        if (!ScoreManager.instance) {
            ScoreManager.instance = new ScoreManager();
        }
        return ScoreManager.instance;
    }

    /**
     * Initializes score data with default values
     */
    private initializeScoreData(): ScoreData {
        const savedHighScore = this.loadHighScore();
        return {
            currentScore: 0,
            highScore: savedHighScore,
            multiplier: 1,
            lastScoreUpdate: Date.now(),
            combo: 0
        };
    }

    /**
     * Loads the high score from local storage
     */
    private loadHighScore(): number {
        try {
            const savedScore = localStorage.getItem('highScore');
            return savedScore ? parseInt(savedScore, 10) : 0;
        } catch (error) {
            console.warn('Failed to load high score:', error);
            return 0;
        }
    }

    /**
     * Saves the current high score to local storage
     */
    private saveHighScore(): void {
        try {
            localStorage.setItem('highScore', this.scoreData.highScore.toString());
        } catch (error) {
            console.warn('Failed to save high score:', error);
        }
    }

    /**
     * Adds points to the current score
     * @param points Number of points to add
     * @param eventType Type of scoring event
     */
    public addPoints(points: number, eventType: ScoreEventType): void {
        if (points < 0) {
            throw new Error('Points cannot be negative');
        }

        const now = Date.now();
        this.updateCombo(now);

        const multipliedPoints = Math.floor(points * this.scoreData.multiplier);
        this.scoreData.currentScore += multipliedPoints;

        // Update high score if necessary
        if (this.scoreData.currentScore > this.scoreData.highScore) {
            this.scoreData.highScore = this.scoreData.currentScore;
            this.saveHighScore();
        }

        // Record score event
        this.scoreHistory.push({
            points: multipliedPoints,
            timestamp: now,
            type: eventType
        });

        // Notify listeners
        this.notifyScoreUpdate();
    }

    /**
     * Updates the combo system based on timing
     * @param currentTime Current timestamp
     */
    private updateCombo(currentTime: number): void {
        const timeSinceLastScore = currentTime - this.scoreData.lastScoreUpdate;

        if (timeSinceLastScore < this.COMBO_TIMEOUT) {
            this.scoreData.combo++;
            this.scoreData.multiplier = Math.min(
                1 + (this.scoreData.combo * 0.1),
                this.MAX_MULTIPLIER
            );
        } else {
            this.resetCombo();
        }

        this.scoreData.lastScoreUpdate = currentTime;
    }

    /**
     * Resets the combo counter and multiplier
     */
    private resetCombo(): void {
        this.scoreData.combo = 0;
        this.scoreData.multiplier = 1;
    }

    /**
     * Registers a callback for score updates
     * @param callback Function to call when score changes
     */
    public onScoreUpdate(callback: (score: number) => void): void {
        this.scoreUpdateCallbacks.push(callback);
    }

    /**
     * Notifies all registered callbacks of score updates
     */
    private notifyScoreUpdate(): void {
        this.scoreUpdateCallbacks.forEach(callback => {
            callback(this.scoreData.currentScore);
        });
    }

    /**
     * Gets the current score
     */
    public getCurrentScore(): number {
        return this.scoreData.currentScore;
    }

    /**
     * Gets the current high score
     */
    public getHighScore(): number {
        return this.scoreData.highScore;
    }

    /**
     * Gets the current multiplier
     */
    public getMultiplier(): number {
        return this.scoreData.multiplier;
    }

    /**
     * Gets the current combo count
     */
    public getCombo(): number {
        return this.scoreData.combo;
    }

    /**
     * Resets all scores and multipliers
     */
    public reset(): void {
        this.scoreData.currentScore = 0;
        this.resetCombo();
        this.scoreHistory = [];
        this.notifyScoreUpdate();
    }

    /**
     * Gets recent score history
     * @param limit Number of recent events to return
     */
    public getRecentScoreHistory(limit: number = 10): ScoreEvent[] {
        return this.scoreHistory
            .slice(-limit)
            .sort((a, b) => b.timestamp - a.timestamp);
    }
}

// Export singleton instance
export const scoreManager = ScoreManager.getInstance();
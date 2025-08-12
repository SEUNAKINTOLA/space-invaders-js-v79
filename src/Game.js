import AudioManager from './managers/AudioManager.js';

/**
 * Main Game class handling core game logic and state management
 */
class Game {
    /**
     * Initialize game components and state
     * @param {HTMLCanvasElement} canvas - The game canvas element
     */
    constructor(canvas) {
        if (!canvas) {
            throw new Error('Canvas element is required');
        }

        // Core game properties
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.isRunning = false;
        this.lastTimestamp = 0;

        // Game state
        this.gameState = {
            level: 1,
            isGameOver: false,
            isPaused: false
        };

        // Initialize managers
        this.scoreManager = new ScoreManager();
        this.audioManager = new AudioManager();

        // Bind methods
        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
        this.gameLoop = this.gameLoop.bind(this);
    }

    /**
     * Start the game
     */
    start() {
        if (this.isRunning) return;
        
        try {
            this.isRunning = true;
            this.scoreManager.resetScore();
            this.lastTimestamp = performance.now();
            this.audioManager.playSound('gameStart');
            requestAnimationFrame(this.gameLoop);
        } catch (error) {
            console.error('Error starting game:', error);
        }
    }

    /**
     * Stop the game
     */
    stop() {
        try {
            this.isRunning = false;
            this.gameState.isGameOver = true;
            this.audioManager.playSound('gameOver');
        } catch (error) {
            console.error('Error stopping game:', error);
        }
    }

    /**
     * Main game loop
     * @param {number} timestamp - Current timestamp from requestAnimationFrame
     */
    gameLoop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Update game state
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        if (this.gameState.isPaused || this.gameState.isGameOver) return;

        // Update game logic here
        this.updateScore();
    }

    /**
     * Render game state
     */
    render() {
        if (!this.context) return;

        // Clear canvas
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render game elements here

        // Render score
        this.renderScore();
    }

    /**
     * Update player score based on game events
     */
    updateScore() {
        try {
            // Example score updates - modify based on actual game events
            if (this.checkEnemyDestroyed()) {
                this.scoreManager.addPoints(100);
                this.audioManager.playSound('enemyDestroyed');
            }
            if (this.checkPowerUpCollected()) {
                this.scoreManager.addPoints(50);
                this.audioManager.playSound('powerUp');
            }
        } catch (error) {
            console.error('Error updating score:', error);
        }
    }

    /**
     * Render current score on canvas
     */
    renderScore() {
        try {
            const score = this.scoreManager.getCurrentScore();
            this.context.font = '20px Arial';
            this.context.fillStyle = 'white';
            this.context.fillText(`Score: ${score}`, 10, 30);
        } catch (error) {
            console.error('Error rendering score:', error);
        }
    }

    /**
     * Example method to check if enemy was destroyed
     * @returns {boolean}
     */
    checkEnemyDestroyed() {
        // Implement actual enemy destruction detection
        return false;
    }

    /**
     * Example method to check if power-up was collected
     * @returns {boolean}
     */
    checkPowerUpCollected() {
        // Implement actual power-up collection detection
        return false;
    }

    /**
     * Handle game pause
     */
    togglePause() {
        try {
            this.gameState.isPaused = !this.gameState.isPaused;
            this.audioManager.playSound(this.gameState.isPaused ? 'pause' : 'unpause');
        } catch (error) {
            console.error('Error toggling pause:', error);
        }
    }

    /**
     * Clean up game resources
     */
    cleanup() {
        try {
            this.isRunning = false;
            this.scoreManager.saveHighScore();
            this.audioManager.stopAll();
        } catch (error) {
            console.error('Error cleaning up game resources:', error);
        }
    }
}

export default Game;
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

        // Initialize score manager
        this.scoreManager = new ScoreManager();

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
        
        this.isRunning = true;
        this.scoreManager.resetScore();
        this.lastTimestamp = performance.now();
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Stop the game
     */
    stop() {
        this.isRunning = false;
        this.gameState.isGameOver = true;
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
            }
            if (this.checkPowerUpCollected()) {
                this.scoreManager.addPoints(50);
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
        this.gameState.isPaused = !this.gameState.isPaused;
    }

    /**
     * Clean up game resources
     */
    cleanup() {
        this.isRunning = false;
        this.scoreManager.saveHighScore();
    }
}

export default Game;
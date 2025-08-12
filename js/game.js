/**
 * game.js
 * Handles core game initialization and responsive layout management
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.lastTime = 0;
        
        // Initial dimensions
        this.baseWidth = 800;  // Base design width
        this.baseHeight = 600; // Base design height
        this.scale = 1;
        
        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        
        // Initialize responsive handling
        this.initializeResponsive();
    }

    /**
     * Initialize responsive canvas handling
     */
    initializeResponsive() {
        // Set initial size
        this.handleResize();
        
        // Add resize listener
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('orientationchange', this.handleResize);
    }

    /**
     * Handle viewport resize events
     */
    handleResize() {
        // Get current viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate optimal scaling while maintaining aspect ratio
        const scaleX = viewportWidth / this.baseWidth;
        const scaleY = viewportHeight / this.baseHeight;
        this.scale = Math.min(scaleX, scaleY);

        // Calculate new dimensions
        const scaledWidth = Math.floor(this.baseWidth * this.scale);
        const scaledHeight = Math.floor(this.baseHeight * this.scale);

        // Update canvas size
        this.canvas.width = scaledWidth;
        this.canvas.height = scaledHeight;

        // Update canvas styling
        this.canvas.style.width = `${scaledWidth}px`;
        this.canvas.style.height = `${scaledHeight}px`;

        // Center the canvas
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = `${(viewportWidth - scaledWidth) / 2}px`;
        this.canvas.style.top = `${(viewportHeight - scaledHeight) / 2}px`;

        // Scale the context to maintain correct rendering
        this.ctx.scale(this.scale, this.scale);

        // Trigger a redraw
        this.render();
    }

    /**
     * Initialize the game
     */
    init() {
        try {
            this.isRunning = true;
            this.lastTime = performance.now();
            this.gameLoop();
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.handleError(error);
        }
    }

    /**
     * Main game loop
     */
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;

        try {
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;

            this.update(deltaTime);
            this.render();

            requestAnimationFrame((time) => this.gameLoop(time));
        } catch (error) {
            console.error('Game loop error:', error);
            this.handleError(error);
        }
    }

    /**
     * Update game state
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        // Game update logic will be implemented here
    }

    /**
     * Render the game
     */
    render() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.baseWidth, this.baseHeight);
        
        // Game rendering logic will be implemented here
    }

    /**
     * Handle game errors
     * @param {Error} error - The error that occurred
     */
    handleError(error) {
        this.isRunning = false;
        // Additional error handling logic can be added here
    }

    /**
     * Get current scale factor
     * @returns {number} Current scale factor
     */
    getScale() {
        return this.scale;
    }

    /**
     * Convert screen coordinates to game coordinates
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @returns {Object} Game coordinates
     */
    screenToGameCoordinates(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (screenX - rect.left) / this.scale,
            y: (screenY - rect.top) / this.scale
        };
    }
}

// Export the Game class
export default Game;
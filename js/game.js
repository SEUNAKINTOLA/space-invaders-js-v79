/**
 * game.js
 * Handles core game initialization, responsive layout management, and touch controls
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
        
        // Touch control state
        this.touchState = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            dragThreshold: 10
        };
        
        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        
        // Initialize responsive handling and touch controls
        this.initializeResponsive();
        this.initializeTouchControls();
    }

    /**
     * Initialize touch control event listeners
     */
    initializeTouchControls() {
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchend', this.handleTouchEnd);
        this.canvas.addEventListener('touchcancel', this.handleTouchEnd);
    }

    /**
     * Handle touch start event
     * @param {TouchEvent} event - Touch start event
     */
    handleTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const coords = this.screenToGameCoordinates(touch.clientX, touch.clientY);
            
            this.touchState = {
                ...this.touchState,
                active: true,
                startX: coords.x,
                startY: coords.y,
                currentX: coords.x,
                currentY: coords.y
            };
        }
    }

    /**
     * Handle touch move event
     * @param {TouchEvent} event - Touch move event
     */
    handleTouchMove(event) {
        event.preventDefault();
        if (event.touches.length === 1 && this.touchState.active) {
            const touch = event.touches[0];
            const coords = this.screenToGameCoordinates(touch.clientX, touch.clientY);
            
            this.touchState.currentX = coords.x;
            this.touchState.currentY = coords.y;
        }
    }

    /**
     * Handle touch end event
     * @param {TouchEvent} event - Touch end event
     */
    handleTouchEnd(event) {
        event.preventDefault();
        this.touchState.active = false;
    }

    /**
     * Get current touch movement delta
     * @returns {Object} Movement delta {dx, dy}
     */
    getTouchMovementDelta() {
        if (!this.touchState.active) return { dx: 0, dy: 0 };

        const dx = this.touchState.currentX - this.touchState.startX;
        const dy = this.touchState.currentY - this.touchState.startY;

        // Only register movement if it exceeds the drag threshold
        return {
            dx: Math.abs(dx) > this.touchState.dragThreshold ? dx : 0,
            dy: Math.abs(dy) > this.touchState.dragThreshold ? dy : 0
        };
    }

    /**
     * Check if touch is currently active
     * @returns {boolean} Touch active state
     */
    isTouchActive() {
        return this.touchState.active;
    }

    // ... [Previous initializeResponsive method remains unchanged]

    /**
     * Update game state
     * @param {number} deltaTime - Time elapsed since last update
     */
    update(deltaTime) {
        // Handle touch input
        if (this.touchState.active) {
            const movement = this.getTouchMovementDelta();
            // Update game state based on touch movement
            // This will be integrated with the actual game mechanics
        }
        
        // Existing update logic will be implemented here
    }

    // ... [All other existing methods remain unchanged]

    /**
     * Clean up event listeners and resources
     */
    cleanup() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('orientationchange', this.handleResize);
        this.canvas.removeEventListener('touchstart', this.handleTouchStart);
        this.canvas.removeEventListener('touchmove', this.handleTouchMove);
        this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        this.canvas.removeEventListener('touchcancel', this.handleTouchEnd);
    }
}

// Export the Game class
export default Game;
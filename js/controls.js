/**
 * Touch Controls Handler
 * Manages touch input for mobile gameplay with support for:
 * - Movement via touch drag
 * - Shooting via tap
 * - Gesture recognition for special actions
 */

class TouchControls {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isDragging = false;
        this.minSwipeDistance = 30; // minimum distance for swipe detection
        this.touchTimeout = null;
        this.doubleTapDelay = 300; // milliseconds
        this.lastTapTime = 0;
        
        // Callback storage
        this.moveCallback = null;
        this.shootCallback = null;
        this.specialActionCallback = null;
        
        this.init();
    }

    /**
     * Initialize touch event listeners
     */
    init() {
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), false);
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), false);
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), false);
    }

    /**
     * Set callback for movement events
     * @param {Function} callback - Function to handle movement (x, y coordinates)
     */
    setMoveCallback(callback) {
        this.moveCallback = callback;
    }

    /**
     * Set callback for shoot events
     * @param {Function} callback - Function to handle shooting
     */
    setShootCallback(callback) {
        this.shootCallback = callback;
    }

    /**
     * Set callback for special actions
     * @param {Function} callback - Function to handle special actions
     */
    setSpecialActionCallback(callback) {
        this.specialActionCallback = callback;
    }

    /**
     * Handle touch start event
     * @param {TouchEvent} event - Touch event object
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.isDragging = true;

        // Double tap detection
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.lastTapTime;
        
        if (tapLength < this.doubleTapDelay && tapLength > 0) {
            if (this.specialActionCallback) {
                this.specialActionCallback();
            }
            this.lastTapTime = 0;
        } else {
            this.lastTapTime = currentTime;
        }
    }

    /**
     * Handle touch move event
     * @param {TouchEvent} event - Touch event object
     */
    handleTouchMove(event) {
        event.preventDefault();
        
        if (!this.isDragging) return;

        const touch = event.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;

        if (this.moveCallback) {
            this.moveCallback(deltaX, deltaY);
        }

        // Update reference point for smooth continuous movement
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }

    /**
     * Handle touch end event
     * @param {TouchEvent} event - Touch event object
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        if (!this.isDragging) return;
        
        this.isDragging = false;

        // Short tap detection for shooting
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance < this.minSwipeDistance && this.shootCallback) {
            this.shootCallback();
        }
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }
}

/**
 * Touch controls singleton instance
 */
const touchControls = new TouchControls();

// Export the touch controls instance
export default touchControls;
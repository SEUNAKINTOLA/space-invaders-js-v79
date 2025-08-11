/**
 * @file TouchInput.ts
 * @description Touch input handler for mobile devices. Manages touch events, gestures,
 * and touch-based controls for the game.
 */

// Types and interfaces
interface TouchPoint {
    identifier: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    timestamp: number;
}

interface GestureConfig {
    swipeThreshold: number;
    tapThreshold: number;
    doubleTapDelay: number;
    longPressDelay: number;
}

type TouchCallback = (x: number, y: number) => void;
type GestureCallback = (startX: number, startY: number, endX: number, endY: number) => void;

export class TouchInput {
    private static instance: TouchInput;
    private touchPoints: Map<number, TouchPoint>;
    private element: HTMLElement;
    private config: GestureConfig;

    // Event callbacks
    private onTapCallback?: TouchCallback;
    private onSwipeCallback?: GestureCallback;
    private onLongPressCallback?: TouchCallback;

    private constructor(element: HTMLElement) {
        this.element = element;
        this.touchPoints = new Map();
        
        // Default configuration
        this.config = {
            swipeThreshold: 30, // minimum distance for swipe
            tapThreshold: 10,   // maximum movement allowed for tap
            doubleTapDelay: 300, // milliseconds between taps
            longPressDelay: 500  // milliseconds for long press
        };

        this.initializeEventListeners();
    }

    /**
     * Get singleton instance of TouchInput
     */
    public static getInstance(element: HTMLElement): TouchInput {
        if (!TouchInput.instance) {
            TouchInput.instance = new TouchInput(element);
        }
        return TouchInput.instance;
    }

    /**
     * Initialize touch event listeners
     */
    private initializeEventListeners(): void {
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
    }

    /**
     * Handle touch start event
     */
    private handleTouchStart(event: TouchEvent): void {
        event.preventDefault();

        Array.from(event.changedTouches).forEach(touch => {
            this.touchPoints.set(touch.identifier, {
                identifier: touch.identifier,
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                timestamp: Date.now()
            });
        });
    }

    /**
     * Handle touch move event
     */
    private handleTouchMove(event: TouchEvent): void {
        event.preventDefault();

        Array.from(event.changedTouches).forEach(touch => {
            const touchPoint = this.touchPoints.get(touch.identifier);
            if (touchPoint) {
                touchPoint.currentX = touch.clientX;
                touchPoint.currentY = touch.clientY;
            }
        });
    }

    /**
     * Handle touch end event
     */
    private handleTouchEnd(event: TouchEvent): void {
        event.preventDefault();

        Array.from(event.changedTouches).forEach(touch => {
            const touchPoint = this.touchPoints.get(touch.identifier);
            if (touchPoint) {
                this.processTouch(touchPoint);
                this.touchPoints.delete(touch.identifier);
            }
        });
    }

    /**
     * Handle touch cancel event
     */
    private handleTouchCancel(event: TouchEvent): void {
        event.preventDefault();
        Array.from(event.changedTouches).forEach(touch => {
            this.touchPoints.delete(touch.identifier);
        });
    }

    /**
     * Process touch event and determine gesture
     */
    private processTouch(touchPoint: TouchPoint): void {
        const deltaX = touchPoint.currentX - touchPoint.startX;
        const deltaY = touchPoint.currentY - touchPoint.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const duration = Date.now() - touchPoint.timestamp;

        // Detect gesture type
        if (distance < this.config.tapThreshold) {
            if (duration >= this.config.longPressDelay) {
                this.onLongPressCallback?.(touchPoint.currentX, touchPoint.currentY);
            } else {
                this.onTapCallback?.(touchPoint.currentX, touchPoint.currentY);
            }
        } else if (distance >= this.config.swipeThreshold) {
            this.onSwipeCallback?.(
                touchPoint.startX,
                touchPoint.startY,
                touchPoint.currentX,
                touchPoint.currentY
            );
        }
    }

    /**
     * Register callback for tap events
     */
    public onTap(callback: TouchCallback): void {
        this.onTapCallback = callback;
    }

    /**
     * Register callback for swipe events
     */
    public onSwipe(callback: GestureCallback): void {
        this.onSwipeCallback = callback;
    }

    /**
     * Register callback for long press events
     */
    public onLongPress(callback: TouchCallback): void {
        this.onLongPressCallback = callback;
    }

    /**
     * Update gesture configuration
     */
    public updateConfig(config: Partial<GestureConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Clean up event listeners
     */
    public destroy(): void {
        this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        this.element.removeEventListener('touchcancel', this.handleTouchCancel.bind(this));
        this.touchPoints.clear();
    }
}

export default TouchInput;
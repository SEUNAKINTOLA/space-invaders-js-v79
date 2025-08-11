/**
 * @file input.ts
 * @description Core input handling system that manages keyboard and touch inputs.
 * Provides a unified interface for handling different input types and maintaining input state.
 */

// Types and interfaces
export interface InputState {
    isPressed: boolean;
    wasPressed: boolean;
    timePressed: number;
}

export interface TouchPoint {
    identifier: number;
    x: number;
    y: number;
}

export type InputKey = string | number;

/**
 * Manages all input handling for the game, supporting both keyboard and touch inputs
 */
export class InputManager {
    private static instance: InputManager;
    
    private keyStates: Map<InputKey, InputState>;
    private touchPoints: Map<number, TouchPoint>;
    private touchEnabled: boolean;
    
    private readonly longPressThreshold: number = 500; // ms
    
    private constructor() {
        this.keyStates = new Map();
        this.touchPoints = new Map();
        this.touchEnabled = this.isTouchDevice();
        
        this.initializeListeners();
    }
    
    /**
     * Gets the singleton instance of InputManager
     */
    public static getInstance(): InputManager {
        if (!InputManager.instance) {
            InputManager.instance = new InputManager();
        }
        return InputManager.instance;
    }
    
    /**
     * Initializes all event listeners for input handling
     */
    private initializeListeners(): void {
        // Keyboard events
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Touch events
        if (this.touchEnabled) {
            window.addEventListener('touchstart', this.handleTouchStart.bind(this));
            window.addEventListener('touchmove', this.handleTouchMove.bind(this));
            window.addEventListener('touchend', this.handleTouchEnd.bind(this));
        }
        
        // Prevent context menu on right click
        window.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    /**
     * Checks if a key or touch input is currently pressed
     */
    public isPressed(key: InputKey): boolean {
        const state = this.keyStates.get(key);
        return state ? state.isPressed : false;
    }
    
    /**
     * Checks if a key was just pressed this frame
     */
    public wasJustPressed(key: InputKey): boolean {
        const state = this.keyStates.get(key);
        return state ? (state.isPressed && !state.wasPressed) : false;
    }
    
    /**
     * Checks if a key or touch input is being held down
     */
    public isLongPress(key: InputKey): boolean {
        const state = this.keyStates.get(key);
        if (!state || !state.isPressed) return false;
        return (Date.now() - state.timePressed) >= this.longPressThreshold;
    }
    
    /**
     * Updates the input states for the current frame
     */
    public update(): void {
        this.keyStates.forEach((state, key) => {
            state.wasPressed = state.isPressed;
        });
    }
    
    /**
     * Handles keyboard down events
     */
    private handleKeyDown(event: KeyboardEvent): void {
        const key = event.key.toLowerCase();
        const currentTime = Date.now();
        
        if (!this.keyStates.has(key)) {
            this.keyStates.set(key, {
                isPressed: true,
                wasPressed: false,
                timePressed: currentTime
            });
        } else {
            const state = this.keyStates.get(key)!;
            if (!state.isPressed) {
                state.timePressed = currentTime;
            }
            state.isPressed = true;
        }
    }
    
    /**
     * Handles keyboard up events
     */
    private handleKeyUp(event: KeyboardEvent): void {
        const key = event.key.toLowerCase();
        if (this.keyStates.has(key)) {
            const state = this.keyStates.get(key)!;
            state.isPressed = false;
        }
    }
    
    /**
     * Handles touch start events
     */
    private handleTouchStart(event: TouchEvent): void {
        event.preventDefault();
        Array.from(event.changedTouches).forEach(touch => {
            this.touchPoints.set(touch.identifier, {
                identifier: touch.identifier,
                x: touch.clientX,
                y: touch.clientY
            });
            
            // Create a virtual key for this touch point
            const touchKey = `touch${touch.identifier}`;
            this.keyStates.set(touchKey, {
                isPressed: true,
                wasPressed: false,
                timePressed: Date.now()
            });
        });
    }
    
    /**
     * Handles touch move events
     */
    private handleTouchMove(event: TouchEvent): void {
        event.preventDefault();
        Array.from(event.changedTouches).forEach(touch => {
            if (this.touchPoints.has(touch.identifier)) {
                this.touchPoints.set(touch.identifier, {
                    identifier: touch.identifier,
                    x: touch.clientX,
                    y: touch.clientY
                });
            }
        });
    }
    
    /**
     * Handles touch end events
     */
    private handleTouchEnd(event: TouchEvent): void {
        event.preventDefault();
        Array.from(event.changedTouches).forEach(touch => {
            this.touchPoints.delete(touch.identifier);
            
            // Update virtual key state
            const touchKey = `touch${touch.identifier}`;
            if (this.keyStates.has(touchKey)) {
                const state = this.keyStates.get(touchKey)!;
                state.isPressed = false;
            }
        });
    }
    
    /**
     * Gets the current touch point positions
     */
    public getTouchPoints(): TouchPoint[] {
        return Array.from(this.touchPoints.values());
    }
    
    /**
     * Checks if the device supports touch input
     */
    private isTouchDevice(): boolean {
        return 'ontouchstart' in window || 
               navigator.maxTouchPoints > 0 ||
               (navigator as any).msMaxTouchPoints > 0;
    }
    
    /**
     * Cleans up all input states and listeners
     */
    public cleanup(): void {
        this.keyStates.clear();
        this.touchPoints.clear();
        
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
        
        if (this.touchEnabled) {
            window.removeEventListener('touchstart', this.handleTouchStart.bind(this));
            window.removeEventListener('touchmove', this.handleTouchMove.bind(this));
            window.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        }
    }
}

// Export a default instance
export default InputManager.getInstance();
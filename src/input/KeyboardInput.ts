/**
 * @file KeyboardInput.ts
 * @description Handles keyboard input detection and state management for game controls
 * 
 * Manages keyboard event listeners and maintains the current state of relevant
 * game control keys. Provides methods to query key states and handle input events.
 */

// Types for keyboard state tracking
type KeyState = {
    isPressed: boolean;
    wasPressed: boolean;
};

type KeyboardState = {
    [key: string]: KeyState;
};

/**
 * Manages keyboard input detection and state tracking
 */
export class KeyboardInput {
    private keyStates: KeyboardState = {};
    private enabled: boolean = true;

    // Define supported keys
    private static readonly SUPPORTED_KEYS = [
        'ArrowLeft',
        'ArrowRight',
        'Space',
        'KeyA',
        'KeyD',
        'KeyW',
        'KeyS'
    ];

    constructor() {
        // Initialize key states
        KeyboardInput.SUPPORTED_KEYS.forEach(key => {
            this.keyStates[key] = {
                isPressed: false,
                wasPressed: false
            };
        });

        // Bind event listeners
        this.bindEventListeners();
    }

    /**
     * Sets up keyboard event listeners
     * @private
     */
    private bindEventListeners(): void {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        window.addEventListener('blur', this.handleBlur.bind(this));
    }

    /**
     * Handles keydown events
     * @param event Keyboard event
     * @private
     */
    private handleKeyDown(event: KeyboardEvent): void {
        if (!this.enabled) return;

        // Prevent default behavior for game control keys
        if (KeyboardInput.SUPPORTED_KEYS.includes(event.code)) {
            event.preventDefault();
            
            if (this.keyStates[event.code]) {
                this.keyStates[event.code].isPressed = true;
            }
        }
    }

    /**
     * Handles keyup events
     * @param event Keyboard event
     * @private
     */
    private handleKeyUp(event: KeyboardEvent): void {
        if (this.keyStates[event.code]) {
            this.keyStates[event.code].isPressed = false;
        }
    }

    /**
     * Handles window blur events - resets all key states
     * @private
     */
    private handleBlur(): void {
        Object.keys(this.keyStates).forEach(key => {
            this.keyStates[key].isPressed = false;
            this.keyStates[key].wasPressed = false;
        });
    }

    /**
     * Updates the previous key states
     * Should be called at the end of each game loop iteration
     */
    public update(): void {
        Object.keys(this.keyStates).forEach(key => {
            this.keyStates[key].wasPressed = this.keyStates[key].isPressed;
        });
    }

    /**
     * Checks if a key is currently pressed
     * @param keyCode The key code to check
     * @returns boolean indicating if key is pressed
     */
    public isKeyPressed(keyCode: string): boolean {
        return this.keyStates[keyCode]?.isPressed || false;
    }

    /**
     * Checks if a key was just pressed this frame
     * @param keyCode The key code to check
     * @returns boolean indicating if key was just pressed
     */
    public isKeyJustPressed(keyCode: string): boolean {
        const state = this.keyStates[keyCode];
        return state ? (state.isPressed && !state.wasPressed) : false;
    }

    /**
     * Checks if a key was just released this frame
     * @param keyCode The key code to check
     * @returns boolean indicating if key was just released
     */
    public isKeyJustReleased(keyCode: string): boolean {
        const state = this.keyStates[keyCode];
        return state ? (!state.isPressed && state.wasPressed) : false;
    }

    /**
     * Enables keyboard input
     */
    public enable(): void {
        this.enabled = true;
    }

    /**
     * Disables keyboard input
     */
    public disable(): void {
        this.enabled = false;
        this.handleBlur(); // Reset all states when disabled
    }

    /**
     * Cleans up event listeners
     */
    public dispose(): void {
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
        window.removeEventListener('blur', this.handleBlur.bind(this));
    }
}

// Export a singleton instance
export const keyboardInput = new KeyboardInput();
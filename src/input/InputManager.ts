/**
 * @file InputManager.ts
 * @description Manages game input handling from multiple sources with focus on keyboard controls
 * Primary responsibility is tracking input state and providing a clean interface for input queries
 */

// Types for input handling
type InputState = {
    [key: string]: boolean;
};

type InputBinding = {
    key: string;
    action: string;
};

/**
 * @class InputManager
 * @description Handles input detection and state management for the game
 * Supports keyboard input with potential for extension to other input methods
 */
export class InputManager {
    private static instance: InputManager;
    private inputState: InputState;
    private bindings: Map<string, string>;
    private enabled: boolean;

    // Default key bindings
    private static readonly DEFAULT_BINDINGS: InputBinding[] = [
        { key: 'ArrowLeft', action: 'moveLeft' },
        { key: 'ArrowRight', action: 'moveRight' },
        { key: 'Space', action: 'fire' },
        { key: 'Escape', action: 'pause' }
    ];

    private constructor() {
        this.inputState = {};
        this.bindings = new Map();
        this.enabled = true;
        
        this.initializeBindings();
        this.setupEventListeners();
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
     * Initializes default key bindings
     */
    private initializeBindings(): void {
        InputManager.DEFAULT_BINDINGS.forEach(binding => {
            this.bindings.set(binding.key.toLowerCase(), binding.action);
        });
    }

    /**
     * Sets up keyboard event listeners
     */
    private setupEventListeners(): void {
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        window.addEventListener('blur', this.handleBlur.bind(this));
    }

    /**
     * Handles keydown events
     * @param event Keyboard event
     */
    private handleKeyDown(event: KeyboardEvent): void {
        if (!this.enabled) return;

        const key = event.code || event.key;
        if (this.bindings.has(key.toLowerCase())) {
            event.preventDefault();
            this.inputState[this.bindings.get(key.toLowerCase())!] = true;
        }
    }

    /**
     * Handles keyup events
     * @param event Keyboard event
     */
    private handleKeyUp(event: KeyboardEvent): void {
        const key = event.code || event.key;
        if (this.bindings.has(key.toLowerCase())) {
            event.preventDefault();
            this.inputState[this.bindings.get(key.toLowerCase())!] = false;
        }
    }

    /**
     * Handles window blur - resets all input states
     */
    private handleBlur(): void {
        this.resetState();
    }

    /**
     * Resets all input states to false
     */
    public resetState(): void {
        Object.keys(this.inputState).forEach(key => {
            this.inputState[key] = false;
        });
    }

    /**
     * Checks if an action is currently active
     * @param action The action to check
     * @returns boolean indicating if the action is active
     */
    public isActionActive(action: string): boolean {
        return !!this.inputState[action];
    }

    /**
     * Adds a new key binding
     * @param key The key to bind
     * @param action The action to bind to
     */
    public addBinding(key: string, action: string): void {
        this.bindings.set(key.toLowerCase(), action);
    }

    /**
     * Removes a key binding
     * @param key The key to unbind
     */
    public removeBinding(key: string): void {
        this.bindings.delete(key.toLowerCase());
    }

    /**
     * Enables input processing
     */
    public enable(): void {
        this.enabled = true;
    }

    /**
     * Disables input processing
     */
    public disable(): void {
        this.enabled = false;
        this.resetState();
    }

    /**
     * Cleans up event listeners
     */
    public cleanup(): void {
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
        window.removeEventListener('blur', this.handleBlur.bind(this));
    }
}

// Export a default instance
export default InputManager.getInstance();
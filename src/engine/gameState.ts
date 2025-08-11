/**
 * @file gameState.ts
 * @description Game state management system implementing a state machine pattern
 * for handling different game states and transitions.
 */

// Types and interfaces
export enum GameState {
    INIT = 'INIT',
    MENU = 'MENU',
    PLAYING = 'PLAYING',
    PAUSED = 'PAUSED',
    GAME_OVER = 'GAME_OVER',
    HIGH_SCORE = 'HIGH_SCORE'
}

export interface GameStateData {
    score: number;
    level: number;
    lives: number;
    difficulty: number;
    isPaused: boolean;
    timestamp: number;
}

interface StateTransition {
    from: GameState;
    to: GameState;
    condition: () => boolean;
}

/**
 * GameStateManager class handles the game state lifecycle and transitions
 */
export class GameStateManager {
    private currentState: GameState;
    private previousState: GameState;
    private stateData: GameStateData;
    private readonly transitions: StateTransition[];
    private stateChangeCallbacks: Map<GameState, Array<() => void>>;

    constructor() {
        this.currentState = GameState.INIT;
        this.previousState = GameState.INIT;
        this.stateChangeCallbacks = new Map();
        
        // Initialize default state data
        this.stateData = {
            score: 0,
            level: 1,
            lives: 3,
            difficulty: 1,
            isPaused: false,
            timestamp: Date.now()
        };

        // Define valid state transitions
        this.transitions = [
            { from: GameState.INIT, to: GameState.MENU, condition: () => true },
            { from: GameState.MENU, to: GameState.PLAYING, condition: () => true },
            { from: GameState.PLAYING, to: GameState.PAUSED, condition: () => true },
            { from: GameState.PAUSED, to: GameState.PLAYING, condition: () => true },
            { from: GameState.PLAYING, to: GameState.GAME_OVER, condition: () => this.stateData.lives <= 0 },
            { from: GameState.GAME_OVER, to: GameState.HIGH_SCORE, condition: () => true },
            { from: GameState.HIGH_SCORE, to: GameState.MENU, condition: () => true }
        ];
    }

    /**
     * Attempts to transition to a new state
     * @param newState - The state to transition to
     * @returns boolean indicating if transition was successful
     * @throws Error if invalid state transition is attempted
     */
    public transitionTo(newState: GameState): boolean {
        const validTransition = this.transitions.find(
            t => t.from === this.currentState && t.to === newState && t.condition()
        );

        if (!validTransition) {
            throw new Error(
                `Invalid state transition from ${this.currentState} to ${newState}`
            );
        }

        this.previousState = this.currentState;
        this.currentState = newState;
        this.stateData.timestamp = Date.now();

        // Execute callbacks for the new state
        this.executeStateCallbacks(newState);

        return true;
    }

    /**
     * Registers a callback to be executed when entering a specific state
     * @param state - The state to watch for
     * @param callback - Function to execute on state change
     */
    public onStateChange(state: GameState, callback: () => void): void {
        const callbacks = this.stateChangeCallbacks.get(state) || [];
        callbacks.push(callback);
        this.stateChangeCallbacks.set(state, callbacks);
    }

    /**
     * Updates game state data
     * @param updates - Partial state data to update
     */
    public updateStateData(updates: Partial<GameStateData>): void {
        this.stateData = {
            ...this.stateData,
            ...updates
        };
    }

    /**
     * Gets current game state
     */
    public getCurrentState(): GameState {
        return this.currentState;
    }

    /**
     * Gets previous game state
     */
    public getPreviousState(): GameState {
        return this.previousState;
    }

    /**
     * Gets current state data
     */
    public getStateData(): Readonly<GameStateData> {
        return { ...this.stateData };
    }

    /**
     * Resets game state to initial values
     */
    public reset(): void {
        this.stateData = {
            score: 0,
            level: 1,
            lives: 3,
            difficulty: 1,
            isPaused: false,
            timestamp: Date.now()
        };
        this.currentState = GameState.INIT;
        this.previousState = GameState.INIT;
    }

    /**
     * Executes registered callbacks for a given state
     * @param state - The state whose callbacks should be executed
     * @private
     */
    private executeStateCallbacks(state: GameState): void {
        const callbacks = this.stateChangeCallbacks.get(state);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback();
                } catch (error) {
                    console.error(`Error executing state callback: ${error}`);
                }
            });
        }
    }

    /**
     * Checks if a state transition is valid
     * @param from - Starting state
     * @param to - Target state
     * @private
     */
    private isValidTransition(from: GameState, to: GameState): boolean {
        return this.transitions.some(
            t => t.from === from && t.to === to && t.condition()
        );
    }
}

// Create and export singleton instance
export const gameStateManager = new GameStateManager();
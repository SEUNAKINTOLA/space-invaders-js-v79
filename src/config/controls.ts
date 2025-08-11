/**
 * @file controls.ts
 * @description Configuration file for game input controls including keyboard and touch mappings
 * 
 * Defines the control schemes and input mappings for the game, supporting both
 * keyboard and touch input methods. This configuration is used by the input
 * handling systems to interpret user actions.
 */

// Types for control configurations
export interface KeyboardMapping {
    action: string;
    key: string;
    altKey?: string;
}

export interface TouchZone {
    id: string;
    action: string;
    region: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface ControlConfig {
    keyboard: KeyboardMapping[];
    touch: TouchZone[];
}

/**
 * Supported game actions
 * These are the standardized actions that can be triggered by various inputs
 */
export const GameActions = {
    MOVE_LEFT: 'moveLeft',
    MOVE_RIGHT: 'moveRight',
    MOVE_UP: 'moveUp',
    MOVE_DOWN: 'moveDown',
    FIRE_PRIMARY: 'firePrimary',
    FIRE_SECONDARY: 'fireSecondary',
    PAUSE: 'pause',
    MENU: 'menu',
} as const;

export type GameAction = typeof GameActions[keyof typeof GameActions];

/**
 * Default keyboard control mappings
 * Maps keyboard keys to game actions
 */
export const DEFAULT_KEYBOARD_MAPPINGS: KeyboardMapping[] = [
    { action: GameActions.MOVE_LEFT, key: 'ArrowLeft', altKey: 'KeyA' },
    { action: GameActions.MOVE_RIGHT, key: 'ArrowRight', altKey: 'KeyD' },
    { action: GameActions.MOVE_UP, key: 'ArrowUp', altKey: 'KeyW' },
    { action: GameActions.MOVE_DOWN, key: 'ArrowDown', altKey: 'KeyS' },
    { action: GameActions.FIRE_PRIMARY, key: 'Space' },
    { action: GameActions.FIRE_SECONDARY, key: 'KeyE' },
    { action: GameActions.PAUSE, key: 'Escape' },
    { action: GameActions.MENU, key: 'Tab' }
];

/**
 * Default touch control zones
 * Defines regions on the screen for touch controls
 * Coordinates are in percentages of screen dimensions
 */
export const DEFAULT_TOUCH_ZONES: TouchZone[] = [
    {
        id: 'moveZone',
        action: 'move',
        region: {
            x: 0,
            y: 50,
            width: 50,
            height: 50
        }
    },
    {
        id: 'fireZone',
        action: GameActions.FIRE_PRIMARY,
        region: {
            x: 50,
            y: 50,
            width: 50,
            height: 50
        }
    },
    {
        id: 'pauseButton',
        action: GameActions.PAUSE,
        region: {
            x: 90,
            y: 0,
            width: 10,
            height: 10
        }
    }
];

/**
 * Control sensitivity settings
 */
export const CONTROL_SETTINGS = {
    keyboard: {
        repeatDelay: 150,  // ms before key repeat triggers
        movementSpeed: 1.0 // base movement speed multiplier
    },
    touch: {
        deadzone: 0.1,     // minimum touch movement to register
        sensitivity: 1.0,  // touch sensitivity multiplier
        tapThreshold: 200  // ms to register as a tap vs hold
    }
};

/**
 * Default control configuration combining keyboard and touch settings
 */
export const DEFAULT_CONTROL_CONFIG: ControlConfig = {
    keyboard: DEFAULT_KEYBOARD_MAPPINGS,
    touch: DEFAULT_TOUCH_ZONES
};

/**
 * Validates a control configuration
 * @param config The control configuration to validate
 * @returns boolean indicating if the configuration is valid
 */
export function validateControlConfig(config: ControlConfig): boolean {
    try {
        // Check keyboard mappings
        if (!Array.isArray(config.keyboard)) {
            return false;
        }

        for (const mapping of config.keyboard) {
            if (!mapping.action || !mapping.key) {
                return false;
            }
        }

        // Check touch zones
        if (!Array.isArray(config.touch)) {
            return false;
        }

        for (const zone of config.touch) {
            if (!zone.id || !zone.action || !zone.region) {
                return false;
            }
            
            const { x, y, width, height } = zone.region;
            if (typeof x !== 'number' || typeof y !== 'number' ||
                typeof width !== 'number' || typeof height !== 'number') {
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('Error validating control config:', error);
        return false;
    }
}

/**
 * Creates a custom control configuration
 * @param keyboard Custom keyboard mappings
 * @param touch Custom touch zones
 * @returns A validated control configuration
 */
export function createControlConfig(
    keyboard: KeyboardMapping[] = DEFAULT_KEYBOARD_MAPPINGS,
    touch: TouchZone[] = DEFAULT_TOUCH_ZONES
): ControlConfig {
    const config = { keyboard, touch };
    
    if (!validateControlConfig(config)) {
        throw new Error('Invalid control configuration');
    }
    
    return config;
}
/**
 * @file AnimationSystem.ts
 * @description Handles sprite animation management and playback for game entities.
 * Provides a flexible framework for defining, controlling and updating sprite animations.
 */

// Types and interfaces
interface AnimationFrame {
    x: number;
    y: number;
    width: number;
    height: number;
    duration: number;
}

interface AnimationConfig {
    frames: AnimationFrame[];
    loop: boolean;
    name: string;
}

interface AnimationState {
    currentFrame: number;
    elapsed: number;
    isPlaying: boolean;
    animation: AnimationConfig;
}

/**
 * Manages sprite animations for game entities
 */
export class AnimationSystem {
    private animations: Map<string, AnimationConfig>;
    private currentState: AnimationState | null;
    private onAnimationComplete?: () => void;

    constructor() {
        this.animations = new Map();
        this.currentState = null;
    }

    /**
     * Registers a new animation configuration
     * @param name - Unique identifier for the animation
     * @param config - Animation configuration data
     * @throws Error if animation with same name already exists
     */
    public registerAnimation(name: string, config: AnimationConfig): void {
        if (this.animations.has(name)) {
            throw new Error(`Animation '${name}' already registered`);
        }
        this.animations.set(name, {
            ...config,
            name
        });
    }

    /**
     * Starts playing an animation
     * @param name - Name of the animation to play
     * @param onComplete - Optional callback when animation completes
     * @throws Error if animation not found
     */
    public play(name: string, onComplete?: () => void): void {
        const animation = this.animations.get(name);
        if (!animation) {
            throw new Error(`Animation '${name}' not found`);
        }

        this.currentState = {
            currentFrame: 0,
            elapsed: 0,
            isPlaying: true,
            animation
        };

        this.onAnimationComplete = onComplete;
    }

    /**
     * Pauses the current animation
     */
    public pause(): void {
        if (this.currentState) {
            this.currentState.isPlaying = false;
        }
    }

    /**
     * Resumes the current animation
     */
    public resume(): void {
        if (this.currentState) {
            this.currentState.isPlaying = true;
        }
    }

    /**
     * Stops the current animation and resets to initial state
     */
    public stop(): void {
        this.currentState = null;
        this.onAnimationComplete = undefined;
    }

    /**
     * Updates the animation state based on elapsed time
     * @param deltaTime - Time elapsed since last update in milliseconds
     * @returns Current animation frame or null if no animation is playing
     */
    public update(deltaTime: number): AnimationFrame | null {
        if (!this.currentState || !this.currentState.isPlaying) {
            return null;
        }

        this.currentState.elapsed += deltaTime;
        const currentFrame = this.currentState.animation.frames[this.currentState.currentFrame];

        if (this.currentState.elapsed >= currentFrame.duration) {
            this.currentState.elapsed = 0;
            this.currentState.currentFrame++;

            if (this.currentState.currentFrame >= this.currentState.animation.frames.length) {
                if (this.currentState.animation.loop) {
                    this.currentState.currentFrame = 0;
                } else {
                    this.stop();
                    if (this.onAnimationComplete) {
                        this.onAnimationComplete();
                    }
                    return null;
                }
            }
        }

        return this.currentState.animation.frames[this.currentState.currentFrame];
    }

    /**
     * Gets the current animation frame without updating the state
     * @returns Current animation frame or null if no animation is playing
     */
    public getCurrentFrame(): AnimationFrame | null {
        if (!this.currentState) {
            return null;
        }
        return this.currentState.animation.frames[this.currentState.currentFrame];
    }

    /**
     * Checks if an animation is currently playing
     * @returns True if an animation is playing, false otherwise
     */
    public isPlaying(): boolean {
        return !!(this.currentState && this.currentState.isPlaying);
    }

    /**
     * Gets the name of the currently playing animation
     * @returns Name of current animation or null if none playing
     */
    public getCurrentAnimationName(): string | null {
        return this.currentState?.animation.name || null;
    }
}

/**
 * Helper function to create animation frames from a sprite sheet
 * @param frameWidth - Width of each frame
 * @param frameHeight - Height of each frame
 * @param startX - Starting X coordinate on sprite sheet
 * @param startY - Starting Y coordinate on sprite sheet
 * @param frameCount - Number of frames
 * @param frameDuration - Duration of each frame in milliseconds
 * @returns Array of animation frames
 */
export function createFramesFromSpriteSheet(
    frameWidth: number,
    frameHeight: number,
    startX: number,
    startY: number,
    frameCount: number,
    frameDuration: number
): AnimationFrame[] {
    const frames: AnimationFrame[] = [];
    
    for (let i = 0; i < frameCount; i++) {
        frames.push({
            x: startX + (i * frameWidth),
            y: startY,
            width: frameWidth,
            height: frameHeight,
            duration: frameDuration
        });
    }

    return frames;
}
/**
 * @file SpriteManager.ts
 * @description Manages sprite resources and animations for game entities.
 * Handles sprite loading, caching, and animation state management.
 */

// Types and interfaces
interface SpriteFrame {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface SpriteAnimation {
    frames: SpriteFrame[];
    frameRate: number;
    loop: boolean;
}

interface SpriteResource {
    image: HTMLImageElement;
    animations: Map<string, SpriteAnimation>;
    currentAnimation?: string;
    currentFrame: number;
    lastFrameTime: number;
}

/**
 * Manages sprite resources and animations for game entities
 */
export class SpriteManager {
    private static instance: SpriteManager;
    private sprites: Map<string, SpriteResource>;
    private loadingPromises: Map<string, Promise<HTMLImageElement>>;

    private constructor() {
        this.sprites = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * Gets the singleton instance of SpriteManager
     */
    public static getInstance(): SpriteManager {
        if (!SpriteManager.instance) {
            SpriteManager.instance = new SpriteManager();
        }
        return SpriteManager.instance;
    }

    /**
     * Loads a sprite from the given URL
     * @param id Unique identifier for the sprite
     * @param url URL of the sprite image
     * @throws Error if loading fails
     */
    public async loadSprite(id: string, url: string): Promise<void> {
        if (this.sprites.has(id)) {
            return;
        }

        try {
            if (!this.loadingPromises.has(id)) {
                const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = () => reject(new Error(`Failed to load sprite: ${url}`));
                    img.src = url;
                });
                this.loadingPromises.set(id, loadPromise);
            }

            const image = await this.loadingPromises.get(id);
            this.sprites.set(id, {
                image: image!,
                animations: new Map(),
                currentFrame: 0,
                lastFrameTime: 0
            });

            this.loadingPromises.delete(id);
        } catch (error) {
            throw new Error(`Error loading sprite ${id}: ${error.message}`);
        }
    }

    /**
     * Adds an animation to a sprite
     * @param spriteId Sprite identifier
     * @param animationId Animation identifier
     * @param frames Array of frame definitions
     * @param frameRate Frames per second
     * @param loop Whether the animation should loop
     */
    public addAnimation(
        spriteId: string,
        animationId: string,
        frames: SpriteFrame[],
        frameRate: number,
        loop: boolean = true
    ): void {
        const sprite = this.sprites.get(spriteId);
        if (!sprite) {
            throw new Error(`Sprite ${spriteId} not found`);
        }

        sprite.animations.set(animationId, {
            frames,
            frameRate,
            loop
        });
    }

    /**
     * Plays an animation for a specific sprite
     * @param spriteId Sprite identifier
     * @param animationId Animation identifier
     */
    public playAnimation(spriteId: string, animationId: string): void {
        const sprite = this.sprites.get(spriteId);
        if (!sprite) {
            throw new Error(`Sprite ${spriteId} not found`);
        }

        if (!sprite.animations.has(animationId)) {
            throw new Error(`Animation ${animationId} not found for sprite ${spriteId}`);
        }

        sprite.currentAnimation = animationId;
        sprite.currentFrame = 0;
        sprite.lastFrameTime = performance.now();
    }

    /**
     * Updates animation states
     * @param timestamp Current game timestamp
     */
    public update(timestamp: number): void {
        this.sprites.forEach((sprite, spriteId) => {
            if (!sprite.currentAnimation) return;

            const animation = sprite.animations.get(sprite.currentAnimation);
            if (!animation) return;

            const frameInterval = 1000 / animation.frameRate;
            const elapsed = timestamp - sprite.lastFrameTime;

            if (elapsed >= frameInterval) {
                sprite.currentFrame++;
                sprite.lastFrameTime = timestamp;

                if (sprite.currentFrame >= animation.frames.length) {
                    if (animation.loop) {
                        sprite.currentFrame = 0;
                    } else {
                        sprite.currentFrame = animation.frames.length - 1;
                        sprite.currentAnimation = undefined;
                    }
                }
            }
        });
    }

    /**
     * Gets the current frame for a sprite
     * @param spriteId Sprite identifier
     * @returns Current frame or undefined if no animation is playing
     */
    public getCurrentFrame(spriteId: string): SpriteFrame | undefined {
        const sprite = this.sprites.get(spriteId);
        if (!sprite || !sprite.currentAnimation) {
            return undefined;
        }

        const animation = sprite.animations.get(sprite.currentAnimation);
        if (!animation) {
            return undefined;
        }

        return animation.frames[sprite.currentFrame];
    }

    /**
     * Gets a sprite's image
     * @param spriteId Sprite identifier
     * @returns HTMLImageElement for the sprite
     */
    public getImage(spriteId: string): HTMLImageElement | undefined {
        return this.sprites.get(spriteId)?.image;
    }

    /**
     * Cleans up resources for a sprite
     * @param spriteId Sprite identifier
     */
    public removeSprite(spriteId: string): void {
        this.sprites.delete(spriteId);
        this.loadingPromises.delete(spriteId);
    }
}

export default SpriteManager;
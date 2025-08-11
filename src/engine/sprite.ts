/**
 * @file sprite.ts
 * @description Sprite rendering system for game entities
 * Contains core sprite functionality including loading, managing, and rendering sprites
 */

// Types and interfaces
interface SpriteConfig {
    width: number;
    height: number;
    sourceX?: number;
    sourceY?: number;
    sourceWidth?: number;
    sourceHeight?: number;
    rotation?: number;
    scale?: number;
    alpha?: number;
}

interface SpriteSheet {
    image: HTMLImageElement;
    frameWidth: number;
    frameHeight: number;
    frames: number;
}

/**
 * Represents a game sprite with rendering capabilities
 */
export class Sprite {
    private image: HTMLImageElement;
    private width: number;
    private height: number;
    private sourceX: number;
    private sourceY: number;
    private sourceWidth: number;
    private sourceHeight: number;
    private rotation: number;
    private scale: number;
    private alpha: number;
    private isLoaded: boolean;
    private errorState: boolean;

    /**
     * Creates a new Sprite instance
     * @param imagePath - Path to the sprite image
     * @param config - Sprite configuration options
     */
    constructor(imagePath: string, config: SpriteConfig) {
        this.width = config.width;
        this.height = config.height;
        this.sourceX = config.sourceX || 0;
        this.sourceY = config.sourceY || 0;
        this.sourceWidth = config.sourceWidth || config.width;
        this.sourceHeight = config.sourceHeight || config.height;
        this.rotation = config.rotation || 0;
        this.scale = config.scale || 1;
        this.alpha = config.alpha || 1;
        this.isLoaded = false;
        this.errorState = false;

        this.image = new Image();
        this.image.onload = () => {
            this.isLoaded = true;
        };
        this.image.onerror = (error) => {
            this.errorState = true;
            console.error(`Failed to load sprite image: ${imagePath}`, error);
        };
        this.image.src = imagePath;
    }

    /**
     * Renders the sprite to the specified canvas context
     * @param ctx - The canvas rendering context
     * @param x - X coordinate to render at
     * @param y - Y coordinate to render at
     * @returns boolean indicating if render was successful
     */
    public render(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        if (!this.isLoaded || this.errorState) {
            return false;
        }

        try {
            ctx.save();

            // Apply transformations
            ctx.translate(x + this.width / 2, y + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.scale(this.scale, this.scale);
            ctx.globalAlpha = this.alpha;

            // Draw the sprite
            ctx.drawImage(
                this.image,
                this.sourceX,
                this.sourceY,
                this.sourceWidth,
                this.sourceHeight,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );

            ctx.restore();
            return true;
        } catch (error) {
            console.error('Error rendering sprite:', error);
            return false;
        }
    }

    /**
     * Updates sprite properties
     * @param config - New sprite configuration
     */
    public updateConfig(config: Partial<SpriteConfig>): void {
        Object.assign(this, {
            width: config.width ?? this.width,
            height: config.height ?? this.height,
            sourceX: config.sourceX ?? this.sourceX,
            sourceY: config.sourceY ?? this.sourceY,
            sourceWidth: config.sourceWidth ?? this.sourceWidth,
            sourceHeight: config.sourceHeight ?? this.sourceHeight,
            rotation: config.rotation ?? this.rotation,
            scale: config.scale ?? this.scale,
            alpha: config.alpha ?? this.alpha
        });
    }

    /**
     * Checks if the sprite image is loaded and ready
     * @returns boolean indicating if sprite is ready to render
     */
    public isReady(): boolean {
        return this.isLoaded && !this.errorState;
    }

    /**
     * Gets the current dimensions of the sprite
     * @returns Object containing width and height
     */
    public getDimensions(): { width: number; height: number } {
        return {
            width: this.width * this.scale,
            height: this.height * this.scale
        };
    }
}

/**
 * Manages sprite sheets for animated sprites
 */
export class SpriteSheet {
    private sheet: SpriteSheet;
    private currentFrame: number = 0;

    /**
     * Creates a new SpriteSheet instance
     * @param imagePath - Path to the sprite sheet image
     * @param frameWidth - Width of each frame
     * @param frameHeight - Height of each frame
     * @param frames - Total number of frames
     */
    constructor(imagePath: string, frameWidth: number, frameHeight: number, frames: number) {
        const image = new Image();
        this.sheet = {
            image,
            frameWidth,
            frameHeight,
            frames
        };

        image.src = imagePath;
    }

    /**
     * Gets the source rectangle for the current frame
     * @returns Object with source coordinates and dimensions
     */
    public getCurrentFrame(): { x: number; y: number; width: number; height: number } {
        const framesPerRow = Math.floor(this.sheet.image.width / this.sheet.frameWidth);
        const row = Math.floor(this.currentFrame / framesPerRow);
        const col = this.currentFrame % framesPerRow;

        return {
            x: col * this.sheet.frameWidth,
            y: row * this.sheet.frameHeight,
            width: this.sheet.frameWidth,
            height: this.sheet.frameHeight
        };
    }

    /**
     * Advances to the next frame in the sprite sheet
     */
    public nextFrame(): void {
        this.currentFrame = (this.currentFrame + 1) % this.sheet.frames;
    }

    /**
     * Sets the current frame
     * @param frame - Frame number to set
     */
    public setFrame(frame: number): void {
        if (frame >= 0 && frame < this.sheet.frames) {
            this.currentFrame = frame;
        }
    }
}
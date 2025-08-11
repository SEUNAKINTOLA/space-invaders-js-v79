/**
 * @file canvas.ts
 * @description Canvas management module for handling HTML5 Canvas initialization,
 * resizing, and context configuration. Provides a singleton interface for canvas operations.
 */

// Types for canvas configuration
interface CanvasConfig {
    width: number;
    height: number;
    contextType: '2d';
    pixelRatio?: number;
    smoothing?: boolean;
}

/**
 * Canvas manager class handling canvas initialization and management
 * Implements singleton pattern for global canvas access
 */
export class Canvas {
    private static instance: Canvas;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private pixelRatio: number;
    private config: CanvasConfig;

    private constructor() {
        this.pixelRatio = window.devicePixelRatio || 1;
        this.config = {
            width: 800,
            height: 600,
            contextType: '2d',
            pixelRatio: this.pixelRatio,
            smoothing: false
        };
    }

    /**
     * Get the singleton instance of Canvas manager
     */
    public static getInstance(): Canvas {
        if (!Canvas.instance) {
            Canvas.instance = new Canvas();
        }
        return Canvas.instance;
    }

    /**
     * Initialize canvas with specified configuration
     * @param config Canvas configuration options
     * @throws Error if canvas creation fails
     */
    public initialize(config?: Partial<CanvasConfig>): void {
        try {
            // Merge provided config with defaults
            this.config = { ...this.config, ...config };

            // Create canvas element
            this.canvas = document.createElement('canvas');
            
            // Get rendering context
            const context = this.canvas.getContext(this.config.contextType);
            if (!context) {
                throw new Error('Failed to get canvas context');
            }
            this.ctx = context;

            // Configure canvas
            this.configureCanvas();

            // Add to DOM
            document.body.appendChild(this.canvas);

            // Set up resize handler
            this.setupResizeHandler();
        } catch (error) {
            throw new Error(`Canvas initialization failed: ${error.message}`);
        }
    }

    /**
     * Configure canvas properties and context
     */
    private configureCanvas(): void {
        if (!this.canvas || !this.ctx) return;

        // Set physical size
        this.canvas.width = this.config.width * this.pixelRatio;
        this.canvas.height = this.config.height * this.pixelRatio;

        // Set display size
        this.canvas.style.width = `${this.config.width}px`;
        this.canvas.style.height = `${this.config.height}px`;

        // Configure context
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        this.ctx.imageSmoothingEnabled = !!this.config.smoothing;
    }

    /**
     * Set up window resize handler
     */
    private setupResizeHandler(): void {
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * Handle window resize events
     */
    private handleResize(): void {
        if (!this.canvas) return;

        // Update pixel ratio in case of display change
        this.pixelRatio = window.devicePixelRatio || 1;

        // Reconfigure canvas
        this.configureCanvas();
    }

    /**
     * Get the canvas element
     * @returns HTMLCanvasElement or null if not initialized
     */
    public getCanvas(): HTMLCanvasElement | null {
        return this.canvas;
    }

    /**
     * Get the rendering context
     * @returns CanvasRenderingContext2D or null if not initialized
     */
    public getContext(): CanvasRenderingContext2D | null {
        return this.ctx;
    }

    /**
     * Clear the entire canvas
     */
    public clear(): void {
        if (!this.canvas || !this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Get current canvas dimensions
     * @returns Object containing width and height
     */
    public getDimensions(): { width: number; height: number } {
        return {
            width: this.config.width,
            height: this.config.height
        };
    }

    /**
     * Clean up canvas resources
     */
    public destroy(): void {
        if (this.canvas) {
            window.removeEventListener('resize', this.handleResize.bind(this));
            this.canvas.remove();
            this.canvas = null;
            this.ctx = null;
        }
    }
}

// Export default instance
export default Canvas.getInstance();
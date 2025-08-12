/**
 * Game Renderer - Optimized for performance
 * Handles efficient rendering of game objects using canvas
 */

class Renderer {
    constructor(canvas) {
        if (!canvas) {
            throw new Error('Canvas element is required');
        }
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for better performance
        this.lastRenderTime = 0;
        this.frameCount = 0;
        this.fpsTime = 0;
        this.fps = 0;
        
        // Pre-compute frequently used values
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Double buffering setup
        this.backBuffer = document.createElement('canvas');
        this.backBuffer.width = this.width;
        this.backBuffer.height = this.height;
        this.backCtx = this.backBuffer.getContext('2d', { alpha: false });
        
        // Rendering optimization flags
        this.shouldRender = true;
        this.dirtyRegions = new Set();
        
        // Performance optimizations
        this.initializeOptimizations();
    }

    /**
     * Initialize performance optimizations
     */
    initializeOptimizations() {
        // Enable image smoothing only if needed
        this.ctx.imageSmoothingEnabled = false;
        this.backCtx.imageSmoothingEnabled = false;

        // Pre-compile common operations
        this.clearScreen = () => {
            this.backCtx.fillStyle = '#000000';
            this.backCtx.fillRect(0, 0, this.width, this.height);
        };

        // Batch rendering queue
        this.renderQueue = [];
    }

    /**
     * Add an object to the render queue
     * @param {Object} object - The game object to render
     */
    queueForRendering(object) {
        if (!object || !object.visible) return;
        this.renderQueue.push(object);
    }

    /**
     * Clear the render queue
     */
    clearQueue() {
        this.renderQueue.length = 0;
    }

    /**
     * Optimize sprite rendering by batching similar operations
     * @param {Array} sprites - Array of sprite objects to render
     */
    batchRenderSprites(sprites) {
        // Group sprites by image source for batch rendering
        const batchMap = new Map();
        
        sprites.forEach(sprite => {
            if (!sprite.image) return;
            const key = sprite.image.src;
            if (!batchMap.has(key)) {
                batchMap.set(key, []);
            }
            batchMap.get(key).push(sprite);
        });

        // Render each batch
        batchMap.forEach((batchSprites, _) => {
            batchSprites.forEach(sprite => {
                this.backCtx.save();
                this.backCtx.translate(sprite.x, sprite.y);
                this.backCtx.rotate(sprite.rotation || 0);
                this.backCtx.drawImage(
                    sprite.image,
                    -sprite.width / 2,
                    -sprite.height / 2,
                    sprite.width,
                    sprite.height
                );
                this.backCtx.restore();
            });
        });
    }

    /**
     * Main render function - optimized for performance
     * @param {number} timestamp - Current timestamp
     */
    render(timestamp) {
        // Calculate FPS
        const deltaTime = timestamp - this.lastRenderTime;
        this.frameCount++;
        this.fpsTime += deltaTime;
        
        if (this.fpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTime = 0;
        }

        // Clear back buffer
        this.clearScreen();

        // Batch render all queued objects
        if (this.renderQueue.length > 0) {
            this.batchRenderSprites(this.renderQueue);
        }

        // Swap buffers
        this.ctx.drawImage(this.backBuffer, 0, 0);
        
        // Clear queue for next frame
        this.clearQueue();
        
        this.lastRenderTime = timestamp;
    }

    /**
     * Mark a region as needing re-render
     * @param {Object} region - {x, y, width, height}
     */
    markDirty(region) {
        this.dirtyRegions.add(region);
    }

    /**
     * Resize canvas and buffers
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.backBuffer.width = width;
        this.backBuffer.height = height;
        
        // Reinitialize context properties after resize
        this.initializeOptimizations();
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.clearQueue();
        this.dirtyRegions.clear();
        this.backBuffer = null;
        this.backCtx = null;
    }
}

// Export the renderer
export default Renderer;
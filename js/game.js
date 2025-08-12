/**
 * game.js
 * Handles core game initialization, responsive layout management, and performance optimization
 */

class ObjectPool {
    /**
     * Generic object pool for reusing game objects
     * @param {Function} createFn - Factory function to create new objects
     * @param {Function} resetFn - Function to reset object state
     * @param {number} initialSize - Initial pool size
     */
    constructor(createFn, resetFn, initialSize = 50) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.pool = Array(initialSize).fill(null).map(() => createFn());
        this.active = new Set();
    }

    acquire() {
        let object = this.pool.pop();
        if (!object) {
            object = this.createFn();
        }
        this.active.add(object);
        return object;
    }

    release(object) {
        if (this.active.delete(object)) {
            this.resetFn(object);
            this.pool.push(object);
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimize for non-transparent canvas
        this.isRunning = false;
        this.lastTime = 0;
        this.frameCount = 0;
        this.fpsTime = 0;
        this.fps = 0;
        
        // Initial dimensions
        this.baseWidth = 800;
        this.baseHeight = 600;
        this.scale = 1;
        
        // Performance optimization
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        this.accumulator = 0;
        
        // Object pools
        this.initializePools();
        
        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        
        // Initialize responsive handling
        this.initializeResponsive();
        
        // Performance monitoring
        this.enablePerformanceMonitoring();
    }

    /**
     * Initialize object pools for frequently created/destroyed objects
     */
    initializePools() {
        // Example pool for projectiles
        this.projectilePool = new ObjectPool(
            () => ({ x: 0, y: 0, active: false }), // create
            (obj) => { obj.active = false; }        // reset
        );
        
        // Add more pools as needed
    }

    /**
     * Enable performance monitoring
     */
    enablePerformanceMonitoring() {
        this.performanceStats = {
            frameTime: [],
            updateTime: [],
            renderTime: []
        };
    }

    initializeResponsive() {
        this.handleResize();
        window.addEventListener('resize', this.debounce(this.handleResize, 250));
        window.addEventListener('orientationchange', this.debounce(this.handleResize, 250));
    }

    /**
     * Debounce helper for resize events
     */
    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    handleResize() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const scaleX = viewportWidth / this.baseWidth;
        const scaleY = viewportHeight / this.baseHeight;
        this.scale = Math.min(scaleX, scaleY);

        const scaledWidth = Math.floor(this.baseWidth * this.scale);
        const scaledHeight = Math.floor(this.baseHeight * this.scale);

        this.canvas.width = scaledWidth;
        this.canvas.height = scaledHeight;
        this.canvas.style.width = `${scaledWidth}px`;
        this.canvas.style.height = `${scaledHeight}px`;

        this.canvas.style.position = 'absolute';
        this.canvas.style.left = `${(viewportWidth - scaledWidth) / 2}px`;
        this.canvas.style.top = `${(viewportHeight - scaledHeight) / 2}px`;

        // Cache the transform to avoid recalculating each frame
        this.baseTransform = this.ctx.getTransform();
        this.ctx.scale(this.scale, this.scale);
    }

    init() {
        try {
            this.isRunning = true;
            this.lastTime = performance.now();
            this.gameLoop();
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.handleError(error);
        }
    }

    /**
     * Optimized game loop using fixed time step
     */
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;

        try {
            const frameStart = performance.now();
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            // Accumulate time since last frame
            this.accumulator += deltaTime;
            
            // Update in fixed time steps
            while (this.accumulator >= this.frameInterval) {
                const updateStart = performance.now();
                this.update(this.frameInterval);
                this.performanceStats.updateTime.push(performance.now() - updateStart);
                
                this.accumulator -= this.frameInterval;
            }

            const renderStart = performance.now();
            this.render();
            this.performanceStats.renderTime.push(performance.now() - renderStart);

            // Calculate FPS
            this.frameCount++;
            this.fpsTime += deltaTime;
            if (this.fpsTime >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.fpsTime -= 1000;
                this.updatePerformanceStats();
            }

            this.performanceStats.frameTime.push(performance.now() - frameStart);

            requestAnimationFrame((time) => this.gameLoop(time));
        } catch (error) {
            console.error('Game loop error:', error);
            this.handleError(error);
        }
    }

    /**
     * Update performance statistics
     */
    updatePerformanceStats() {
        const getAverage = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
        
        console.debug('Performance Stats:', {
            fps: this.fps,
            frameTime: getAverage(this.performanceStats.frameTime).toFixed(2) + 'ms',
            updateTime: getAverage(this.performanceStats.updateTime).toFixed(2) + 'ms',
            renderTime: getAverage(this.performanceStats.renderTime).toFixed(2) + 'ms'
        });

        // Reset stats
        this.performanceStats.frameTime = [];
        this.performanceStats.updateTime = [];
        this.performanceStats.renderTime = [];
    }

    update(deltaTime) {
        // Game update logic will be implemented here
    }

    render() {
        // Use cached transform
        this.ctx.setTransform(this.baseTransform);
        
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.baseWidth, this.baseHeight);
        
        // Game rendering logic will be implemented here
    }

    handleError(error) {
        this.isRunning = false;
        console.error('Game error:', error);
    }

    getScale() {
        return this.scale;
    }

    screenToGameCoordinates(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (screenX - rect.left) / this.scale,
            y: (screenY - rect.top) / this.scale
        };
    }
}

export default Game;
/**
 * Browser Compatibility Test Suite
 * Tests game compatibility across different browsers and devices
 * 
 * @module tests/browser-compatibility
 * @version 1.0.0
 */

// Test configuration
const REQUIRED_FEATURES = {
    canvas: 'HTMLCanvasElement',
    webgl: 'WebGLRenderingContext',
    requestAnimationFrame: 'requestAnimationFrame',
    localStorage: 'localStorage',
    audioContext: 'AudioContext',
    touchEvents: 'TouchEvent'
};

const MINIMUM_REQUIREMENTS = {
    width: 320,
    height: 480,
    fps: 30
};

class BrowserCompatibilityTester {
    constructor() {
        this.results = {
            features: {},
            performance: {},
            display: {},
            errors: []
        };
    }

    /**
     * Run all compatibility tests
     * @returns {Object} Test results
     */
    async runTests() {
        try {
            this.checkFeatureSupport();
            await this.checkPerformance();
            this.checkDisplayCapabilities();
            return this.generateReport();
        } catch (error) {
            console.error('Error running compatibility tests:', error);
            this.results.errors.push(error.message);
            return this.results;
        }
    }

    /**
     * Check browser support for required features
     */
    checkFeatureSupport() {
        for (const [feature, className] of Object.entries(REQUIRED_FEATURES)) {
            try {
                switch (feature) {
                    case 'canvas':
                        this.results.features[feature] = !!window.HTMLCanvasElement;
                        break;
                    case 'webgl':
                        const canvas = document.createElement('canvas');
                        this.results.features[feature] = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                        break;
                    case 'requestAnimationFrame':
                        this.results.features[feature] = !!window.requestAnimationFrame;
                        break;
                    case 'localStorage':
                        this.results.features[feature] = !!window.localStorage;
                        break;
                    case 'audioContext':
                        this.results.features[feature] = !!(window.AudioContext || window.webkitAudioContext);
                        break;
                    case 'touchEvents':
                        this.results.features[feature] = 'ontouchstart' in window;
                        break;
                    default:
                        this.results.features[feature] = false;
                }
            } catch (error) {
                this.results.features[feature] = false;
                this.results.errors.push(`Feature test failed for ${feature}: ${error.message}`);
            }
        }
    }

    /**
     * Check performance capabilities
     * @returns {Promise} Performance test results
     */
    async checkPerformance() {
        return new Promise((resolve) => {
            let frameCount = 0;
            let startTime = performance.now();
            
            const measureFrameRate = () => {
                frameCount++;
                if (performance.now() - startTime >= 1000) {
                    const fps = frameCount;
                    this.results.performance.fps = fps;
                    this.results.performance.meetsMinimumFps = fps >= MINIMUM_REQUIREMENTS.fps;
                    resolve();
                } else {
                    requestAnimationFrame(measureFrameRate);
                }
            };

            requestAnimationFrame(measureFrameRate);
        });
    }

    /**
     * Check display capabilities
     */
    checkDisplayCapabilities() {
        this.results.display = {
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1,
            meetsMinimumSize: window.innerWidth >= MINIMUM_REQUIREMENTS.width && 
                             window.innerHeight >= MINIMUM_REQUIREMENTS.height
        };
    }

    /**
     * Generate compatibility report
     * @returns {Object} Formatted test results
     */
    generateReport() {
        const compatible = this.isCompatible();
        return {
            compatible,
            summary: this.generateSummary(),
            details: this.results,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Check if browser meets all compatibility requirements
     * @returns {boolean} Overall compatibility status
     */
    isCompatible() {
        const hasRequiredFeatures = Object.values(this.results.features).every(Boolean);
        const hasRequiredPerformance = this.results.performance.meetsMinimumFps;
        const hasRequiredDisplay = this.results.display.meetsMinimumSize;
        return hasRequiredFeatures && hasRequiredPerformance && hasRequiredDisplay;
    }

    /**
     * Generate human-readable summary
     * @returns {string} Compatibility summary
     */
    generateSummary() {
        const issues = [];
        
        for (const [feature, supported] of Object.entries(this.results.features)) {
            if (!supported) {
                issues.push(`Missing required feature: ${feature}`);
            }
        }

        if (!this.results.performance.meetsMinimumFps) {
            issues.push(`Low frame rate: ${this.results.performance.fps} FPS (minimum: ${MINIMUM_REQUIREMENTS.fps})`);
        }

        if (!this.results.display.meetsMinimumSize) {
            issues.push(`Screen size too small: ${this.results.display.screenWidth}x${this.results.display.screenHeight}`);
        }

        return issues.length ? issues.join('\n') : 'All compatibility checks passed';
    }
}

/**
 * Run compatibility tests and log results
 */
async function runCompatibilityTests() {
    const tester = new BrowserCompatibilityTester();
    const results = await tester.runTests();
    
    console.log('Browser Compatibility Test Results:', results);
    
    if (!results.compatible) {
        console.warn('Browser compatibility issues detected:', results.summary);
    }
    
    return results;
}

// Export for use in other modules
export { BrowserCompatibilityTester, runCompatibilityTests };

// Auto-run tests if in browser environment
if (typeof window !== 'undefined') {
    window.addEventListener('load', runCompatibilityTests);
}
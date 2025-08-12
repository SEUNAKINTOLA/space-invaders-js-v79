/**
 * @fileoverview Browser polyfills and compatibility checks for the game engine
 * Ensures consistent behavior across different browsers and devices
 * 
 * @module polyfills
 * @version 1.0.0
 */

/**
 * Initialize all required polyfills and compatibility checks
 * @returns {Object} Object containing compatibility status and warnings
 */
export function initPolyfills() {
    const compatStatus = {
        success: true,
        warnings: [],
        unsupported: []
    };

    try {
        // RequestAnimationFrame polyfill
        initRequestAnimationFrame();
        
        // Performance.now polyfill
        initPerformanceNow();
        
        // Array polyfills
        initArrayPolyfills();
        
        // Canvas related polyfills
        initCanvasPolyfills();
        
        // Audio API polyfills
        initAudioPolyfills();
        
        // Touch events support check
        checkTouchSupport(compatStatus);
        
        // WebGL support check
        checkWebGLSupport(compatStatus);

    } catch (error) {
        console.error('Error initializing polyfills:', error);
        compatStatus.success = false;
        compatStatus.warnings.push(error.message);
    }

    return compatStatus;
}

/**
 * RequestAnimationFrame polyfill
 * @private
 */
function initRequestAnimationFrame() {
    let lastTime = 0;
    const vendors = ['ms', 'moz', 'webkit', 'o'];

    for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || 
                                    window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            const currTime = new Date().getTime();
            const timeToCall = Math.max(0, 16 - (currTime - lastTime));
            const id = window.setTimeout(function() { 
                callback(currTime + timeToCall); 
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}

/**
 * Performance.now polyfill
 * @private
 */
function initPerformanceNow() {
    if (!window.performance) {
        window.performance = {};
    }
    
    if (!window.performance.now) {
        const nowOffset = Date.now();
        window.performance.now = function now() {
            return Date.now() - nowOffset;
        };
    }
}

/**
 * Array method polyfills
 * @private
 */
function initArrayPolyfills() {
    // Array.from polyfill
    if (!Array.from) {
        Array.from = function(arrayLike) {
            return Array.prototype.slice.call(arrayLike);
        };
    }

    // Array.includes polyfill
    if (!Array.prototype.includes) {
        Array.prototype.includes = function(searchElement, fromIndex) {
            return this.indexOf(searchElement, fromIndex) !== -1;
        };
    }
}

/**
 * Canvas-related polyfills and checks
 * @private
 */
function initCanvasPolyfills() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx.setLineDash) {
        ctx.setLineDash = function() {};
    }
}

/**
 * Audio API polyfills and checks
 * @private
 */
function initAudioPolyfills() {
    window.AudioContext = window.AudioContext || 
                         window.webkitAudioContext || 
                         window.mozAudioContext || 
                         window.msAudioContext;
}

/**
 * Check touch support and add to compatibility status
 * @private
 * @param {Object} compatStatus - Compatibility status object
 */
function checkTouchSupport(compatStatus) {
    const touchSupported = ('ontouchstart' in window) || 
                          (navigator.maxTouchPoints > 0) || 
                          (navigator.msMaxTouchPoints > 0);

    if (!touchSupported) {
        compatStatus.warnings.push('Touch events not supported');
    }
}

/**
 * Check WebGL support and add to compatibility status
 * @private
 * @param {Object} compatStatus - Compatibility status object
 */
function checkWebGLSupport(compatStatus) {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || 
               canvas.getContext('experimental-webgl');

    if (!gl) {
        compatStatus.warnings.push('WebGL not supported');
    }
}

/**
 * Check if the browser supports all required features
 * @returns {boolean} True if all required features are supported
 */
export function checkBrowserSupport() {
    const requiredFeatures = [
        !!window.requestAnimationFrame,
        !!window.performance,
        !!window.AudioContext,
        typeof canvas !== 'undefined'
    ];

    return requiredFeatures.every(feature => feature === true);
}

/**
 * Get browser and device information
 * @returns {Object} Browser and device information
 */
export function getBrowserInfo() {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        vendor: navigator.vendor,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        online: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency || 1,
        maxTouchPoints: navigator.maxTouchPoints || 0
    };
}
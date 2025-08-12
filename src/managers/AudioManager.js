/**
 * @fileoverview Audio Manager Module
 * Handles loading, caching, and playing sound effects and background music
 * with proper resource management and error handling.
 * 
 * @module managers/AudioManager
 */

/**
 * Supported audio formats and their MIME types
 * @const {Object}
 */
const AUDIO_FORMATS = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg'
};

/**
 * Default audio settings
 * @const {Object}
 */
const DEFAULT_SETTINGS = {
    masterVolume: 0.7,
    sfxVolume: 1.0,
    musicVolume: 0.5,
    maxConcurrentSounds: 8
};

/**
 * Manages all audio operations in the game
 */
class AudioManager {
    constructor() {
        if (AudioManager.instance) {
            return AudioManager.instance;
        }
        AudioManager.instance = this;

        this.initialized = false;
        this.audioContext = null;
        this.soundCache = new Map();
        this.activeSounds = new Set();
        this.settings = { ...DEFAULT_SETTINGS };
        
        this.init();
    }

    /**
     * Initialize the audio system
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // Check for Web Audio API support
            if (typeof AudioContext !== 'undefined') {
                this.audioContext = new AudioContext();
            } else if (typeof webkitAudioContext !== 'undefined') {
                this.audioContext = new webkitAudioContext();
            } else {
                throw new Error('Web Audio API not supported');
            }

            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.settings.masterVolume;

            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize AudioManager:', error);
            this.initialized = false;
        }
    }

    /**
     * Load an audio file and cache it
     * @param {string} id - Unique identifier for the sound
     * @param {string} url - URL of the audio file
     * @returns {Promise<AudioBuffer>}
     */
    async loadSound(id, url) {
        if (!this.initialized) {
            throw new Error('AudioManager not initialized');
        }

        try {
            if (this.soundCache.has(id)) {
                return this.soundCache.get(id);
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.soundCache.set(id, audioBuffer);
            return audioBuffer;
        } catch (error) {
            console.error(`Failed to load sound ${id}:`, error);
            throw error;
        }
    }

    /**
     * Play a sound effect
     * @param {string} id - Sound identifier
     * @param {Object} options - Playback options
     * @returns {Promise<void>}
     */
    async playSound(id, options = {}) {
        if (!this.initialized || !this.soundCache.has(id)) {
            return;
        }

        try {
            // Limit concurrent sounds
            if (this.activeSounds.size >= this.settings.maxConcurrentSounds) {
                return;
            }

            const buffer = this.soundCache.get(id);
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = buffer;
            source.connect(gainNode);
            gainNode.connect(this.masterGain);

            // Apply options
            gainNode.gain.value = (options.volume || 1) * this.settings.sfxVolume;
            source.loop = options.loop || false;
            
            // Track active sounds
            this.activeSounds.add(source);

            // Cleanup when sound ends
            source.onended = () => {
                this.activeSounds.delete(source);
                source.disconnect();
                gainNode.disconnect();
            };

            source.start(0);
        } catch (error) {
            console.error(`Failed to play sound ${id}:`, error);
        }
    }

    /**
     * Update volume settings
     * @param {Object} settings - New volume settings
     */
    updateSettings(settings = {}) {
        this.settings = {
            ...this.settings,
            ...settings
        };

        if (this.masterGain) {
            this.masterGain.gain.value = this.settings.masterVolume;
        }
    }

    /**
     * Stop all currently playing sounds
     */
    stopAll() {
        this.activeSounds.forEach(source => {
            try {
                source.stop();
            } catch (error) {
                console.warn('Error stopping sound:', error);
            }
        });
        this.activeSounds.clear();
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.stopAll();
        this.soundCache.clear();
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.initialized = false;
    }
}

// Create singleton instance
const audioManager = new AudioManager();

export default audioManager;
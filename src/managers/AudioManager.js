/**
 * Manages audio playback and background music with fade transitions
 */
class AudioManager {
    constructor() {
        this.musicTracks = new Map();
        this.currentTrack = null;
        this.currentVolume = 1.0;
        this.isFading = false;
        this.fadeInterval = null;

        // Default fade duration in milliseconds
        this.defaultFadeDuration = 2000;
        
        // Initialize audio context when first user interaction occurs
        this.audioContext = null;
        this.initializeOnInteraction = this.initializeOnInteraction.bind(this);
        document.addEventListener('click', this.initializeOnInteraction, { once: true });
    }

    /**
     * Initializes Web Audio API context on first user interaction
     */
    initializeOnInteraction() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Web Audio API not supported:', error);
        }
    }

    /**
     * Loads a music track and stores it for later use
     * @param {string} trackId - Unique identifier for the track
     * @param {string} audioPath - Path to the audio file
     * @returns {Promise} Promise that resolves when the track is loaded
     */
    async loadTrack(trackId, audioPath) {
        try {
            const response = await fetch(audioPath);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext?.decodeAudioData(arrayBuffer);

            const track = {
                buffer: audioBuffer,
                source: null,
                gainNode: this.audioContext?.createGain()
            };

            this.musicTracks.set(trackId, track);
        } catch (error) {
            console.error(`Failed to load track ${trackId}:`, error);
        }
    }

    /**
     * Plays a background music track with optional fade in
     * @param {string} trackId - ID of the track to play
     * @param {boolean} fadeIn - Whether to fade in the track
     * @param {number} [fadeDuration] - Duration of fade in milliseconds
     */
    playMusic(trackId, fadeIn = true, fadeDuration = this.defaultFadeDuration) {
        if (!this.audioContext) {
            console.warn('Audio context not initialized');
            return;
        }

        const track = this.musicTracks.get(trackId);
        if (!track) {
            console.error(`Track ${trackId} not found`);
            return;
        }

        // Stop current track if playing
        if (this.currentTrack) {
            this.stopMusic(true, fadeDuration);
        }

        // Create and configure new audio source
        track.source = this.audioContext.createBufferSource();
        track.source.buffer = track.buffer;
        track.source.loop = true;

        // Connect nodes
        track.source.connect(track.gainNode);
        track.gainNode.connect(this.audioContext.destination);

        // Set initial volume
        if (fadeIn) {
            track.gainNode.gain.value = 0;
            this.fadeIn(track, fadeDuration);
        } else {
            track.gainNode.gain.value = this.currentVolume;
        }

        // Start playback
        track.source.start(0);
        this.currentTrack = track;
    }

    /**
     * Stops the currently playing music track
     * @param {boolean} fadeOut - Whether to fade out the track
     * @param {number} [fadeDuration] - Duration of fade in milliseconds
     */
    stopMusic(fadeOut = true, fadeDuration = this.defaultFadeDuration) {
        if (!this.currentTrack) return;

        if (fadeOut) {
            this.fadeOut(this.currentTrack, fadeDuration);
        } else {
            this.currentTrack.source?.stop();
            this.currentTrack = null;
        }
    }

    /**
     * Fades in a music track
     * @param {Object} track - Track object to fade in
     * @param {number} duration - Duration of fade in milliseconds
     */
    fadeIn(track, duration) {
        if (this.isFading) {
            clearInterval(this.fadeInterval);
        }

        const steps = 60;
        const stepTime = duration / steps;
        const volumeStep = this.currentVolume / steps;
        let currentStep = 0;

        this.isFading = true;
        this.fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = volumeStep * currentStep;
            track.gainNode.gain.value = newVolume;

            if (currentStep >= steps) {
                clearInterval(this.fadeInterval);
                this.isFading = false;
            }
        }, stepTime);
    }

    /**
     * Fades out a music track
     * @param {Object} track - Track object to fade out
     * @param {number} duration - Duration of fade in milliseconds
     */
    fadeOut(track, duration) {
        if (this.isFading) {
            clearInterval(this.fadeInterval);
        }

        const steps = 60;
        const stepTime = duration / steps;
        const volumeStep = track.gainNode.gain.value / steps;
        let currentStep = steps;

        this.isFading = true;
        this.fadeInterval = setInterval(() => {
            currentStep--;
            const newVolume = volumeStep * currentStep;
            track.gainNode.gain.value = newVolume;

            if (currentStep <= 0) {
                clearInterval(this.fadeInterval);
                this.isFading = false;
                track.source?.stop();
                this.currentTrack = null;
            }
        }, stepTime);
    }

    /**
     * Sets the master volume for all music
     * @param {number} volume - Volume level (0.0 to 1.0)
     */
    setVolume(volume) {
        this.currentVolume = Math.max(0, Math.min(1, volume));
        if (this.currentTrack) {
            this.currentTrack.gainNode.gain.value = this.currentVolume;
        }
    }

    /**
     * Pauses the currently playing music
     */
    pauseMusic() {
        if (this.audioContext) {
            this.audioContext.suspend();
        }
    }

    /**
     * Resumes the currently playing music
     */
    resumeMusic() {
        if (this.audioContext) {
            this.audioContext.resume();
        }
    }
}

export default AudioManager;
/**
 * @file TouchControls.ts
 * @description Implements touch-based controls for mobile devices, providing virtual joystick
 * and action buttons for game interaction.
 */

import { InputManager } from '../input/InputManager';
import { Canvas } from '../engine/canvas';

interface TouchPosition {
    x: number;
    y: number;
}

interface VirtualJoystick {
    baseX: number;
    baseY: number;
    currentX: number;
    currentY: number;
    isActive: boolean;
}

interface TouchButton {
    x: number;
    y: number;
    radius: number;
    label: string;
    isPressed: boolean;
}

export class TouchControls {
    private canvas: Canvas;
    private inputManager: InputManager;
    private joystick: VirtualJoystick;
    private fireButton: TouchButton;
    private specialButton: TouchButton;
    
    private readonly JOYSTICK_RADIUS = 50;
    private readonly BUTTON_RADIUS = 40;
    private readonly ALPHA = 0.5; // Transparency for UI elements

    constructor(canvas: Canvas, inputManager: InputManager) {
        this.canvas = canvas;
        this.inputManager = inputManager;
        
        // Initialize virtual joystick
        this.joystick = {
            baseX: this.JOYSTICK_RADIUS + 20,
            baseY: canvas.height - (this.JOYSTICK_RADIUS + 20),
            currentX: 0,
            currentY: 0,
            isActive: false
        };

        // Initialize action buttons
        this.fireButton = {
            x: canvas.width - (this.BUTTON_RADIUS + 20),
            y: canvas.height - (this.BUTTON_RADIUS + 20),
            radius: this.BUTTON_RADIUS,
            label: 'FIRE',
            isPressed: false
        };

        this.specialButton = {
            x: canvas.width - (this.BUTTON_RADIUS * 2 + 40),
            y: canvas.height - (this.BUTTON_RADIUS + 20),
            radius: this.BUTTON_RADIUS,
            label: 'SPECIAL',
            isPressed: false
        };

        this.initializeTouchEvents();
    }

    /**
     * Initialize touch event listeners
     */
    private initializeTouchEvents(): void {
        this.canvas.element.addEventListener('touchstart', (e: TouchEvent) => this.handleTouchStart(e));
        this.canvas.element.addEventListener('touchmove', (e: TouchEvent) => this.handleTouchMove(e));
        this.canvas.element.addEventListener('touchend', (e: TouchEvent) => this.handleTouchEnd(e));
        
        // Prevent default scrolling behavior
        this.canvas.element.addEventListener('touchmove', (e: TouchEvent) => {
            e.preventDefault();
        }, { passive: false });
    }

    /**
     * Handle touch start events
     */
    private handleTouchStart(event: TouchEvent): void {
        event.preventDefault();
        const touches = event.touches;

        for (let i = 0; i < touches.length; i++) {
            const touch = this.getTouchPosition(touches[i]);
            
            if (this.isInJoystickArea(touch)) {
                this.joystick.isActive = true;
                this.updateJoystickPosition(touch);
            }

            if (this.isInButtonArea(touch, this.fireButton)) {
                this.fireButton.isPressed = true;
                this.inputManager.triggerFire();
            }

            if (this.isInButtonArea(touch, this.specialButton)) {
                this.specialButton.isPressed = true;
                this.inputManager.triggerSpecial();
            }
        }
    }

    /**
     * Handle touch move events
     */
    private handleTouchMove(event: TouchEvent): void {
        event.preventDefault();
        const touches = event.touches;

        for (let i = 0; i < touches.length; i++) {
            const touch = this.getTouchPosition(touches[i]);
            
            if (this.joystick.isActive) {
                this.updateJoystickPosition(touch);
            }
        }
    }

    /**
     * Handle touch end events
     */
    private handleTouchEnd(event: TouchEvent): void {
        event.preventDefault();
        this.joystick.isActive = false;
        this.fireButton.isPressed = false;
        this.specialButton.isPressed = false;
        this.resetJoystick();
    }

    /**
     * Convert touch event coordinates to canvas coordinates
     */
    private getTouchPosition(touch: Touch): TouchPosition {
        const rect = this.canvas.element.getBoundingClientRect();
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }

    /**
     * Check if touch is within joystick area
     */
    private isInJoystickArea(touch: TouchPosition): boolean {
        const distance = Math.sqrt(
            Math.pow(touch.x - this.joystick.baseX, 2) +
            Math.pow(touch.y - this.joystick.baseY, 2)
        );
        return distance <= this.JOYSTICK_RADIUS * 1.5;
    }

    /**
     * Check if touch is within button area
     */
    private isInButtonArea(touch: TouchPosition, button: TouchButton): boolean {
        const distance = Math.sqrt(
            Math.pow(touch.x - button.x, 2) +
            Math.pow(touch.y - button.y, 2)
        );
        return distance <= button.radius;
    }

    /**
     * Update joystick position and trigger movement
     */
    private updateJoystickPosition(touch: TouchPosition): void {
        const dx = touch.x - this.joystick.baseX;
        const dy = touch.y - this.joystick.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.JOYSTICK_RADIUS) {
            const angle = Math.atan2(dy, dx);
            this.joystick.currentX = this.joystick.baseX + Math.cos(angle) * this.JOYSTICK_RADIUS;
            this.joystick.currentY = this.joystick.baseY + Math.sin(angle) * this.JOYSTICK_RADIUS;
        } else {
            this.joystick.currentX = touch.x;
            this.joystick.currentY = touch.y;
        }

        // Calculate normalized movement values (-1 to 1)
        const moveX = (this.joystick.currentX - this.joystick.baseX) / this.JOYSTICK_RADIUS;
        const moveY = (this.joystick.currentY - this.joystick.baseY) / this.JOYSTICK_RADIUS;
        
        this.inputManager.setMovement(moveX, moveY);
    }

    /**
     * Reset joystick to center position
     */
    private resetJoystick(): void {
        this.joystick.currentX = this.joystick.baseX;
        this.joystick.currentY = this.joystick.baseY;
        this.inputManager.setMovement(0, 0);
    }

    /**
     * Render touch controls
     */
    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.globalAlpha = this.ALPHA;

        // Draw joystick base
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.arc(this.joystick.baseX, this.joystick.baseY, this.JOYSTICK_RADIUS, 0, Math.PI * 2);
        ctx.stroke();

        // Draw joystick handle
        if (this.joystick.isActive) {
            ctx.beginPath();
            ctx.fillStyle = '#ffffff';
            ctx.arc(this.joystick.currentX, this.joystick.currentY, this.JOYSTICK_RADIUS / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw action buttons
        this.drawButton(ctx, this.fireButton);
        this.drawButton(ctx, this.specialButton);

        ctx.restore();
    }

    /**
     * Draw a touch button
     */
    private drawButton(ctx: CanvasRenderingContext2D, button: TouchButton): void {
        ctx.beginPath();
        ctx.fillStyle = button.isPressed ? '#ff4444' : '#ffffff';
        ctx.arc(button.x, button.y, button.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(button.label, button.x, button.y);
    }
}
window.InputManager = class InputManager {
    constructor() {
        this.keys = {};
        this.keyPressed = {};
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.keyPressed[e.code] = true;
            }
            this.keys[e.code] = true;
            
            if (e.code === 'Space' || e.code === 'Escape') {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keyPressed[e.code] = false;
        });
    }
    
    isPressed(key) {
        return !!this.keys[key];
    }
    
    wasPressed(key) {
        if (this.keyPressed[key]) {
            this.keyPressed[key] = false;
            return true;
        }
        return false;
    }
    
    isMoving() {
        return this.isPressed('KeyW') || this.isPressed('KeyS') || 
               this.isPressed('KeyA') || this.isPressed('KeyD') ||
               this.isPressed('ArrowUp') || this.isPressed('ArrowDown') ||
               this.isPressed('ArrowLeft') || this.isPressed('ArrowRight');
    }
    
    getMovementDirection() {
        let dx = 0, dy = 0;
        
        if (this.isPressed('KeyA') || this.isPressed('ArrowLeft')) dx = -1;
        if (this.isPressed('KeyD') || this.isPressed('ArrowRight')) dx = 1;
        if (this.isPressed('KeyW') || this.isPressed('ArrowUp')) dy = -1;
        if (this.isPressed('KeyS') || this.isPressed('ArrowDown')) dy = 1;
        
        if (dx !== 0 && dy !== 0) {
            const normalized = Utils.normalize(dx, dy);
            dx = normalized.x;
            dy = normalized.y;
        }
        
        return { dx, dy };
    }
}
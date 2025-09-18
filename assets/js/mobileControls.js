// assets/js/mobileControls.js - Gestione controlli touch mobile

class MobileControls {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.joystick = {
            base: null,
            knob: null,
            active: false,
            startPos: { x: 0, y: 0 },
            currentPos: { x: 0, y: 0 },
            maxDistance: 35
        };
        
        this.buttons = {};
        this.virtualKeys = {
            up: false,
            down: false,
            left: false,
            right: false,
            space: false,
            escape: false
        };
        
        this.init();
    }
    
    init() {
        if (!this.isTouchDevice()) return;
        
        this.setupJoystick();
        this.setupButtons();
        this.preventZoom();
        
        console.log('Mobile controls initialized');
    }
    
    isTouchDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }
    
    setupJoystick() {
        this.joystick.base = document.getElementById('virtualJoystick');
        this.joystick.knob = document.getElementById('joystickKnob');
        
        if (!this.joystick.base || !this.joystick.knob) return;
        
        // Touch events
        this.joystick.base.addEventListener('touchstart', this.onJoystickStart.bind(this), { passive: false });
        this.joystick.base.addEventListener('touchmove', this.onJoystickMove.bind(this), { passive: false });
        this.joystick.base.addEventListener('touchend', this.onJoystickEnd.bind(this), { passive: false });
        
        // Mouse events per testing su desktop
        this.joystick.base.addEventListener('mousedown', this.onJoystickStartMouse.bind(this));
        document.addEventListener('mousemove', this.onJoystickMoveMouse.bind(this));
        document.addEventListener('mouseup', this.onJoystickEndMouse.bind(this));
    }
    
    setupButtons() {
        // Pulsante interazione
        const interactBtn = document.getElementById('interactButton');
        if (interactBtn) {
            interactBtn.addEventListener('touchstart', () => this.pressButton('space'), { passive: true });
            interactBtn.addEventListener('touchend', () => this.releaseButton('space'), { passive: true });
            interactBtn.addEventListener('mousedown', () => this.pressButton('space'));
            interactBtn.addEventListener('mouseup', () => this.releaseButton('space'));
        }
        
        // Pulsante menu
        const menuBtn = document.getElementById('menuButton');
        if (menuBtn) {
            menuBtn.addEventListener('touchstart', () => this.pressButton('escape'), { passive: true });
            menuBtn.addEventListener('touchend', () => this.releaseButton('escape'), { passive: true });
            menuBtn.addEventListener('mousedown', () => this.pressButton('escape'));
            menuBtn.addEventListener('mouseup', () => this.releaseButton('escape'));
        }
    }
    
    onJoystickStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.startJoystick(touch.clientX, touch.clientY);
    }
    
    onJoystickMove(e) {
        e.preventDefault();
        if (!this.joystick.active) return;
        
        const touch = e.touches[0];
        this.moveJoystick(touch.clientX, touch.clientY);
    }
    
    onJoystickEnd(e) {
        e.preventDefault();
        this.endJoystick();
    }
    
    // Mouse events per desktop testing
    onJoystickStartMouse(e) {
        e.preventDefault();
        this.startJoystick(e.clientX, e.clientY);
    }
    
    onJoystickMoveMouse(e) {
        if (!this.joystick.active) return;
        e.preventDefault();
        this.moveJoystick(e.clientX, e.clientY);
    }
    
    onJoystickEndMouse(e) {
        if (!this.joystick.active) return;
        this.endJoystick();
    }
    
    startJoystick(clientX, clientY) {
        this.joystick.active = true;
        this.joystick.base.classList.add('joystick-active');
        
        const rect = this.joystick.base.getBoundingClientRect();
        this.joystick.startPos = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        
        this.moveJoystick(clientX, clientY);
    }
    
    moveJoystick(clientX, clientY) {
        const deltaX = clientX - this.joystick.startPos.x;
        const deltaY = clientY - this.joystick.startPos.y;
        const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), this.joystick.maxDistance);
        
        if (distance > 0) {
            const angle = Math.atan2(deltaY, deltaX);
            this.joystick.currentPos.x = Math.cos(angle) * distance;
            this.joystick.currentPos.y = Math.sin(angle) * distance;
        } else {
            this.joystick.currentPos.x = 0;
            this.joystick.currentPos.y = 0;
        }
        
        // Aggiorna posizione visiva del knob
        this.joystick.knob.style.transform = 
            `translate(-50%, -50%) translate(${this.joystick.currentPos.x}px, ${this.joystick.currentPos.y}px)`;
        
        // Calcola direzioni virtuali
        this.updateVirtualKeys();
    }
    
    endJoystick() {
        this.joystick.active = false;
        this.joystick.base.classList.remove('joystick-active');
        this.joystick.currentPos.x = 0;
        this.joystick.currentPos.y = 0;
        
        // Reset posizione knob
        this.joystick.knob.style.transform = 'translate(-50%, -50%)';
        
        // Reset tasti virtuali
        this.virtualKeys.up = false;
        this.virtualKeys.down = false;
        this.virtualKeys.left = false;
        this.virtualKeys.right = false;
    }
    
    updateVirtualKeys() {
        const threshold = 15;
        
        // Reset
        this.virtualKeys.up = false;
        this.virtualKeys.down = false;
        this.virtualKeys.left = false;
        this.virtualKeys.right = false;
        
        // Calcola direzioni
        if (Math.abs(this.joystick.currentPos.x) > threshold || Math.abs(this.joystick.currentPos.y) > threshold) {
            if (this.joystick.currentPos.y < -threshold) this.virtualKeys.up = true;
            if (this.joystick.currentPos.y > threshold) this.virtualKeys.down = true;
            if (this.joystick.currentPos.x < -threshold) this.virtualKeys.left = true;
            if (this.joystick.currentPos.x > threshold) this.virtualKeys.right = true;
        }
    }
    
    pressButton(key) {
        this.virtualKeys[key] = true;
        
        // Feedback visivo
        const button = key === 'space' ? document.getElementById('interactButton') : document.getElementById('menuButton');
        if (button) {
            button.classList.add('pressed');
            setTimeout(() => button.classList.remove('pressed'), 100);
        }
        
        // Feedback haptic se disponibile
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    releaseButton(key) {
        // Per i pulsanti, simuliamo un keyPressed event
        if (key === 'space') {
            this.inputManager.keyPressed['Space'] = true;
        } else if (key === 'escape') {
            this.inputManager.keyPressed['Escape'] = true;
        }
        
        setTimeout(() => {
            this.virtualKeys[key] = false;
        }, 50);
    }
    
    preventZoom() {
        // Previeni zoom con pinch
        document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
        document.addEventListener('gesturechange', e => e.preventDefault(), { passive: false });
        document.addEventListener('gestureend', e => e.preventDefault(), { passive: false });
        
        // Previeni zoom doppio tap su bottoni
        document.addEventListener('dblclick', e => {
            if (e.target.closest('#mobileControls')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // Integrazione con InputManager esistente
    getMovementDirection() {
        let dx = 0, dy = 0;
        
        // Movimento da joystick virtuale (più preciso)
        if (this.joystick.active && (Math.abs(this.joystick.currentPos.x) > 10 || Math.abs(this.joystick.currentPos.y) > 10)) {
            dx = this.joystick.currentPos.x / this.joystick.maxDistance;
            dy = this.joystick.currentPos.y / this.joystick.maxDistance;
            
            // Normalizza se necessario
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            if (magnitude > 1) {
                dx /= magnitude;
                dy /= magnitude;
            }
        }
        
        return { dx, dy };
    }
    
    isPressed(key) {
        const keyMap = {
            'KeyW': this.virtualKeys.up,
            'KeyS': this.virtualKeys.down,
            'KeyA': this.virtualKeys.left,
            'KeyD': this.virtualKeys.right,
            'ArrowUp': this.virtualKeys.up,
            'ArrowDown': this.virtualKeys.down,
            'ArrowLeft': this.virtualKeys.left,
            'ArrowRight': this.virtualKeys.right,
            'Space': this.virtualKeys.space,
            'Escape': this.virtualKeys.escape
        };
        
        return keyMap[key] || false;
    }
    
    wasPressed(key) {
        // Questo viene gestito nella releaseButton per i pulsanti
        return false;
    }
}

// Estendi InputManager per supportare controlli mobile
window.addEventListener('DOMContentLoaded', () => {
    if (window.InputManager) {
        const originalInputManager = window.InputManager;
        
        window.InputManager = class ExtendedInputManager extends originalInputManager {
            constructor() {
                super();
                this.mobileControls = new MobileControls(this);
            }
            
            getMovementDirection() {
                // Prova prima i controlli mobile
                if (this.mobileControls && this.mobileControls.isTouchDevice()) {
                    const mobileMovement = this.mobileControls.getMovementDirection();
                    if (mobileMovement.dx !== 0 || mobileMovement.dy !== 0) {
                        return mobileMovement;
                    }
                }
                
                // Fallback ai controlli desktop originali
                return super.getMovementDirection();
            }
            
            isPressed(key) {
                // Controlla prima mobile, poi desktop
                if (this.mobileControls && this.mobileControls.isTouchDevice()) {
                    if (this.mobileControls.isPressed(key)) return true;
                }
                
                return super.isPressed(key);
            }
        };
    }
});

console.log('Mobile controls module loaded');
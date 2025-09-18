// assets/js/mobileControls.js - Controlli mobile ottimizzati per intro e gioco

class MobileControls {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.currentMode = 'intro'; // 'intro' o 'game'
        
        this.joystick = {
            base: null,
            knob: null,
            active: false,
            startPos: { x: 0, y: 0 },
            currentPos: { x: 0, y: 0 },
            maxDistance: 45
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
        
        this.orientationHandler = new OrientationManager();
        this.init();
    }
    
    init() {
        if (!this.isTouchDevice()) return;
        
        this.setupControls();
        this.setupOrientationDetection();
        this.preventZoom();
        this.setIntroMode();
        
        console.log('Mobile controls initialized in intro mode');
    }
    
    isTouchDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }
    
    setIntroMode() {
        this.currentMode = 'intro';
        document.body.className = 'intro-mode';
        
        const controls = document.getElementById('mobileControls');
        if (controls) {
            controls.classList.add('intro-mode');
            controls.classList.remove('active'); // Nasconde i controlli nell'intro
        }
        
        this.orientationHandler.allowAnyOrientation();
        console.log('Switched to intro mode - controls hidden');
    }
    
    setGameMode() {
        this.currentMode = 'game';
        document.body.className = 'game-mode';
        
        const controls = document.getElementById('mobileControls');
        if (controls) {
            controls.classList.remove('intro-mode');
            controls.classList.add('active'); // Mostra i controlli nel gioco
        }
        
        this.orientationHandler.requireLandscape();
        console.log('Switched to game mode - controls visible');
    }
    
    setupControls() {
        this.setupJoystick();
        this.setupButtons();
    }
    
    setupOrientationDetection() {
        const checkOrientation = () => {
            const isPortrait = window.innerHeight > window.innerWidth;
            
            if (isPortrait) {
                document.body.classList.add('portrait');
                document.body.classList.remove('landscape');
            } else {
                document.body.classList.add('landscape');
                document.body.classList.remove('portrait');
            }
            
            this.orientationHandler.handleOrientationChange(isPortrait);
        };
        
        window.addEventListener('orientationchange', () => {
            setTimeout(checkOrientation, 100);
        });
        
        window.addEventListener('resize', checkOrientation);
        checkOrientation();
    }
    
    setupJoystick() {
        this.joystick.base = document.getElementById('virtualJoystick');
        this.joystick.knob = document.getElementById('joystickKnob');
        
        if (!this.joystick.base || !this.joystick.knob) return;
        
        // Touch events
        this.joystick.base.addEventListener('touchstart', this.onJoystickStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.onJoystickMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.onJoystickEnd.bind(this), { passive: false });
        
        // Mouse events per testing
        this.joystick.base.addEventListener('mousedown', this.onJoystickStartMouse.bind(this));
        document.addEventListener('mousemove', this.onJoystickMoveMouse.bind(this));
        document.addEventListener('mouseup', this.onJoystickEndMouse.bind(this));
    }
    
    setupButtons() {
        // Pulsante interazione
        const interactBtn = document.getElementById('interactButton');
        if (interactBtn) {
            interactBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.pressButton('space');
            }, { passive: false });
            
            interactBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.releaseButton('space');
            }, { passive: false });
            
            // Mouse events per testing
            interactBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.pressButton('space');
            });
            
            interactBtn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.releaseButton('space');
            });
        }
        
        // Pulsante menu
        const menuBtn = document.getElementById('menuButton');
        if (menuBtn) {
            menuBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.pressButton('escape');
            }, { passive: false });
            
            menuBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.releaseButton('escape');
            }, { passive: false });
            
            // Mouse events per testing
            menuBtn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.pressButton('escape');
            });
            
            menuBtn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.releaseButton('escape');
            });
        }
    }
    
    // Joystick touch events
    onJoystickStart(e) {
        if (e.target.closest('#virtualJoystick')) {
            e.preventDefault();
            const touch = e.touches[0];
            this.startJoystick(touch.clientX, touch.clientY);
        }
    }
    
    onJoystickMove(e) {
        if (!this.joystick.active) return;
        e.preventDefault();
        const touch = e.touches[0];
        if (touch) {
            this.moveJoystick(touch.clientX, touch.clientY);
        }
    }
    
    onJoystickEnd(e) {
        if (this.joystick.active) {
            e.preventDefault();
            this.endJoystick();
        }
    }
    
    // Mouse events per testing
    onJoystickStartMouse(e) {
        if (e.target.closest('#virtualJoystick')) {
            e.preventDefault();
            this.startJoystick(e.clientX, e.clientY);
        }
    }
    
    onJoystickMoveMouse(e) {
        if (!this.joystick.active) return;
        e.preventDefault();
        this.moveJoystick(e.clientX, e.clientY);
    }
    
    onJoystickEndMouse(e) {
        if (this.joystick.active) {
            e.preventDefault();
            this.endJoystick();
        }
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
        this.addHapticFeedback(30);
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
        
        // Aggiorna posizione visiva
        this.joystick.knob.style.transform = 
            `translate(-50%, -50%) translate(${this.joystick.currentPos.x}px, ${this.joystick.currentPos.y}px)`;
        
        this.updateVirtualKeys();
    }
    
    endJoystick() {
        this.joystick.active = false;
        this.joystick.base.classList.remove('joystick-active');
        this.joystick.currentPos.x = 0;
        this.joystick.currentPos.y = 0;
        
        // Reset posizione
        this.joystick.knob.style.transform = 'translate(-50%, -50%)';
        
        // Reset tasti
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
        
        // Solo se il movimento è significativo
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
        const button = key === 'space' ? 
            document.getElementById('interactButton') : 
            document.getElementById('menuButton');
            
        if (button) {
            button.classList.add('pressed');
            setTimeout(() => button.classList.remove('pressed'), 150);
        }
        
        this.addHapticFeedback(50);
    }
    
    releaseButton(key) {
        console.log('Button released:', key, 'Current mode:', this.currentMode);
        
        // Simula keyPressed per compatibilità con il sistema esistente
        if (key === 'space') {
            this.inputManager.keyPressed['Space'] = true;
            this.inputManager.keyPressed['Enter'] = true;
            console.log('Space/Enter key simulated');
        } else if (key === 'escape') {
            this.inputManager.keyPressed['Escape'] = true;
            console.log('Escape key simulated');
        }
        
        // Reset del tasto virtuale dopo un breve delay
        setTimeout(() => {
            this.virtualKeys[key] = false;
            if (key === 'space') {
                this.inputManager.keyPressed['Space'] = false;
                this.inputManager.keyPressed['Enter'] = false;
            } else if (key === 'escape') {
                this.inputManager.keyPressed['Escape'] = false;
            }
        }, 100);
    }
    
    addHapticFeedback(duration = 50) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }
    
    preventZoom() {
        // Previeni zoom con gesture
        document.addEventListener('gesturestart', e => e.preventDefault(), { passive: false });
        document.addEventListener('gesturechange', e => e.preventDefault(), { passive: false });
        document.addEventListener('gestureend', e => e.preventDefault(), { passive: false });
        
        // Previeni zoom doppio tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = new Date().getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
        
        // Previeni context menu
        document.addEventListener('contextmenu', e => e.preventDefault(), { passive: false });
    }
    
    // Integrazione con InputManager
    getMovementDirection() {
        let dx = 0, dy = 0;
        
        // Movimento da joystick (più preciso)
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
}

// Gestore orientamento schermo
class OrientationManager {
    constructor() {
        this.requiresLandscape = false;
        this.rotateOverlay = document.getElementById('rotateOverlay');
    }
    
    allowAnyOrientation() {
        this.requiresLandscape = false;
        this.hideRotateOverlay();
    }
    
    requireLandscape() {
        this.requiresLandscape = true;
        this.checkOrientation();
    }
    
    handleOrientationChange(isPortrait) {
        if (this.requiresLandscape && isPortrait) {
            this.showRotateOverlay();
        } else {
            this.hideRotateOverlay();
        }
    }
    
    checkOrientation() {
        const isPortrait = window.innerHeight > window.innerWidth;
        this.handleOrientationChange(isPortrait);
    }
    
    showRotateOverlay() {
        if (this.rotateOverlay) {
            this.rotateOverlay.style.display = 'flex';
        }
    }
    
    hideRotateOverlay() {
        if (this.rotateOverlay) {
            this.rotateOverlay.style.display = 'none';
        }
    }
}

// Estensione InputManager per supporto mobile
window.addEventListener('DOMContentLoaded', () => {
    if (window.InputManager) {
        const originalInputManager = window.InputManager;
        
        window.InputManager = class ExtendedInputManager extends originalInputManager {
            constructor() {
                super();
                this.mobileControls = new MobileControls(this);
                
                // Aggiungi riferimenti globali per controllo modalità
                window.mobileControls = this.mobileControls;
            }
            
            getMovementDirection() {
                // Prima i controlli mobile se disponibili
                if (this.mobileControls && this.mobileControls.isTouchDevice()) {
                    const mobileMovement = this.mobileControls.getMovementDirection();
                    if (mobileMovement.dx !== 0 || mobileMovement.dy !== 0) {
                        return mobileMovement;
                    }
                }
                
                // Fallback desktop
                return super.getMovementDirection();
            }
            
            isPressed(key) {
                // Prima mobile, poi desktop
                if (this.mobileControls && this.mobileControls.isTouchDevice()) {
                    if (this.mobileControls.isPressed(key)) return true;
                }
                
                return super.isPressed(key);
            }
            
            // Metodi per cambio modalità
            setIntroMode() {
                if (this.mobileControls) {
                    this.mobileControls.setIntroMode();
                }
            }
            
            setGameMode() {
                if (this.mobileControls) {
                    this.mobileControls.setGameMode();
                }
            }
        };
    }
});

console.log('Mobile controls module loaded');
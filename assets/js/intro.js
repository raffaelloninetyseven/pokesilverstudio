// Fix per assets/js/intro.js - Ottimizzato per mobile

window.IntroManager = class IntroManager {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        
        this.isActive = true;
        this.currentStep = 'welcome';
        this.textIndex = 0;
        this.currentText = '';
        this.textSpeed = 50;
        this.lastTextUpdate = 0;
        this.isTyping = false;
        this.skipTyping = false;
        
        this.selectedGender = null;
        this.playerName = 'Visitatore';
        this.selectedGenderIndex = 0;
        
        this.profSpritesheet = null;
        this.profLoaded = false;
        this.profAnimFrame = 0;
        this.profAnimTimer = 0;
        this.profFrameCount = 4;
        this.profAnimSpeed = 0.1;
        
        this.stars = [];
        this.animationTime = 0;
        this.generateStars();
        
        this.hideMinimap();
        this.loadProfSpritesheet();
        
        // Attiva modalità intro per mobile
        if (window.mobileControls) {
            window.mobileControls.setIntroMode();
        }
        
        this.dialogues = {
            welcome: [
                "Ciao! Benvenuto nel mondo di SilverStudio!",
                "Io sono Prof. Silver, creatore di questo universo digitale.",
                "Qui potrai esplorare i miei progetti, le mie competenze e scoprire chi sono come sviluppatore.",
                "Ma prima di iniziare la tua avventura..."
            ],
            gender: [
                "Dimmi, sei un ragazzo o una ragazza?",
                "Scegli il tuo personaggio per esplorare il portfolio!"
            ],
            confirmation: [
                `Perfetto! Ora sei pronto per iniziare la tua avventura.`,
                "Usa i controlli per muoverti nella cittadina.",
                "Avvicinati agli edifici e premi il pulsante di interazione.",
                "Buona esplorazione nel mondo di SilverStudio!"
            ]
        };
        
        this.currentDialogue = this.dialogues.welcome;
        this.setupUI();
        this.introLoop();
    }
    
    hideMinimap() {
        const minimap = document.getElementById('minimap');
        if (minimap) {
            minimap.style.display = 'none';
        }
    }
    
    showMinimap() {
        const minimap = document.getElementById('minimap');
        if (minimap) {
            minimap.style.display = 'block';
        }
    }
    
    generateStars() {
        this.stars = [];
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Math.random() * CONFIG.CANVAS_WIDTH,
                y: Math.random() * CONFIG.CANVAS_HEIGHT,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 0.5 + 0.1,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }
    
    loadProfSpritesheet() {
        this.profSpritesheet = new Image();
        this.profSpritesheet.onload = () => {
            this.profLoaded = true;
            console.log('Prof Silver spritesheet caricato');
        };
        this.profSpritesheet.onerror = () => {
            console.warn('Prof Silver spritesheet non trovato');
            this.profLoaded = false;
        };
        this.profSpritesheet.src = 'assets/sprite/prof/prof_silver_talking.png';
    }
    
    setupUI() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'intro-overlay';
        this.overlay.innerHTML = `
            <div class="intro-container">
                <div class="prof-section">
                    <canvas id="prof-canvas" width="400" height="600"></canvas>
                </div>
                
                <div class="dialogue-section">
                    <div class="dialogue-box">
                        <div class="dialogue-text" id="dialogue-text"></div>
                        <div class="dialogue-controls">
                            <span class="continue-hint" id="continue-hint">Tocca per continuare</span>
                        </div>
                    </div>
                </div>
                
                <div class="gender-selection" id="gender-selection" style="display: none;">
                    <div class="selection-title">Scegli il tuo personaggio:</div>
                    <div class="gender-options">
                        <div class="gender-option" data-gender="male">
                            <div class="character-sprite" id="boy-sprite">👨</div>
                            <div class="character-label">Ragazzo</div>
                        </div>
                        <div class="gender-option" data-gender="female">
                            <div class="character-sprite" id="girl-sprite">👩</div>
                            <div class="character-label">Ragazza</div>
                        </div>
                    </div>
                    <div class="gender-controls">
                        <span class="control-hint">Tocca per selezionare</span>
                    </div>
                </div>
            </div>
        `;
        
        const introStyles = document.createElement('style');
        introStyles.textContent = `
            #intro-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(135deg, #000 0%, #1e3c72 50%, #2a5298 100%);
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: 'Press Start 2P', monospace;
                overflow: hidden;
                padding: 10px;
            }
            
            #intro-overlay::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(2px 2px at 20% 30%, #fff, transparent),
                            radial-gradient(2px 2px at 40% 70%, #fff, transparent),
                            radial-gradient(1px 1px at 90% 40%, #fff, transparent),
                            radial-gradient(1px 1px at 50% 50%, #fff, transparent),
                            radial-gradient(2px 2px at 80% 10%, #fff, transparent),
                            radial-gradient(1px 1px at 30% 90%, #fff, transparent),
                            radial-gradient(1px 1px at 70% 20%, #fff, transparent),
                            radial-gradient(2px 2px at 10% 60%, #fff, transparent);
                background-size: 200px 200px, 300px 300px, 150px 150px, 250px 250px,
                                180px 180px, 220px 220px, 280px 280px, 160px 160px;
                animation: twinkle 20s linear infinite;
                opacity: 0.6;
                z-index: -1;
            }
            
            @keyframes twinkle {
                0% { transform: translateY(0) rotate(0deg); }
                100% { transform: translateY(-100vh) rotate(360deg); }
            }
            
            .intro-container {
                width: 95vw;
                height: 95vh;
                max-width: 1200px;
                max-height: 800px;
                background: rgba(20, 20, 40, 0.95);
                border: 4px solid #4ecdc4;
                display: flex;
                flex-direction: column;
                position: relative;
                backdrop-filter: blur(10px);
                box-shadow: 0 0 50px rgba(78, 205, 196, 0.3);
                border-radius: 10px;
                overflow: hidden;
            }
            
            .prof-section {
                flex: 0 0 40%;
                display: flex;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, rgba(30, 60, 114, 0.2), rgba(42, 82, 152, 0.2));
                border-bottom: 3px solid #4ecdc4;
                position: relative;
                padding: 15px;
                min-height: 200px;
            }
            
            #prof-canvas {
                image-rendering: pixelated;
                width: 100%;
                height: 100%;
                max-width: 300px;
                max-height: 100%;
                object-fit: contain;
                filter: drop-shadow(0 0 30px rgba(78, 205, 196, 0.4));
            }
            
            .dialogue-section {
                flex: 1;
                padding: clamp(15px, 4vw, 30px);
                display: flex;
                flex-direction: column;
                justify-content: center;
                position: relative;
                min-height: 150px;
            }
            
            .dialogue-box {
                background: rgba(255, 255, 255, 0.98);
                border: 3px solid #4ecdc4;
                border-radius: 8px;
                padding: clamp(15px, 4vw, 25px);
                min-height: clamp(100px, 20vh, 150px);
                position: relative;
                box-shadow: 0 0 40px rgba(78, 205, 196, 0.3);
                cursor: pointer;
                user-select: none;
                -webkit-user-select: none;
                touch-action: manipulation;
            }
            
            .dialogue-text {
                font-size: clamp(10px, 2.5vw, 14px);
                line-height: 1.6;
                color: #1a1a1a;
                min-height: clamp(50px, 12vh, 80px);
                margin-bottom: 20px;
            }
            
            .dialogue-controls {
                position: absolute;
                bottom: 10px;
                right: 15px;
            }
            
            .continue-hint {
                font-size: clamp(6px, 1.5vw, 9px);
                color: #4ecdc4;
                animation: glow 2s infinite ease-in-out;
            }
            
            @keyframes glow {
                0%, 100% { opacity: 0.7; text-shadow: 0 0 5px rgba(78, 205, 196, 0.5); }
                50% { opacity: 1; text-shadow: 0 0 15px rgba(78, 205, 196, 0.8); }
            }
            
            .gender-selection {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: clamp(15px, 3vw, 25px);
                text-align: center;
                background: rgba(0, 0, 0, 0.95);
                border-top: 3px solid #4ecdc4;
                border-radius: 0 0 10px 10px;
            }
            
            .selection-title {
                font-size: clamp(12px, 3vw, 18px);
                margin-bottom: clamp(15px, 3vw, 25px);
                color: #4ecdc4;
                text-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
            }
            
            .gender-options {
                display: flex;
                justify-content: center;
                gap: clamp(20px, 6vw, 60px);
                flex-wrap: wrap;
                margin-bottom: 20px;
            }
            
            .gender-option {
                background: rgba(30, 60, 114, 0.8);
                border: 3px solid #4ecdc4;
                border-radius: 8px;
                padding: clamp(15px, 3vw, 20px);
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: clamp(100px, 15vw, 150px);
                max-width: clamp(140px, 20vw, 180px);
                touch-action: manipulation;
                user-select: none;
                -webkit-user-select: none;
            }
            
            .gender-option:hover,
            .gender-option.keyboard-selected,
            .gender-option:active {
                background: rgba(42, 82, 152, 0.9);
                transform: translateY(-5px) scale(1.05);
                box-shadow: 0 10px 30px rgba(78, 205, 196, 0.4);
            }
            
            .gender-option.selected {
                background: rgba(78, 205, 196, 0.9);
                color: #1a1a1a;
                box-shadow: 0 0 40px rgba(78, 205, 196, 0.7);
                transform: translateY(-5px) scale(1.1);
            }
            
            .character-sprite {
                font-size: clamp(24px, 5vw, 40px);
                margin-bottom: clamp(8px, 2vw, 15px);
                min-height: clamp(40px, 8vw, 60px);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .character-sprite canvas {
                image-rendering: pixelated;
                border: 2px solid transparent;
                transition: all 0.3s ease;
                border-radius: 6px;
                width: clamp(40px, 8vw, 64px);
                height: clamp(40px, 8vw, 64px);
            }
            
            .gender-option.selected .character-sprite canvas {
                border-color: #4ecdc4;
                box-shadow: 0 0 20px rgba(78, 205, 196, 0.8);
            }
            
            .character-label {
                font-size: clamp(8px, 2vw, 12px);
                color: #4ecdc4;
                text-shadow: 0 1px 3px rgba(0,0,0,0.5);
            }
            
            .gender-option.selected .character-label {
                color: #1a1a1a;
                font-weight: bold;
            }
            
            .gender-controls {
                margin-top: 15px;
                text-align: center;
            }
            
            .control-hint {
                font-size: clamp(6px, 1.2vw, 8px);
                color: #4ecdc4;
                opacity: 0.8;
            }
            
            /* Mobile specifico */
            @media (orientation: portrait) {
                .intro-container {
                    width: 98vw;
                    height: 98vh;
                    flex-direction: column;
                }
                
                .prof-section {
                    flex: 0 0 35%;
                    min-height: 180px;
                }
                
                .dialogue-section {
                    flex: 1;
                    min-height: 120px;
                }
                
                .gender-options {
                    flex-direction: column;
                    align-items: center;
                    gap: 15px;
                }
                
                .gender-option {
                    width: 80%;
                    max-width: 200px;
                }
            }
            
            @media (orientation: landscape) and (max-height: 500px) {
                .intro-container {
                    flex-direction: row;
                    height: 98vh;
                }
                
                .prof-section {
                    flex: 0 0 40%;
                    border-right: 3px solid #4ecdc4;
                    border-bottom: none;
                }
                
                .dialogue-section {
                    flex: 1;
                    padding: 15px;
                }
                
                .dialogue-text {
                    font-size: clamp(8px, 2vw, 12px);
                }
                
                .gender-options {
                    flex-direction: row;
                    gap: 20px;
                }
            }
        `;
        
        document.head.appendChild(introStyles);
        document.body.appendChild(this.overlay);
        
        this.profCanvas = document.getElementById('prof-canvas');
        this.profCtx = this.profCanvas.getContext('2d');
        this.profCtx.imageSmoothingEnabled = false;
        
        this.setupEventListeners();
        this.loadCharacterSprites();
        this.startTypewriter();
    }
    
    setupEventListeners() {
        // Touch/click handlers per dialogue box
        const dialogueBox = document.querySelector('.dialogue-box');
        if (dialogueBox) {
            dialogueBox.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleInteraction();
            });
            
            dialogueBox.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleInteraction();
            });
        }
        
        // Keyboard handler (per desktop)
        this.keyHandler = (e) => {
            if (!this.isActive) return;
            
            switch(e.code) {
                case 'Space':
                case 'Enter':
                    e.preventDefault();
                    if (this.currentStep === 'gender') {
                        this.selectGender(this.selectedGenderIndex === 0 ? 'male' : 'female');
                    } else {
                        this.handleInteraction();
                    }
                    break;
                    
                case 'ArrowLeft':
                case 'KeyA':
                    if (this.currentStep === 'gender') {
                        e.preventDefault();
                        this.selectedGenderIndex = 0;
                        this.updateGenderSelection();
                    }
                    break;
                    
                case 'ArrowRight':
                case 'KeyD':
                    if (this.currentStep === 'gender') {
                        e.preventDefault();
                        this.selectedGenderIndex = 1;
                        this.updateGenderSelection();
                    }
                    break;
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
        this.setupGenderClickListeners();
    }
    
    handleInteraction() {
        if (this.currentStep === 'gender' && !this.selectedGender) {
            console.log('Waiting for gender selection...');
            return;
        }
        
        if (this.isTyping) {
            this.skipTyping = true;
            return;
        }
        
        if (this.textIndex < this.currentDialogue.length - 1) {
            this.textIndex++;
            this.startTypewriter();
        } else {
            this.nextStep();
        }
    }
    
    loadCharacterSprites() {
        this.loadBoySprite();
        this.loadGirlSprite();
    }
    
    loadBoySprite() {
        const boyImg = new Image();
        boyImg.onload = () => {
            const boyCanvas = document.createElement('canvas');
            boyCanvas.width = 64;
            boyCanvas.height = 64;
            const boyCtx = boyCanvas.getContext('2d');
            boyCtx.imageSmoothingEnabled = false;
            
            const frameWidth = boyImg.width / 4;
            const frameHeight = boyImg.height;
            
            boyCtx.drawImage(
                boyImg, 
                0, 0, frameWidth, frameHeight,
                0, 0, 64, 64
            );
            
            const boySprite = document.getElementById('boy-sprite');
            if (boySprite) {
                boySprite.innerHTML = '';
                boySprite.appendChild(boyCanvas);
            }
        };
        boyImg.onerror = () => {
            console.log('Boy sprite non trovato, uso emoji fallback');
        };
        boyImg.src = 'assets/sprite/player/player_boy_down.png';
    }
    
    loadGirlSprite() {
        const girlImg = new Image();
        girlImg.onload = () => {
            const girlCanvas = document.createElement('canvas');
            girlCanvas.width = 64;
            girlCanvas.height = 64;
            const girlCtx = girlCanvas.getContext('2d');
            girlCtx.imageSmoothingEnabled = false;
            
            const frameWidth = girlImg.width / 4;
            const frameHeight = girlImg.height;
            
            girlCtx.drawImage(
                girlImg, 
                0, 0, frameWidth, frameHeight,
                0, 0, 64, 64
            );
            
            const girlSprite = document.getElementById('girl-sprite');
            if (girlSprite) {
                girlSprite.innerHTML = '';
                girlSprite.appendChild(girlCanvas);
            }
        };
        girlImg.onerror = () => {
            console.log('Girl sprite non trovato, uso emoji fallback');
        };
        girlImg.src = 'assets/sprite/player/player_girl_down.png';
    }
    
    setupGenderClickListeners() {
        setTimeout(() => {
            const genderOptions = document.querySelectorAll('.gender-option');
            
            genderOptions.forEach((option, index) => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (this.currentStep === 'gender') {
                        this.selectGender(option.dataset.gender);
                    }
                });
                
                option.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    if (this.currentStep === 'gender') {
                        this.selectGender(option.dataset.gender);
                    }
                });
            });
        }, 200);
    }
    
    selectGender(gender) {
        console.log('Selecting gender:', gender);
        this.selectedGender = gender;
        
        document.querySelectorAll('.gender-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        const selectedElement = document.querySelector(`[data-gender="${gender}"]`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
        
        CONFIG.PLAYER_GENDER = gender;
        
        setTimeout(() => {
            this.nextStep();
        }, 800);
    }
    
    updateGenderSelection() {
        const genderOptions = document.querySelectorAll('.gender-option');
        genderOptions.forEach((option, index) => {
            if (index === this.selectedGenderIndex) {
                option.classList.add('keyboard-selected');
            } else {
                option.classList.remove('keyboard-selected');
            }
        });
    }
    
    nextStep() {
        switch(this.currentStep) {
            case 'welcome':
                this.currentStep = 'gender';
                this.currentDialogue = this.dialogues.gender;
                this.textIndex = 0;
                this.showGenderSelection();
                this.startTypewriter();
                break;
                
            case 'gender':
                if (!this.selectedGender) {
                    return;
                }
                this.currentStep = 'confirmation';
                this.currentDialogue = this.dialogues.confirmation;
                this.textIndex = 0;
                this.hideGenderSelection();
                this.startTypewriter();
                break;
                
            case 'confirmation':
                this.endIntro();
                break;
        }
    }
    
    showGenderSelection() {
        const genderSelection = document.getElementById('gender-selection');
        if (genderSelection) {
            genderSelection.style.display = 'block';
            this.setupGenderClickListeners();
            setTimeout(() => {
                this.updateGenderSelection();
            }, 300);
        }
    }
    
    hideGenderSelection() {
        const genderSelection = document.getElementById('gender-selection');
        if (genderSelection) {
            genderSelection.style.display = 'none';
        }
    }
    
    startTypewriter() {
        const dialogueElement = document.getElementById('dialogue-text');
        if (!dialogueElement) return;
        
        this.currentText = '';
        this.lastTextUpdate = Date.now();
        this.isTyping = true;
        this.skipTyping = false;
        
        this.typewriterEffect();
    }
    
    typewriterEffect() {
        if (!this.isActive) return;
        
        const targetText = this.currentDialogue[this.textIndex];
        const dialogueElement = document.getElementById('dialogue-text');
        
        if (!dialogueElement) return;
        
        if (this.skipTyping) {
            this.currentText = targetText;
            this.isTyping = false;
            this.skipTyping = false;
            dialogueElement.textContent = this.currentText;
            return;
        }
        
        const now = Date.now();
        if (now - this.lastTextUpdate >= this.textSpeed) {
            if (this.currentText.length < targetText.length) {
                this.currentText += targetText[this.currentText.length];
                dialogueElement.textContent = this.currentText;
                this.lastTextUpdate = now;
            } else {
                this.isTyping = false;
            }
        }
        
        if (this.currentText.length < targetText.length) {
            requestAnimationFrame(() => this.typewriterEffect());
        }
    }
    
    updateStars() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > CONFIG.CANVAS_HEIGHT + star.size) {
                star.y = -star.size;
                star.x = Math.random() * CONFIG.CANVAS_WIDTH;
            }
            
            star.brightness += star.twinkleSpeed;
            if (star.brightness > 1) star.brightness = 1;
            if (star.brightness < 0.3) star.brightness = 0.3;
        });
    }
    
    renderBackground() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        this.stars.forEach(star => {
            this.ctx.save();
            this.ctx.globalAlpha = star.brightness;
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
            
            if (Math.random() < 0.01) {
                this.ctx.globalAlpha = 1;
                this.ctx.fillStyle = '#ffff88';
                this.ctx.fillRect(star.x - 1, star.y - 1, star.size + 2, star.size + 2);
            }
            
            this.ctx.restore();
        });
    }
    
    updateProfAnimation() {
        if (!this.profLoaded) return;
        
        if (this.isTyping) {
            this.profAnimTimer += this.profAnimSpeed;
            if (this.profAnimTimer >= 1) {
                this.profAnimFrame = (this.profAnimFrame + 1) % this.profFrameCount;
                this.profAnimTimer = 0;
            }
        } else {
            this.profAnimFrame = 0;
        }
        
        this.renderProfSprite();
    }
    
    renderProfSprite() {
        if (!this.profCanvas || !this.profCtx) return;
        
        if (!this.profLoaded || !this.profSpritesheet.complete) {
            this.profCtx.clearRect(0, 0, this.profCanvas.width, this.profCanvas.height);
            
            // Fallback - disegna Prof Silver stilizzato
            this.profCtx.fillStyle = '#1a1a1a';
            this.profCtx.fillRect(0, 0, this.profCanvas.width, this.profCanvas.height);
            
            // Bordo
            this.profCtx.strokeStyle = '#4ecdc4';
            this.profCtx.lineWidth = 4;
            this.profCtx.strokeRect(20, 20, this.profCanvas.width - 40, this.profCanvas.height - 40);
            
            // Testo
            this.profCtx.fillStyle = '#4ecdc4';
            this.profCtx.font = `${Math.min(this.profCanvas.width * 0.08, 32)}px "Press Start 2P"`;
            this.profCtx.textAlign = 'center';
            this.profCtx.fillText('PROF', this.profCanvas.width/2, this.profCanvas.height/2 - 40);
            this.profCtx.fillText('SILVER', this.profCanvas.width/2, this.profCanvas.height/2 + 40);
            
            // Dettagli decorativi
            this.profCtx.fillStyle = '#45b7d1';
            this.profCtx.fillRect(this.profCanvas.width/2 - 30, this.profCanvas.height/2 + 60, 60, 4);
            
            return;
        }
        
        this.profCtx.clearRect(0, 0, this.profCanvas.width, this.profCanvas.height);
        
        const frameWidth = this.profSpritesheet.width / this.profFrameCount;
        const frameHeight = this.profSpritesheet.height;
        
        this.profCtx.drawImage(
            this.profSpritesheet,
            this.profAnimFrame * frameWidth, 0,
            frameWidth, frameHeight,
            0, 0,
            this.profCanvas.width, this.profCanvas.height
        );
    }
    
    introLoop() {
        if (!this.isActive) return;
        
        this.animationTime += 0.02;
        this.updateProfAnimation();
        
        requestAnimationFrame(() => this.introLoop());
    }
    
    endIntro() {
        this.isActive = false;
        
        // Rimuovi event listeners
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        // Fade out
        this.overlay.style.transition = 'opacity 1s ease-out';
        this.overlay.style.opacity = '0';
        
        setTimeout(() => {
            if (document.body.contains(this.overlay)) {
                document.body.removeChild(this.overlay);
            }
            
            // Pulisci main menu se esiste
            if (this.game.mainMenu) {
                this.game.mainMenu.isActive = false;
                this.game.mainMenu = null;
            }
            
            // Attiva modalità gioco per mobile
            if (window.mobileControls) {
                window.mobileControls.setGameMode();
            }
            
            // Mostra minimap e avvia gioco
            this.showMinimap();
            this.game.startMainGame();
            
            console.log(`Benvenuto nel mondo di SilverStudio! Personaggio: ${this.selectedGender}`);
        }, 1000);
    }
}
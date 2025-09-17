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
        
        this.boyImg = null;
        this.girlImg = null;
        this.boyLoaded = false;
        this.girlLoaded = false;
        
        this.hideMinimap();
        this.loadProfSpritesheet();
        
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
                "Usa WASD o le frecce per muoverti nella cittadina.",
                "Avvicinati agli edifici e premi SPAZIO per interagire.",
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
                    <canvas id="prof-canvas" width="512" height="768"></canvas>
                </div>
                
                <div class="dialogue-section">
                    <div class="dialogue-box">
                        <div class="dialogue-text" id="dialogue-text"></div>
                        <div class="dialogue-controls">
                            <span class="continue-hint" id="continue-hint">SPAZIO - Continua</span>
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
                        <span class="control-hint">FRECCE/AD - Naviga   SPAZIO - Seleziona</span>
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
                background: #000;
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: 'Press Start 2P', monospace;
                overflow: hidden;
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
                width: 90vw;
                height: 90vh;
                max-width: 1400px;
                max-height: 900px;
                background: rgba(20, 20, 40, 0.95);
                border: 4px solid #4ecdc4;
                display: flex;
                position: relative;
                backdrop-filter: blur(10px);
                box-shadow: 0 0 50px rgba(78, 205, 196, 0.3);
            }
            
            .prof-section {
                width: 40%;
                display: flex;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, rgba(30, 60, 114, 0.2), rgba(42, 82, 152, 0.2));
                border-right: 3px solid #4ecdc4;
                position: relative;
                padding: 20px;
            }
            
            #prof-canvas {
                image-rendering: pixelated;
                width: 100%;
                height: 100%;
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                filter: drop-shadow(0 0 30px rgba(78, 205, 196, 0.4));
            }
            
            .dialogue-section {
                width: 60%;
                padding: clamp(20px, 4vw, 50px);
                display: flex;
                flex-direction: column;
                justify-content: center;
                position: relative;
            }
            
            .dialogue-box {
                background: rgba(255, 255, 255, 0.98);
                border: 3px solid #4ecdc4;
                padding: clamp(20px, 4vw, 40px);
                min-height: clamp(120px, 20vh, 200px);
                position: relative;
                box-shadow: 0 0 40px rgba(78, 205, 196, 0.3);
                border-radius: 8px;
            }
            
            .dialogue-text {
                font-size: clamp(10px, 2.5vw, 16px);
                line-height: 1.8;
                color: #1a1a1a;
                min-height: clamp(60px, 12vh, 100px);
            }
            
            .dialogue-controls {
                position: absolute;
                bottom: 15px;
                right: 20px;
            }
            
            .continue-hint {
                font-size: clamp(6px, 1.5vw, 10px);
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
                padding: clamp(15px, 3vw, 40px);
                text-align: center;
                background: rgba(0, 0, 0, 0.95);
                border-top: 3px solid #4ecdc4;
            }
            
            .selection-title {
                font-size: clamp(12px, 3vw, 20px);
                margin-bottom: clamp(15px, 3vw, 30px);
                color: #4ecdc4;
                text-shadow: 0 0 10px rgba(78, 205, 196, 0.5);
            }
            
            .gender-options {
                display: flex;
                justify-content: center;
                gap: clamp(30px, 6vw, 80px);
                flex-wrap: wrap;
            }
            
            .gender-option {
                background: rgba(30, 60, 114, 0.8);
                border: 3px solid #4ecdc4;
                padding: clamp(15px, 3vw, 25px);
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: clamp(80px, 12vw, 140px);
                max-width: clamp(120px, 15vw, 180px);
                border-radius: 8px;
            }
            
            .gender-option:hover,
            .gender-option.keyboard-selected {
                background: rgba(42, 82, 152, 0.9);
                transform: translateY(-5px) scale(1.1);
                box-shadow: 0 10px 30px rgba(78, 205, 196, 0.4);
            }
            
            .gender-option.selected {
                background: rgba(78, 205, 196, 0.9);
                color: #1a1a1a;
                box-shadow: 0 0 40px rgba(78, 205, 196, 0.7);
                transform: translateY(-5px) scale(1.1);
            }
            
            .character-sprite {
                font-size: clamp(20px, 4vw, 32px);
                margin-bottom: clamp(8px, 1.5vw, 15px);
                min-height: clamp(50px, 8vw, 70px);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .character-sprite canvas {
                image-rendering: pixelated;
                border: 2px solid transparent;
                transition: all 0.3s ease;
                border-radius: 6px;
                width: clamp(40px, 6vw, 64px);
                height: clamp(40px, 6vw, 64px);
            }
            
            .gender-option.selected .character-sprite canvas {
                border-color: #4ecdc4;
                box-shadow: 0 0 20px rgba(78, 205, 196, 0.8);
            }
            
            .character-label {
                font-size: clamp(8px, 2vw, 14px);
                color: #4ecdc4;
            }
            
            .gender-option.selected .character-label {
                color: #1a1a1a;
                font-weight: bold;
            }
            
            .gender-controls {
                margin-top: clamp(15px, 3vw, 25px);
                text-align: center;
            }
            
            .control-hint {
                font-size: clamp(6px, 1.2vw, 8px);
                color: #4ecdc4;
                opacity: 0.8;
            }
            
            @media (max-width: 768px) {
                .intro-container {
                    width: 100vw;
                    height: 100vh;
                    flex-direction: column;
                    border: none;
                }
                
                .prof-section {
                    width: 100%;
                    height: 45%;
                    border-right: none;
                    border-bottom: 3px solid #4ecdc4;
                    padding: 10px;
                }
                
                #prof-canvas {
                    max-height: 90%;
                }
                
                .dialogue-section {
                    width: 100%;
                    height: 55%;
                    padding: 15px;
                }
                
                .gender-options {
                    gap: 20px;
                }
                
                .gender-option {
                    min-width: 100px;
                    max-width: 130px;
                    padding: 12px;
                }
                
                .character-sprite canvas {
                    width: 48px;
                    height: 48px;
                }
            }
            
            @media (max-width: 480px) {
                .prof-section {
                    padding: 5px;
                }
                
                #prof-canvas {
                    max-height: 85%;
                }
                
                .dialogue-section {
                    padding: 10px;
                }
                
                .gender-selection {
                    padding: 20px 10px;
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
                boyCanvas.dataset.spritesheet = boyImg.src;
                boyCanvas.dataset.frameWidth = frameWidth;
                boyCanvas.dataset.frameHeight = frameHeight;
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
                girlCanvas.dataset.spritesheet = girlImg.src;
                girlCanvas.dataset.frameWidth = frameWidth;
                girlCanvas.dataset.frameHeight = frameHeight;
            }
        };
        girlImg.onerror = () => {
            console.log('Girl sprite non trovato, uso emoji fallback');
        };
        girlImg.src = 'assets/sprite/player/player_girl_down.png';
    }
    
    setupEventListeners() {
        this.keydownHandler = (e) => {
            if (!this.isActive) return;
            
            console.log('Key pressed:', e.code, 'Current step:', this.currentStep, 'Is typing:', this.isTyping, 'Text index:', this.textIndex);
            
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.currentStep === 'gender') {
                    this.selectGender(this.selectedGenderIndex === 0 ? 'male' : 'female');
                } else {
                    this.handleSpacePress();
                }
            } else if (this.currentStep === 'gender' && (e.code === 'ArrowLeft' || e.code === 'KeyA')) {
                e.preventDefault();
                this.selectedGenderIndex = 0;
                this.updateGenderSelection();
            } else if (this.currentStep === 'gender' && (e.code === 'ArrowRight' || e.code === 'KeyD')) {
                e.preventDefault();
                this.selectedGenderIndex = 1;
                this.updateGenderSelection();
            }
        };

        this.clickHandler = (e) => {
            if (!this.isActive) return;
            e.preventDefault();
            
            if (this.currentStep === 'gender') {
                // La gestione del click per i gender è già presente
                return;
            } else {
                // Tratta il click come SPACE per il dialogo
                this.handleSpacePress();
            }
        };

        document.addEventListener('click', this.clickHandler);        
        document.addEventListener('keydown', this.keydownHandler);
        this.setupGenderClickListeners();
    }
    
    setupGenderClickListeners() {
        setTimeout(() => {
            const genderOptions = document.querySelectorAll('.gender-option');
            console.log('Setting up gender listeners for', genderOptions.length, 'options');
            
            genderOptions.forEach((option, index) => {
                const canvas = option.querySelector('canvas');
                
                option.addEventListener('mouseenter', () => {
                    this.selectedGenderIndex = index;
                    this.updateGenderSelection();
                    this.startHoverAnimation(canvas);
                });
                
                option.addEventListener('mouseleave', () => {
                    this.stopHoverAnimation(canvas);
                });
                
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Gender clicked:', option.dataset.gender, 'Current step:', this.currentStep);
                    if (this.currentStep === 'gender') {
                        this.selectGender(option.dataset.gender);
                    }
                });
            });
        }, 200);
    }
    
    startHoverAnimation(canvas) {
        if (!canvas || !canvas.dataset.spritesheet) return;
        
        this.stopHoverAnimation(canvas);
        
        const img = new Image();
        img.onload = () => {
            const ctx = canvas.getContext('2d');
            const frameWidth = parseInt(canvas.dataset.frameWidth);
            const frameHeight = parseInt(canvas.dataset.frameHeight);
            let animationFrame = 0;
            
            canvas.animationInterval = setInterval(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(
                    img,
                    (animationFrame % 4) * frameWidth, 0, frameWidth, frameHeight,
                    8, 8, 48, 48
                );
                animationFrame++;
            }, 200);
        };
        img.src = canvas.dataset.spritesheet;
    }
    
    stopHoverAnimation(canvas) {
        if (!canvas || !canvas.dataset.spritesheet) return;
        
        if (canvas.animationInterval) {
            clearInterval(canvas.animationInterval);
            canvas.animationInterval = null;
        }
        
        const img = new Image();
        img.onload = () => {
            const ctx = canvas.getContext('2d');
            const frameWidth = parseInt(canvas.dataset.frameWidth);
            const frameHeight = parseInt(canvas.dataset.frameHeight);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
                img,
                0, 0, frameWidth, frameHeight,
                8, 8, 48, 48
            );
        };
        img.src = canvas.dataset.spritesheet;
    }
    
    updateGenderSelection() {
        const genderOptions = document.querySelectorAll('.gender-option');
        genderOptions.forEach((option, index) => {
            const canvas = option.querySelector('canvas');
            
            if (index === this.selectedGenderIndex) {
                option.classList.add('keyboard-selected');
                this.startHoverAnimation(canvas);
            } else {
                option.classList.remove('keyboard-selected');
                this.stopHoverAnimation(canvas);
            }
        });
    }
    
    handleSpacePress() {
        console.log('Space pressed - Current step:', this.currentStep, 'Text index:', this.textIndex, 'Is typing:', this.isTyping);
        
        if (this.isTyping) {
            this.skipTyping = true;
            return;
        }
        
        if (this.currentStep === 'gender' && !this.selectedGender) {
            console.log('Waiting for gender selection...');
            return;
        }
        
        if (this.textIndex < this.currentDialogue.length - 1) {
            this.textIndex++;
            console.log('Next dialogue:', this.textIndex, '/', this.currentDialogue.length - 1);
            this.startTypewriter();
        } else {
            console.log('Going to next step from:', this.currentStep);
            this.nextStep();
        }
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
    
    nextStep() {
        console.log('Next step called from:', this.currentStep);
        
        switch(this.currentStep) {
            case 'welcome':
                this.currentStep = 'gender';
                this.currentDialogue = this.dialogues.gender;
                this.textIndex = 0;
                console.log('Switching to gender selection');
                this.showGenderSelection();
                this.startTypewriter();
                break;
                
            case 'gender':
                if (!this.selectedGender) {
                    console.log('No gender selected, waiting...');
                    return;
                }
                this.currentStep = 'confirmation';
                this.currentDialogue = this.dialogues.confirmation;
                this.textIndex = 0;
                console.log('Switching to confirmation');
                this.hideGenderSelection();
                this.startTypewriter();
                break;
                
            case 'confirmation':
                console.log('Ending intro');
                this.endIntro();
                break;
                
            default:
                console.log('Unknown step:', this.currentStep);
        }
    }
    
    showGenderSelection() {
        const genderSelection = document.getElementById('gender-selection');
        if (genderSelection) {
            genderSelection.style.display = 'block';
            console.log('Gender selection shown');
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
            console.log('Gender selection hidden');
        }
    }
    
    startTypewriter() {
        const dialogueElement = document.getElementById('dialogue-text');
        if (!dialogueElement) {
            console.error('Dialogue element not found!');
            return;
        }
        
        this.currentText = '';
        this.lastTextUpdate = Date.now();
        this.isTyping = true;
        this.skipTyping = false;
        
        console.log('Starting typewriter for:', this.currentDialogue[this.textIndex]);
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
            console.log('Text skipped');
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
                console.log('Typing completed');
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
            
            this.profCtx.fillStyle = '#1a1a1a';
            this.profCtx.fillRect(0, 0, this.profCanvas.width, this.profCanvas.height);
            
            this.profCtx.fillStyle = '#4ecdc4';
            this.profCtx.font = `${this.profCanvas.width * 0.08}px "Press Start 2P"`;
            this.profCtx.textAlign = 'center';
            this.profCtx.fillText('PROF', this.profCanvas.width/2, this.profCanvas.height/2 - 40);
            this.profCtx.fillText('SILVER', this.profCanvas.width/2, this.profCanvas.height/2 + 40);
            
            this.profCtx.strokeStyle = '#4ecdc4';
            this.profCtx.lineWidth = 4;
            this.profCtx.strokeRect(20, 20, this.profCanvas.width - 40, this.profCanvas.height - 40);
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
        
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }

        if (this.clickHandler) {
            document.removeEventListener('click', this.clickHandler);
        }
        
        this.overlay.style.transition = 'opacity 1s ease-out';
        this.overlay.style.opacity = '0';
        
        setTimeout(() => {
            if (document.body.contains(this.overlay)) {
                document.body.removeChild(this.overlay);
            }
            
            // Rimuovi immediatamente il main menu se esiste
            if (this.game.mainMenu) {
                this.game.mainMenu.isActive = false;
                this.game.mainMenu = null;
            }
            
            this.showMinimap();
            this.game.startMainGame();
            console.log(`Benvenuto nel mondo di SilverStudio! Personaggio: ${this.selectedGender}`);
        }, 1000);
    }
}
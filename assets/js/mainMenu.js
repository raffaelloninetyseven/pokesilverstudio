window.MainMenu = class MainMenu {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        
        this.isActive = true;
        this.selectedOption = 0;
        this.animationTime = 0;
        this.logoLoaded = false;
        this.logoImg = null;
        
        this.stars = [];
        this.generateStars();
        this.loadLogo();
        
        this.menuOptions = [
            { text: 'NUOVA PARTITA', action: 'newGame' },
            { text: 'IMPOSTAZIONI', action: 'settings' },
            { text: 'CONTATTAMI', action: 'contact' }
        ];
        
        this.setupEventListeners();
        this.menuLoop();
    }
    
    loadLogo() {
        this.logoImg = new Image();
        this.logoImg.onload = () => {
            this.logoLoaded = true;
            console.log('Logo SilverStudio caricato');
        };
        this.logoImg.onerror = () => {
            console.warn('Logo non trovato, usando testo fallback');
            this.logoLoaded = false;
        };
        this.logoImg.src = 'assets/images/SSDM-white.png';
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
    
    setupEventListeners() {
        this.keyHandler = (e) => {
            if (!this.isActive) return;
            
            switch(e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
                    e.preventDefault();
                    break;
                    
                case 'ArrowDown':
                case 'KeyS':
                    this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
                    e.preventDefault();
                    break;
                    
                case 'Enter':
                case 'Space':
                    this.selectOption();
                    e.preventDefault();
                    break;
                    
                case 'Escape':
                    this.selectedOption = 0;
                    e.preventDefault();
                    break;
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
        
        this.canvas.addEventListener('click', (e) => {
            if (!this.isActive) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const clickY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            
            const menuStartY = CONFIG.CANVAS_HEIGHT * 0.65;
            const optionHeight = Math.min(50, CONFIG.CANVAS_HEIGHT * 0.08);
            
            this.menuOptions.forEach((option, index) => {
                const optionY = menuStartY + index * optionHeight;
                if (clickY >= optionY - 20 && clickY <= optionY + 20) {
                    this.selectedOption = index;
                    this.selectOption();
                }
            });
        });
    }
    
    selectOption() {
        const selectedAction = this.menuOptions[this.selectedOption].action;
        
        switch(selectedAction) {
            case 'newGame':
                this.startNewGame();
                break;
            case 'settings':
                this.openSettings();
                break;
            case 'contact':
                this.openContact();
                break;
        }
    }
    
    startNewGame() {
        this.fadeOut(() => {
            this.isActive = false;
            document.removeEventListener('keydown', this.keyHandler);
            this.game.startIntro();
        });
    }
    
    openSettings() {
        this.showSettingsPopup();
    }
    
    openContact() {
        window.open('pages/contact.html', '_blank');
    }
    
    showSettingsPopup() {
        const popup = document.createElement('div');
        popup.className = 'settings-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h3>IMPOSTAZIONI</h3>
                <div class="setting-item">
                    <label>Volume Effetti:</label>
                    <input type="range" min="0" max="100" value="50" id="sfx-volume">
                </div>
                <div class="setting-item">
                    <label>Schermo Intero:</label>
                    <input type="checkbox" id="fullscreen-toggle">
                </div>
                <div class="setting-item">
                    <label>Qualità Grafica:</label>
                    <select id="graphics-quality">
                        <option value="low">Bassa</option>
                        <option value="medium" selected>Media</option>
                        <option value="high">Alta</option>
                    </select>
                </div>
                <div class="popup-buttons">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()">CHIUDI</button>
                </div>
            </div>
        `;
        
        const popupStyles = document.createElement('style');
        popupStyles.textContent = `
            .settings-popup {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                font-family: 'Press Start 2P', monospace;
            }
            
            .popup-content {
                background: #1e3c72;
                border: 3px solid #fff;
                padding: clamp(20px, 5vw, 40px);
                color: #fff;
                min-width: clamp(300px, 50vw, 500px);
                max-width: 90vw;
            }
            
            .popup-content h3 {
                text-align: center;
                margin-bottom: 20px;
                font-size: clamp(12px, 3vw, 18px);
            }
            
            .setting-item {
                margin-bottom: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .setting-item label {
                font-size: clamp(8px, 2vw, 12px);
            }
            
            .setting-item input, .setting-item select {
                background: #000;
                color: #fff;
                border: 1px solid #fff;
                padding: 5px;
                font-family: inherit;
                font-size: clamp(6px, 1.5vw, 10px);
            }
            
            .popup-buttons {
                text-align: center;
                margin-top: 20px;
            }
            
            .popup-buttons button {
                background: #4ecdc4;
                border: none;
                color: #000;
                padding: 10px 20px;
                font-family: inherit;
                font-size: clamp(8px, 2vw, 12px);
                cursor: pointer;
            }
            
            .popup-buttons button:hover {
                background: #45b7d1;
            }
        `;
        
        document.head.appendChild(popupStyles);
        document.body.appendChild(popup);
    }
    
    fadeOut(callback) {
        let alpha = 1;
        const fadeInterval = setInterval(() => {
            alpha -= 0.05;
            if (alpha <= 0) {
                clearInterval(fadeInterval);
                callback();
            }
        }, 16);
    }
    
    update() {
        this.animationTime += 0.02;
        
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > CONFIG.CANVAS_HEIGHT) {
                star.y = -star.size;
                star.x = Math.random() * CONFIG.CANVAS_WIDTH;
            }
            
            star.brightness += star.twinkleSpeed;
            if (star.brightness > 1) star.brightness = 1;
            if (star.brightness < 0.3) star.brightness = 0.3;
        });
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        this.renderStars();
        this.renderLogo();
        this.renderMenu();
        this.renderVersion();
    }
    
    renderStars() {
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
    
    renderLogo() {
        const centerX = CONFIG.CANVAS_WIDTH / 2;
        const logoY = CONFIG.CANVAS_HEIGHT * 0.25;
        const logoScale = Math.min(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT) * 0.0005;
        
        if (this.logoLoaded && this.logoImg.complete) {
            this.ctx.save();
            this.ctx.shadowColor = '#4ecdc4';
            this.ctx.shadowBlur = 20;
            
            const logoWidth = Math.min(400, CONFIG.CANVAS_WIDTH * 0.6);
            const logoHeight = (this.logoImg.height / this.logoImg.width) * logoWidth;
            
            this.ctx.drawImage(
                this.logoImg,
                centerX - logoWidth / 2,
                logoY - logoHeight / 2,
                logoWidth,
                logoHeight
            );
            
            this.ctx.restore();
        } else {
            const titleSize = Math.min(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT) * 0.06;
            const subtitleSize = Math.min(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT) * 0.02;
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = `${titleSize}px "Press Start 2P"`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('SILVERSTUDIO', centerX, logoY);
            
            this.ctx.font = `${subtitleSize}px "Press Start 2P"`;
            this.ctx.fillStyle = '#4ecdc4';
            this.ctx.fillText('DIGITAL DESIGN & DEVELOPMENT', centerX, logoY + titleSize * 0.8);
        }
    }
    
    renderMenu() {
        const centerX = CONFIG.CANVAS_WIDTH / 2;
        const menuStartY = CONFIG.CANVAS_HEIGHT * 0.65;
        const optionHeight = Math.min(50, CONFIG.CANVAS_HEIGHT * 0.08);
        const fontSize = Math.min(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT) * 0.025;
        
        this.menuOptions.forEach((option, index) => {
            const y = menuStartY + index * optionHeight;
            const isSelected = index === this.selectedOption;
            
            if (isSelected) {
                const rectWidth = Math.min(400, CONFIG.CANVAS_WIDTH * 0.6);
                this.ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
                this.ctx.fillRect(centerX - rectWidth/2, y - 20, rectWidth, 40);
                
                this.ctx.fillStyle = '#4ecdc4';
                this.ctx.font = `${fontSize * 0.8}px "Press Start 2P"`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText('▶', centerX - rectWidth/2 + 30, y + 5);
                this.ctx.fillText('◀', centerX + rectWidth/2 - 30, y + 5);
            }
            
            this.ctx.fillStyle = isSelected ? '#fff' : '#aaa';
            this.ctx.font = `${fontSize}px "Press Start 2P"`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(option.text, centerX, y);
            
            if (isSelected) {
                const bounce = Math.sin(this.animationTime * 4) * 2;
                const lineWidth = Math.min(400, CONFIG.CANVAS_WIDTH * 0.6);
                this.ctx.fillStyle = '#4ecdc4';
                this.ctx.fillRect(centerX - lineWidth/2, y + 15 + bounce, lineWidth, 2);
            }
        });
        
        const instructionSize = Math.min(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT) * 0.015;
        this.ctx.fillStyle = '#666';
        this.ctx.font = `${instructionSize}px "Press Start 2P"`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('FRECCE/WASD - NAVIGA    ENTER/SPAZIO - SELEZIONA', centerX, CONFIG.CANVAS_HEIGHT - 30);
    }
    
    renderVersion() {
        const versionSize = Math.min(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT) * 0.015;
        this.ctx.fillStyle = '#333';
        this.ctx.font = `${versionSize}px "Press Start 2P"`;
        this.ctx.textAlign = 'right';
        this.ctx.fillText('v1.0.0', CONFIG.CANVAS_WIDTH - 10, CONFIG.CANVAS_HEIGHT - 10);
    }
    
    menuLoop() {
        if (!this.isActive) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.menuLoop());
    }
};
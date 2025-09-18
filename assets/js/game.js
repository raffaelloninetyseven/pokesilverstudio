window.Game = class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.gameStarted = false;
        this.inputManager = new InputManager();
        
        // Abilita modalità mobile se necessario
        if (this.isMobileDevice()) {
            this.enableMobileMode();
        }
        
        this.setupCanvas();
        this.handleResize();
        
        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.player = new Player(CONFIG.PLAYER_SPAWN_X, CONFIG.PLAYER_SPAWN_Y);
        
        this.map = new GameMap();
        this.buildings = new Buildings();
        this.ui = new UI();
        this.spriteManager = new SpriteManager();
        this.interiorManager = new InteriorManager(this);
        
        this.lastTime = 0;
        this.deltaTime = 0;
        this.assetsLoaded = false;
        
        this.showMainMenu();
        this.setupResizeListener();
        
        this.gameLoop();
    }
    
    setupCanvas() {
        this.ctx.imageSmoothingEnabled = false;
        this.canvas.style.imageRendering = 'pixelated';
        this.updateCanvasSize();
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }
    
    updateCanvasSize() {
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        // Dimensioni viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Su mobile, usa dimensioni precise del viewport
        if (this.isMobileDevice()) {
            this.canvas.width = viewportWidth * devicePixelRatio;
            this.canvas.height = viewportHeight * devicePixelRatio;
            
            this.canvas.style.width = viewportWidth + 'px';
            this.canvas.style.height = viewportHeight + 'px';
        } else {
            // Desktop - comportamento normale
            this.canvas.width = viewportWidth * devicePixelRatio;
            this.canvas.height = viewportHeight * devicePixelRatio;
            
            this.canvas.style.width = viewportWidth + 'px';
            this.canvas.style.height = viewportHeight + 'px';
        }
        
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        this.ctx.imageSmoothingEnabled = false;
        
        CONFIG.CANVAS_WIDTH = viewportWidth;
        CONFIG.CANVAS_HEIGHT = viewportHeight;
        
        // Rigenera stelle per intro se necessario
        if (this.intro && this.intro.generateStars) {
            this.intro.generateStars();
        }
    }
    
    handleResize() {
        this.updateCanvasSize();
        if (this.camera) {
            this.camera.canvasWidth = CONFIG.CANVAS_WIDTH;
            this.camera.canvasHeight = CONFIG.CANVAS_HEIGHT;
            this.camera.maxX = CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE - CONFIG.CANVAS_WIDTH;
            this.camera.maxY = CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE - CONFIG.CANVAS_HEIGHT;
        }
    }
    
    setupResizeListener() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    showMainMenu() {
        this.mainMenu = new MainMenu(this);
    }
    
    startIntro() {
        if (this.mainMenu) {
            this.mainMenu.destroy();
            this.mainMenu = null;
        }
        this.intro = new IntroManager(this);
    }
    
    startMainGame() {
        this.gameStarted = true;
        
        // Attiva modalità gioco per mobile
        if (this.inputManager && this.inputManager.setGameMode) {
            this.inputManager.setGameMode();
        }
        
        const minimap = document.getElementById('minimap');
        if (minimap) {
            minimap.style.display = 'block';
        }
        
        this.loadAssets();
    }
    
    async loadAssets() {
        try {
            await this.spriteManager.loadAllSprites();
            this.assetsLoaded = true;
            console.log('Assets caricati, gioco pronto!');
        } catch (error) {
            console.warn('Errore caricamento sprite, continuo con fallback:', error);
            this.assetsLoaded = true;
        }
    }

    enableMobileMode() {
        // Forza orientamento landscape per il gioco
        if (screen && screen.orientation && screen.orientation.lock) {
            try {
                screen.orientation.lock('landscape').catch(err => {
                    console.log('Orientation lock not supported or failed:', err);
                });
            } catch (e) {
                console.log('Screen orientation API not supported');
            }
        }
        
        // Aggiungi meta tag per viewport mobile se non esiste
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no, maximum-scale=1.0, minimum-scale=1.0';
        
        // Disabilita scroll elastico su iOS
        document.body.style.overscrollBehavior = 'none';
        document.documentElement.style.overscrollBehavior = 'none';
        
        console.log('Mobile mode enabled');
    }

    update(deltaTime) {
        if (!this.gameStarted || !this.assetsLoaded) return;

        this.map.update();
        
        this.player.update(this.inputManager, this.map);
        this.camera.follow(this.player);
        
        // Aggiorna interior manager se siamo in un interno
        if (this.interiorManager.currentInterior) {
            this.interiorManager.update(this.player);
        } else {
            this.buildings.update(this.player);
        }
        
        if (this.inputManager.wasPressed('Space') || this.inputManager.wasPressed('Enter')) {
            // Controlla se siamo in un interno e vicino alla porta
            if (this.interiorManager.canInteractWithExit()) {
                this.interiorManager.exitBuilding();
            } else if (!this.interiorManager.currentInterior) {
                // Siamo fuori, controlla interazione con edifici
                const interaction = this.buildings.interact();
                if (interaction) {
                    if (interaction.type === 'enter_building') {
                        this.interiorManager.enterBuilding(interaction.building);
                    } else {
                        this.ui.showDialog(interaction.message);
                    }
                }
            }
        }
        
        if (this.inputManager.wasPressed('Escape') && !this.interiorManager.currentInterior) {
            this.ui.toggleMenu();
        }
        
        this.ui.updateMinimap(this.player, this.camera, this.map);
    }

    render() {
        this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        if (!this.gameStarted) return;
        
        if (!this.assetsLoaded) {
            this.ctx.fillStyle = '#1e3c72';
            this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = `${Math.min(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT) * 0.03}px "Press Start 2P"`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('CARICAMENTO...', CONFIG.CANVAS_WIDTH/2, CONFIG.CANVAS_HEIGHT/2);
            return;
        }
        
        // Controlla se siamo in un interno
        if (this.interiorManager.currentInterior) {
            // Rendering dell'interno
            this.interiorManager.render(this.ctx, this.camera, this.spriteManager);
            this.player.render(this.ctx, this.camera, this.spriteManager);
        } else {
            // Rendering normale della mappa esterna
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
            
            this.map.render(this.ctx, this.camera, this.spriteManager);
            this.buildings.render(this.ctx, this.camera, this.spriteManager);
            this.player.render(this.ctx, this.camera, this.spriteManager);
        }
        
        this.renderUI();
    }
    
    renderUI() {
        const uiScale = Math.min(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT) * 0.001;
        const baseFontSize = Math.max(8, Math.min(16, 12 * uiScale));
        
        // Controlli solo se non siamo in un interno
        if (!this.interiorManager.currentInterior) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            
            // Dimensioni responsive per controlli
            const controlsWidth = Math.min(300, CONFIG.CANVAS_WIDTH * 0.4);
            const controlsHeight = Math.min(80, CONFIG.CANVAS_HEIGHT * 0.12);
            const controlsX = 10;
            const controlsY = CONFIG.CANVAS_HEIGHT - controlsHeight - 10;
            
            // Solo su desktop - su mobile ci sono i controlli touch
            if (!this.isMobileDevice()) {
                this.ctx.fillRect(controlsX, controlsY, controlsWidth, controlsHeight);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = `${baseFontSize}px "Press Start 2P"`;
                this.ctx.textAlign = 'left';
                this.ctx.fillText('WASD - Movimento', controlsX + 5, controlsY + 20);
                this.ctx.fillText('SPAZIO - Interagisci', controlsX + 5, controlsY + 35);
                this.ctx.fillText('ESC - Menu', controlsX + 5, controlsY + 50);
            }
        }
        
        // Messaggio di benvenuto
        if (this.gameStarted && this.assetsLoaded) {
            const genderText = CONFIG.PLAYER_GENDER === 'female' ? 'Benvenuta' : 'Benvenuto';
            const welcomeWidth = Math.min(280, CONFIG.CANVAS_WIDTH * 0.35);
            const welcomeHeight = 50;
            const welcomeX = CONFIG.CANVAS_WIDTH - welcomeWidth - 10;
            const welcomeY = 10;
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(welcomeX, welcomeY, welcomeWidth, welcomeHeight);
            
            this.ctx.fillStyle = '#4ecdc4';
            this.ctx.font = `${baseFontSize}px "Press Start 2P"`;
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`${genderText} nel mondo`, welcomeX + 5, welcomeY + 20);
            this.ctx.fillText('di SilverStudio!', welcomeX + 5, welcomeY + 35);
        }
        
        // Debug info (solo su desktop)
        if (window.debugMode && !this.isMobileDevice()) {
            const debugWidth = 200;
            const debugHeight = 120;
            const debugX = CONFIG.CANVAS_WIDTH - debugWidth - 10;
            const debugY = 70;
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(debugX, debugY, debugWidth, debugHeight);
            
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = `${Math.max(8, baseFontSize - 2)}px "Press Start 2P"`;
            this.ctx.textAlign = 'left';
            const playerPos = this.player.getTilePosition();
            this.ctx.fillText(`X: ${playerPos.x}`, debugX + 5, debugY + 20);
            this.ctx.fillText(`Y: ${playerPos.y}`, debugX + 5, debugY + 35);
            this.ctx.fillText(`FPS: ${Math.round(1000/this.deltaTime)}`, debugX + 5, debugY + 50);
            this.ctx.fillText(`${CONFIG.CANVAS_WIDTH}x${CONFIG.CANVAS_HEIGHT}`, debugX + 5, debugY + 65);
            this.ctx.fillText(`Gender: ${CONFIG.PLAYER_GENDER}`, debugX + 5, debugY + 80);
            this.ctx.fillText(`Mobile: ${this.isMobileDevice()}`, debugX + 5, debugY + 95);
        }
    }
    
    gameLoop(currentTime = 0) {
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.gameStarted) {
            this.update(this.deltaTime);
            this.render();
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    enableDebugMode() {
        window.debugMode = true;
        console.log('Debug mode attivato');
    }
    
    disableDebugMode() {
        window.debugMode = false;
        console.log('Debug mode disattivato');
    }
    
    teleportPlayer(x, y) {
        this.player.x = x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        this.player.y = y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        console.log(`Player teletrasportato a: ${x}, ${y}`);
    }
}
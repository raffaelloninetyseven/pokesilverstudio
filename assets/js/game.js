window.Game = class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.gameStarted = false;
        this.inputManager = new InputManager();
        
        this.setupCanvas();
        this.handleResize();
        
        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.player = new Player(20, 20);
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
    
    updateCanvasSize() {
        const devicePixelRatio = window.devicePixelRatio || 1;
        
        // Forza le dimensioni del viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        this.canvas.width = viewportWidth * devicePixelRatio;
        this.canvas.height = viewportHeight * devicePixelRatio;
        
        this.canvas.style.width = viewportWidth + 'px';
        this.canvas.style.height = viewportHeight + 'px';
        
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
        this.ctx.imageSmoothingEnabled = false;
        
        CONFIG.CANVAS_WIDTH = viewportWidth;
        CONFIG.CANVAS_HEIGHT = viewportHeight;
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
    
    update(deltaTime) {
        if (!this.gameStarted || !this.assetsLoaded) return;
        
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
            // Rendering dell'interno - NON disegnare mappa esterna
            this.map.render(this.ctx, this.camera, this.spriteManager);
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
        const baseFontSize = Math.max(8, 12 * uiScale);
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const controlsWidth = Math.min(250, CONFIG.CANVAS_WIDTH * 0.3);
        const controlsHeight = Math.min(60, CONFIG.CANVAS_HEIGHT * 0.1);
        this.ctx.fillRect(10, CONFIG.CANVAS_HEIGHT - controlsHeight - 10, controlsWidth, controlsHeight);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${baseFontSize}px "Press Start 2P"`;
        this.ctx.textAlign = 'left';
        this.ctx.fillText('WASD - Movimento', 15, CONFIG.CANVAS_HEIGHT - controlsHeight + 15);
        this.ctx.fillText('SPACE - Interagisci', 15, CONFIG.CANVAS_HEIGHT - controlsHeight + 30);
        this.ctx.fillText('ESC - Menu', 15, CONFIG.CANVAS_HEIGHT - controlsHeight + 45);
        
        if (this.gameStarted && this.assetsLoaded) {
            const genderText = CONFIG.PLAYER_GENDER === 'female' ? 'Benvenuta' : 'Benvenuto';
            const welcomeWidth = Math.min(220, CONFIG.CANVAS_WIDTH * 0.25);
            const welcomeHeight = 40;
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(CONFIG.CANVAS_WIDTH - welcomeWidth - 10, 10, welcomeWidth, welcomeHeight);
            
            this.ctx.fillStyle = '#4ecdc4';
            this.ctx.font = `${baseFontSize}px "Press Start 2P"`;
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`${genderText} nel mondo`, CONFIG.CANVAS_WIDTH - welcomeWidth - 5, 25);
            this.ctx.fillText('di SilverStudio!', CONFIG.CANVAS_WIDTH - welcomeWidth - 5, 40);
        }
        
        if (window.debugMode) {
            const debugWidth = 180;
            const debugHeight = 100;
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(CONFIG.CANVAS_WIDTH - debugWidth - 10, 60, debugWidth, debugHeight);
            
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = `${baseFontSize}px "Press Start 2P"`;
            this.ctx.textAlign = 'left';
            const playerPos = this.player.getTilePosition();
            this.ctx.fillText(`X: ${playerPos.x}`, CONFIG.CANVAS_WIDTH - debugWidth - 5, 80);
            this.ctx.fillText(`Y: ${playerPos.y}`, CONFIG.CANVAS_WIDTH - debugWidth - 5, 95);
            this.ctx.fillText(`FPS: ${Math.round(1000/this.deltaTime)}`, CONFIG.CANVAS_WIDTH - debugWidth - 5, 110);
            this.ctx.fillText(`Res: ${CONFIG.CANVAS_WIDTH}x${CONFIG.CANVAS_HEIGHT}`, CONFIG.CANVAS_WIDTH - debugWidth - 5, 125);
            this.ctx.fillText(`Gender: ${CONFIG.PLAYER_GENDER}`, CONFIG.CANVAS_WIDTH - debugWidth - 5, 140);
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
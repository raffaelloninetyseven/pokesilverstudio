window.InteriorManager = class InteriorManager {
    constructor(game) {
        this.game = game;
        this.currentInterior = null;
        this.exteriorPlayerPos = { x: 0, y: 0 };
        this.currentBuilding = null; // Traccia l'edificio corrente
        this.nearExit = false; // Traccia se siamo vicino alla porta
        
        this.interiorMaps = {
            projects_interior: this.createProjectsInterior(),
            skills_interior: this.createSkillsInterior(),
            about_interior: this.createAboutInterior(),
            contact_interior: this.createContactInterior(),
            casino_interior: this.createCasinoInterior()
        };
    }
    
    // Nuovo metodo per controllare vicinanza alla porta
    update(player) {
        if (!this.currentInterior) return;
        
        const interior = this.game.map;
        const doorX = 7 * CONFIG.TILE_SIZE;
        const doorY = (interior.height - 1) * CONFIG.TILE_SIZE;
        
        // Calcola distanza dal player alla porta
        const distance = Math.sqrt(
            Math.pow(player.x - doorX, 2) + Math.pow(player.y - doorY, 2)
        );
        
        // Se il player è vicino alla porta (entro 1.5 tile)
        this.nearExit = distance <= (CONFIG.TILE_SIZE * 1.5);
    }
    
    // Modifica per interazione con porta
    canInteractWithExit() {
        return this.currentInterior && this.nearExit;
    }
    
    enterBuilding(building) {
        this.exteriorPlayerPos = {
            x: this.game.player.x,
            y: this.game.player.y
        };
        
        this.currentInterior = building.interiorMap;
        this.currentBuilding = building; // Salva l'edificio corrente
        this.game.map = this.interiorMaps[building.interiorMap];
        
        this.game.player.x = 7 * CONFIG.TILE_SIZE;
        this.game.player.y = (this.game.map.height - 3) * CONFIG.TILE_SIZE;
        
        this.game.camera.followSpeed = 0;
    }
    
    exitBuilding() {
        if (!this.currentInterior || !this.currentBuilding) return;
        
        // Salva posizione di uscita basata sull'edificio
        const building = this.currentBuilding;
        const exitX = building.entrance.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const exitY = (building.entrance.y + 1) * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2; // Un tile sotto l'entrata
        
        // Ripristina mappa esterna
        this.game.map = new GameMap();
        this.currentInterior = null;
        this.currentBuilding = null;
        this.nearExit = false;
        
        // Riabilita camera
        this.game.camera.followSpeed = 0.08;
        
        // Posiziona player fuori dall'edificio
        this.game.player.x = exitX;
        this.game.player.y = exitY;
    }
    
    // Aggiorna il rendering per mostrare indicatore interazione
    renderInterior(ctx, interior, title, floorColor = '#666', wallColor = '#333') {
        // Overlay nero su tutto lo schermo
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        const buildingPixelWidth = interior.width * CONFIG.TILE_SIZE;
        const buildingPixelHeight = interior.height * CONFIG.TILE_SIZE;
        const offsetX = (CONFIG.CANVAS_WIDTH - buildingPixelWidth) / 2;
        const offsetY = (CONFIG.CANVAS_HEIGHT - buildingPixelHeight) / 2;
        
        // Disegna l'edificio centrato
        for (let y = 0; y < interior.height; y++) {
            for (let x = 0; x < interior.width; x++) {
                const screenX = offsetX + (x * CONFIG.TILE_SIZE);
                const screenY = offsetY + (y * CONFIG.TILE_SIZE);
                
                if (x === 0 || x === interior.width-1 || y === 0 || y === interior.height-1) {
                    ctx.fillStyle = wallColor;
                    ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                    
                    ctx.strokeStyle = '#555';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                } else {
                    ctx.fillStyle = floorColor;
                    ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                    
                    const patternColor = this.lightenColor(floorColor, 20);
                    ctx.fillStyle = patternColor;
                    ctx.fillRect(screenX + 8, screenY + 8, 16, 16);
                }
            }
        }
        
        // Porta d'uscita
        const doorX = offsetX + (7 * CONFIG.TILE_SIZE);
        const doorY = offsetY + ((interior.height-1) * CONFIG.TILE_SIZE);
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(doorX, doorY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        
        // Maniglia porta
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(doorX + 24, doorY + 16, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Indicatore interazione se vicino alla porta
        if (this.nearExit) {
            const time = Date.now() * 0.005;
            const bounce = Math.sin(time) * 3;
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('▲', doorX + CONFIG.TILE_SIZE/2, doorY - 20 + bounce);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '8px "Press Start 2P"';
            ctx.fillText('ESCI (SPACE)', doorX + CONFIG.TILE_SIZE/2, doorY - 35 + bounce);
        }
        
        // Titolo edificio
        ctx.fillStyle = '#fff';
        ctx.font = '16px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(title, CONFIG.CANVAS_WIDTH / 2, offsetY - 20);
        
        this.addInteriorDecorations(ctx, interior, offsetX, offsetY);
    }
    
    // Funzione per schiarire i colori
    lightenColor(color, amount) {
        const colorInt = parseInt(color.replace('#', ''), 16);
        const r = Math.min(255, (colorInt >> 16) + amount);
        const g = Math.min(255, ((colorInt >> 8) & 0x00FF) + amount);
        const b = Math.min(255, (colorInt & 0x0000FF) + amount);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
    
    // Decorazioni specifiche per ogni interno
    addInteriorDecorations(ctx, interior, offsetX, offsetY) {
        if (interior.type === 'projects') {
            // Computer e schermi per il centro sviluppo
            ctx.fillStyle = '#222';
            ctx.fillRect(offsetX + (3 * CONFIG.TILE_SIZE), offsetY + (2 * CONFIG.TILE_SIZE), CONFIG.TILE_SIZE, CONFIG.TILE_SIZE/2);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(offsetX + (3 * CONFIG.TILE_SIZE) + 4, offsetY + (2 * CONFIG.TILE_SIZE) + 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE/2 - 8);
            
        } else if (interior.type === 'skills') {
            // Libri per il laboratorio skills
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(offsetX + (2 * CONFIG.TILE_SIZE), offsetY + (3 * CONFIG.TILE_SIZE), CONFIG.TILE_SIZE/2, CONFIG.TILE_SIZE);
            ctx.fillStyle = '#FF6347';
            ctx.fillRect(offsetX + (2 * CONFIG.TILE_SIZE) + CONFIG.TILE_SIZE/2, offsetY + (3 * CONFIG.TILE_SIZE), CONFIG.TILE_SIZE/2, CONFIG.TILE_SIZE);
            
        } else if (interior.type === 'about') {
            // Piante per lo studio personale
            ctx.fillStyle = '#654321';
            ctx.fillRect(offsetX + (interior.width-3) * CONFIG.TILE_SIZE, offsetY + (2 * CONFIG.TILE_SIZE), CONFIG.TILE_SIZE/3, CONFIG.TILE_SIZE);
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(offsetX + (interior.width-3) * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE/6, offsetY + (2 * CONFIG.TILE_SIZE), CONFIG.TILE_SIZE/3, 0, Math.PI * 2);
            ctx.fill();
            
        } else if (interior.type === 'contact') {
            // Telefono per l'ufficio contatti
            ctx.fillStyle = '#000';
            ctx.fillRect(offsetX + (4 * CONFIG.TILE_SIZE), offsetY + (3 * CONFIG.TILE_SIZE), CONFIG.TILE_SIZE/2, CONFIG.TILE_SIZE/3);
        } else if (interior.type === 'casino') {
            // Slot machines
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 4; j++) {
                    const x = offsetX + (3 + i * 4) * CONFIG.TILE_SIZE;
                    const y = offsetY + (3 + j * 2) * CONFIG.TILE_SIZE;
                    
                    // Slot machine body
                    ctx.fillStyle = '#444';
                    ctx.fillRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                    
                    // Screen
                    ctx.fillStyle = '#000';
                    ctx.fillRect(x + 4, y + 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE/2);
                    
                    // Symbols (random)
                    ctx.fillStyle = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'][Math.floor(Math.random() * 4)];
                    ctx.fillRect(x + 8, y + 8, 6, 6);
                    ctx.fillRect(x + 14, y + 8, 6, 6);
                    ctx.fillRect(x + 20, y + 8, 6, 6);
                }
            }
        }
    }
    
    // Interni semplificati - ora usano solo la struttura base
    createProjectsInterior() {
        const interior = this.createBaseInterior(15, 12, 'projects');
        interior.render = (ctx, camera, spriteManager) => {
            this.renderInterior(ctx, interior, 'CENTRO SVILUPPO', '#555', '#333');
        };
        return interior;
    }
    
    createSkillsInterior() {
        const interior = this.createBaseInterior(12, 10, 'skills');
        interior.render = (ctx, camera, spriteManager) => {
            this.renderInterior(ctx, interior, 'LABORATORIO SKILLS', '#4a90e2', '#2c5282');
        };
        return interior;
    }
    
    createAboutInterior() {
        const interior = this.createBaseInterior(14, 12, 'about');
        interior.render = (ctx, camera, spriteManager) => {
            this.renderInterior(ctx, interior, 'STUDIO PERSONALE', '#2d5016', '#1a3009');
        };
        return interior;
    }
    
    createContactInterior() {
        const interior = this.createBaseInterior(10, 8, 'contact');
        interior.render = (ctx, camera, spriteManager) => {
            this.renderInterior(ctx, interior, 'UFFICIO CONTATTI', '#96ceb4', '#6b9080');
        };
        return interior;
    }
    
    // Funzione base per creare struttura interno
    createBaseInterior(width, height, type) {
        const interior = {
            tiles: [],
            decorations: [],
            width: width,
            height: height,
            type: type,
            canMoveTo: (x, y, size) => {
                const tileX = Math.floor(x / CONFIG.TILE_SIZE);
                const tileY = Math.floor(y / CONFIG.TILE_SIZE);
                
                if (tileX < 1 || tileX >= interior.width-1 || tileY < 1 || tileY >= interior.height-1) {
                    return false;
                }
                
                if (tileX === 7 && tileY === interior.height-1) {
                    return true;
                }
                
                return true;
            }
        };
        
        // Inizializza tiles
        for (let y = 0; y < height; y++) {
            interior.tiles[y] = [];
            for (let x = 0; x < width; x++) {
                interior.tiles[y][x] = 'stone';
            }
        }
        
        return interior;
    }

    createCasinoInterior() {
        const interior = this.createBaseInterior(18, 14, 'casino');
        interior.render = (ctx, camera, spriteManager) => {
            this.renderInterior(ctx, interior, 'LUCKY SKILLS CASINO', '#660000', '#330000');
        };
        return interior;
    }
    
    enterBuilding(building) {
        this.exteriorPlayerPos = {
            x: this.game.player.x,
            y: this.game.player.y
        };
        
        this.currentInterior = building.interiorMap;
        this.game.map = this.interiorMaps[building.interiorMap];
        
        // Posiziona il player in coordinate relative all'interno (0,0 è l'angolo dell'interno)
        this.game.player.x = 7 * CONFIG.TILE_SIZE; // Centro orizzontale
        this.game.player.y = (this.game.map.height - 3) * CONFIG.TILE_SIZE; // Vicino alla porta
        
        // Disabilita il movimento della camera negli interni
        this.game.camera.followSpeed = 0;
    }

    exitBuilding() {
        if (!this.currentInterior) return;
        
        // Ripristina mappa esterna
        this.game.map = new GameMap();
        this.currentInterior = null;
        
        // Riabilita camera
        this.game.camera.followSpeed = 0.08;
        
        // Riposiziona player all'esterno
        this.game.player.x = this.exteriorPlayerPos.x;
        this.game.player.y = this.exteriorPlayerPos.y;
    }
};
window.GameMap = class GameMap {
    constructor() {
        this.tiles = [];
        this.decorations = [];
        this.tileVariations = [];
        this.animationTimer = 0;
        this.generateMap();
    }

    update() {
        this.animationTimer++;
        if (this.animationTimer > 10000) { // Reset per evitare overflow
            this.animationTimer = 0;
        }
    }
    
    generateMap() {
        this.tiles = [];
        this.tileVariations = []; // Nuovo array per salvare le variazioni
        
        // Genera mappa e variazioni UNA VOLTA
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            this.tiles[y] = [];
            this.tileVariations[y] = [];
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                this.tiles[y][x] = 'grass-flowers';
                // Salva la variazione una volta sola
                this.tileVariations[y][x] = Math.random() > 0.6 ? 1 : 0;
            }
        }
        
        this.createTreeBorder();
        this.createMainRoads(); 
        this.createSpecialAreas();
        this.generateTreesAndRocks();
    }

    createTreeBorder() {
        // Alberi su tutti i bordi per impedire l'uscita
        for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
            for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
                if (x === 0 || x === CONFIG.MAP_WIDTH-1 || y === 0 || y === CONFIG.MAP_HEIGHT-1) {
                    this.decorations.push({ x, y, type: 'tree' });
                }
            }
        }
        
        // Entrate - Route 7 equivalente (est) e Route 16 equivalente (ovest)
        // Cancella gli alberi per le entrate
        const eastEntrance = { x: CONFIG.MAP_WIDTH-1, y: 20 };
        const westEntrance = { x: 0, y: 18 };
        
        // Rimuovi alberi per creare entrate
        this.decorations = this.decorations.filter(dec => 
            !(dec.x === eastEntrance.x && dec.y >= eastEntrance.y-1 && dec.y <= eastEntrance.y+1) &&
            !(dec.x === westEntrance.x && dec.y >= westEntrance.y-1 && dec.y <= westEntrance.y+1)
        );
    }

    createMainRoads() {
        // Strada orizzontale principale (come in Celadon)
        for (let x = 1; x < CONFIG.MAP_WIDTH-1; x++) {
            this.tiles[20][x] = 'path';
            this.tiles[21][x] = 'path';
        }
        
        // Strada verticale principale
        for (let y = 8; y < CONFIG.MAP_HEIGHT-2; y++) {
            this.tiles[y][22] = 'path';
            this.tiles[y][23] = 'path';
        }
        
        // Strada per raggiungere la Skills Gym (sud)
        for (let y = 22; y < 35; y++) {
            this.tiles[y][9] = 'path';
        }
        
        // Strada per il Silver Department
        for (let x = 9; x < 22; x++) {
            this.tiles[16][x] = 'path';
        }
        
        // Strada per la Mansion
        for (let x = 24; x < 38; x++) {
            this.tiles[14][x] = 'path';
        }
    }

    createSpecialAreas() {
        // Piccolo laghetto decorativo (come la fontana di Celadon)
        for (let y = 6; y < 10; y++) {
            for (let x = 26; x < 30; x++) {
                this.tiles[y][x] = 'water';
            }
        }
        
        // Piazza centrale con pietra
        for (let y = 18; y < 24; y++) {
            for (let x = 20; x < 26; x++) {
                if (this.tiles[y][x] !== 'path') {
                    this.tiles[y][x] = 'stone';
                }
            }
        }
    }
    
    createWaterFeatures() {
        // Piccolo lago nell'angolo
        for (let y = 35; y < 42; y++) {
            for (let x = 5; x < 12; x++) {
                if (this.isValidTile(x, y)) {
                    this.tiles[y][x] = 'water';
                }
            }
        }
        
        // Ponte sul lago
        for (let x = 8; x < 10; x++) {
            this.tiles[38][x] = 'bridge';
        }
    }

    createPaths() {
        for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
            this.tiles[15][x] = 'path';
            this.tiles[16][x] = 'path';
        }
        
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            this.tiles[y][20] = 'path';
            this.tiles[y][21] = 'path';
        }
        
        CONFIG.BUILDINGS.forEach(building => {
            const entranceX = building.entrance.x;
            const entranceY = building.entrance.y;
            
            if (entranceY < 15) {
                for (let y = entranceY; y <= 15; y++) {
                    if (this.isValidTile(entranceX, y)) {
                        this.tiles[y][entranceX] = 'path';
                    }
                }
            } else if (entranceY > 16) {
                for (let y = 16; y <= entranceY; y++) {
                    if (this.isValidTile(entranceX, y)) {
                        this.tiles[y][entranceX] = 'path';
                    }
                }
            }
            
            if (entranceX < 20) {
                for (let x = entranceX; x <= 20; x++) {
                    if (this.isValidTile(x, entranceY)) {
                        this.tiles[entranceY][x] = 'path';
                    }
                }
            } else if (entranceX > 21) {
                for (let x = 21; x <= entranceX; x++) {
                    if (this.isValidTile(x, entranceY)) {
                        this.tiles[entranceY][x] = 'path';
                    }
                }
            }
        });
    }

    generateTreesAndRocks() {
        this.decorations = [];
        
        for (let i = 0; i < 100; i++) { // Ridotto da 200 a 100
            const x = Utils.randomInt(0, CONFIG.MAP_WIDTH - 1);
            const y = Utils.randomInt(0, CONFIG.MAP_HEIGHT - 1);
            
            if (this.canPlaceDecoration(x, y)) {
                const rand = Math.random();
                let type;
                
                if (rand < 0.8) {
                    type = 'tree';
                } else {
                    type = 'rock';
                }
                // Niente più flower1 e flower2
                
                this.decorations.push({ x, y, type });
            }
        }
    }
    
    canPlaceDecoration(x, y) {
        if (!this.isValidTile(x, y)) return false;
        if (this.tiles[y][x] === 'path') return false;
        
        return !CONFIG.BUILDINGS.some(building => {
            return x >= building.x - 1 && x <= building.x + building.width &&
                   y >= building.y - 1 && y <= building.y + building.height;
        });
    }
    
    isValidTile(x, y) {
        return x >= 0 && x < CONFIG.MAP_WIDTH && y >= 0 && y < CONFIG.MAP_HEIGHT;
    }
    
    canMoveTo(x, y, size) {
        const halfSize = size / 2;
        const left = Math.floor((x - halfSize) / CONFIG.TILE_SIZE);
        const right = Math.floor((x + halfSize) / CONFIG.TILE_SIZE);
        const top = Math.floor((y - halfSize) / CONFIG.TILE_SIZE);
        const bottom = Math.floor((y + halfSize) / CONFIG.TILE_SIZE);
        
        if (left < 0 || right >= CONFIG.MAP_WIDTH || top < 0 || bottom >= CONFIG.MAP_HEIGHT) {
            return false;
        }
        
        for (let building of CONFIG.BUILDINGS) {
            if (Utils.rectCollision(
                x - halfSize, y - halfSize, size, size,
                building.x * CONFIG.TILE_SIZE, building.y * CONFIG.TILE_SIZE,
                building.width * CONFIG.TILE_SIZE, building.height * CONFIG.TILE_SIZE
            )) {
                return false;
            }
        }
        
        for (let decoration of this.decorations) {
            if (decoration.type === 'tree' || decoration.type === 'rock') {
                if (Utils.rectCollision(
                    x - halfSize, y - halfSize, size, size,
                    decoration.x * CONFIG.TILE_SIZE + 4, decoration.y * CONFIG.TILE_SIZE + 4,
                    CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 8
                )) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    render(ctx, camera, spriteManager) {
        const startX = Math.floor(camera.x / CONFIG.TILE_SIZE);
        const endX = Math.min(startX + Math.ceil(camera.canvasWidth / CONFIG.TILE_SIZE) + 1, CONFIG.MAP_WIDTH);
        const startY = Math.floor(camera.y / CONFIG.TILE_SIZE);
        const endY = Math.min(startY + Math.ceil(camera.canvasHeight / CONFIG.TILE_SIZE) + 1, CONFIG.MAP_HEIGHT);
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                this.renderTile(ctx, camera, x, y, spriteManager);
            }
        }
        
        this.decorations.forEach(decoration => {
            if (camera.isVisible(decoration.x * CONFIG.TILE_SIZE, decoration.y * CONFIG.TILE_SIZE)) {
                this.renderDecoration(ctx, camera, decoration, spriteManager);
            }
        });
    }
    
    renderTile(ctx, camera, x, y, spriteManager) {
        const screenPos = camera.worldToScreen(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE);
        const tile = this.tiles[y][x];
        
        let spriteDrawn = false;
        
        if (tile === 'water' && spriteManager) {
            // Usa l'animazione per l'acqua
            spriteDrawn = spriteManager.drawAnimatedTile(ctx, tile, screenPos.x, screenPos.y, this.animationTimer);
        } else if (tile === 'grass-flowers' && spriteManager) {
            const variation = this.tileVariations[y][x];
            spriteDrawn = spriteManager.drawVariatedTile(ctx, tile, screenPos.x, screenPos.y, variation);
        } else {
            spriteDrawn = spriteManager && spriteManager.drawTile(ctx, tile, screenPos.x, screenPos.y);
        }
        
        if (!spriteDrawn) {
            // Fallback per colori
            if (tile === 'grass-flowers') {
                ctx.fillStyle = '#4a7c47';
            } else if (tile === 'water') {
                ctx.fillStyle = '#4a90e2';
            } else {
                ctx.fillStyle = CONFIG.COLORS[tile.toUpperCase()] || '#4a7c47';
            }
            ctx.fillRect(screenPos.x, screenPos.y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        }
    }
    
    renderDecoration(ctx, camera, decoration, spriteManager) {
        const screenPos = camera.worldToScreen(decoration.x * CONFIG.TILE_SIZE, decoration.y * CONFIG.TILE_SIZE);
        
        // Prova a usare sprite, altrimenti fallback
        const spriteDrawn = spriteManager && spriteManager.drawTile(ctx, decoration.type, screenPos.x, screenPos.y);
        
        if (!spriteDrawn) {
            // Fallback rendering originale
            switch(decoration.type) {
                case 'tree':
                    ctx.fillStyle = CONFIG.COLORS.TREE_TRUNK;
                    ctx.fillRect(screenPos.x + 12, screenPos.y + 20, 8, 12);
                    
                    ctx.fillStyle = CONFIG.COLORS.TREE;
                    ctx.beginPath();
                    ctx.arc(screenPos.x + 16, screenPos.y + 16, 12, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 'flower1':
                    ctx.fillStyle = CONFIG.COLORS.FLOWER_1;
                    ctx.beginPath();
                    ctx.arc(screenPos.x + 16, screenPos.y + 16, 3, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 'flower2':
                    ctx.fillStyle = CONFIG.COLORS.FLOWER_2;
                    ctx.beginPath();
                    ctx.arc(screenPos.x + 16, screenPos.y + 16, 3, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 'rock':
                    ctx.fillStyle = CONFIG.COLORS.ROCK;
                    ctx.fillRect(screenPos.x + 8, screenPos.y + 8, 16, 16);
                    break;
            }
        }
    }
}
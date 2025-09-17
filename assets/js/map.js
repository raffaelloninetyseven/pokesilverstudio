window.GameMap = class GameMap {
    constructor() {
        this.tiles = [];
        this.decorations = [];
        this.generateMap();
    }
    
    generateMap() {
        this.tiles = [];
        
        // Genera base con più varietà
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                const rand = Math.random();
                
                // Zone diverse per varietà visiva
                if (y < 5 || y > CONFIG.MAP_HEIGHT - 5) {
                    this.tiles[y][x] = rand > 0.7 ? 'dark_grass' : 'grass';
                } else if (x < 5 || x > CONFIG.MAP_WIDTH - 5) {
                    this.tiles[y][x] = rand > 0.6 ? 'sand' : 'grass';
                } else {
                    this.tiles[y][x] = rand > 0.65 ? 'dark_grass' : 'grass';
                }
            }
        }
        
        this.createPaths();
        this.createWaterFeatures();
        this.generateDecorations();
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
    
    generateDecorations() {
        this.decorations = [];
        
        for (let i = 0; i < 200; i++) {
            const x = Utils.randomInt(0, CONFIG.MAP_WIDTH - 1);
            const y = Utils.randomInt(0, CONFIG.MAP_HEIGHT - 1);
            
            if (this.canPlaceDecoration(x, y)) {
                const rand = Math.random();
                let type;
                
                if (rand < 0.7) {
                    type = 'tree';
                } else if (rand < 0.85) {
                    type = 'flower1';
                } else if (rand < 0.95) {
                    type = 'flower2';
                } else {
                    type = 'rock';
                }
                
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
        
        // Prova a usare sprite, altrimenti fallback colori
        const spriteDrawn = spriteManager && spriteManager.drawTile(ctx, tile, screenPos.x, screenPos.y);
        
        if (!spriteDrawn) {
            ctx.fillStyle = CONFIG.COLORS[tile.toUpperCase()];
            ctx.fillRect(screenPos.x, screenPos.y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            
            if (tile === 'path') {
                ctx.fillStyle = '#c4a484';
                ctx.fillRect(screenPos.x + 2, screenPos.y + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);
            }
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
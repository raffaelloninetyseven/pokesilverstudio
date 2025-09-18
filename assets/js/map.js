// Mappa identica pixel per pixel - sostituisci assets/js/map.js

window.GameMap = class GameMap {
    constructor() {
        this.tiles = [];
        this.decorations = [];
        this.animationTimer = 0;
        this.createExactMap();
    }

    update() {
        this.animationTimer++;
        if (this.animationTimer > 10000) {
            this.animationTimer = 0;
        }
    }
    
    createExactMap() {
        // Inizializza con erba
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                this.tiles[y][x] = 'grass-flowers';
            }
        }

        this.createPixelPerfectLayout();
    }

    createPixelPerfectLayout() {
        // BORDO COMPLETO DI ALBERI
        for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
            for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
                if (x === 0 || x === CONFIG.MAP_WIDTH-1 || y === 0 || y === CONFIG.MAP_HEIGHT-1) {
                    this.decorations.push({ x, y, type: 'tree' });
                }
            }
        }

        // ENTRATE
        // Entrata ovest (coordinate 0,11-12)
        this.decorations = this.decorations.filter(dec => 
            !(dec.x === 0 && (dec.y === 11 || dec.y === 12))
        );
        
        // Entrata est (coordinate 49,11-12)
        this.decorations = this.decorations.filter(dec => 
            !(dec.x === CONFIG.MAP_WIDTH-1 && (dec.y === 11 || dec.y === 12))
        );

        // STRADE PRINCIPALI
        
        // Strada orizzontale nord (y=11-12, attraversa tutto)
        for (let x = 1; x < CONFIG.MAP_WIDTH-1; x++) {
            this.tiles[11][x] = 'path';
            this.tiles[12][x] = 'path';
        }
        
        // Strada verticale ovest (x=15-16, da y=13 a y=25)
        for (let y = 13; y <= 25; y++) {
            this.tiles[y][15] = 'path';
            this.tiles[y][16] = 'path';
        }
        
        // Strada verticale centro (x=24-25, da y=13 a y=19)
        for (let y = 13; y <= 19; y++) {
            this.tiles[y][24] = 'path';
            this.tiles[y][25] = 'path';
        }
        
        // Strada verticale est (x=32-33, da y=13 a y=25)
        for (let y = 13; y <= 25; y++) {
            this.tiles[y][32] = 'path';
            this.tiles[y][33] = 'path';
        }
        
        // Strada orizzontale sud (y=25-26, da x=15 a x=33)
        for (let x = 15; x <= 33; x++) {
            this.tiles[25][x] = 'path';
            this.tiles[26][x] = 'path';
        }

        // AREE ACQUA
        
        // Fontana centrale (x=26-29, y=15-18)
        for (let y = 15; y <= 18; y++) {
            for (let x = 26; x <= 29; x++) {
                this.tiles[y][x] = 'water';
            }
        }
        
        // Stagno nord-ovest (x=8-11, y=4-7)
        for (let y = 4; y <= 7; y++) {
            for (let x = 8; x <= 11; x++) {
                this.tiles[y][x] = 'water';
            }
        }
        
        // Stagno sud (x=20-23, y=29-32)
        for (let y = 29; y <= 32; y++) {
            for (let x = 20; x <= 23; x++) {
                this.tiles[y][x] = 'water';
            }
        }

        // EDIFICI IDENTICI ALL'IMMAGINE
        CONFIG.BUILDINGS = [
            // Edificio grande blu nord-ovest (Department Store equivalent)
            {
                x: 3, y: 2, width: 8, height: 8,
                type: 'projects',
                name: 'Silver Department',
                entrance: { x: 7, y: 10 },
                color: '#4169E1',
                hasInterior: true,
                interiorMap: 'projects_interior'
            },
            
            // Edificio giallo-rosso nord-centro (Game Corner)
            {
                x: 17, y: 2, width: 6, height: 7,
                type: 'casino',
                name: 'Game Corner',
                entrance: { x: 20, y: 9 },
                color: '#FFD700',
                hasInterior: true,
                interiorMap: 'casino_interior'
            },
            
            // Edificio marrone grande nord-est (Mansion)
            {
                x: 28, y: 2, width: 10, height: 8,
                type: 'about',
                name: 'Silver Mansion', 
                entrance: { x: 32, y: 10 },
                color: '#8B4513',
                hasInterior: true,
                interiorMap: 'about_interior'
            },
            
            // Edificio rosa est (Pokemon Center equivalent)
            {
                x: 35, y: 14, width: 6, height: 4,
                type: 'contact',
                name: 'Contact Center',
                entrance: { x: 38, y: 18 },
                color: '#FF69B4',
                hasInterior: true,
                interiorMap: 'contact_interior'
            },
            
            // Edificio verde sud-ovest (Gym)
            {
                x: 3, y: 18, width: 6, height: 6,
                type: 'skills',
                name: 'Skills Gym',
                entrance: { x: 6, y: 24 },
                color: '#32CD32',
                hasInterior: true,
                interiorMap: 'skills_interior'
            },
            
            // Edifici decorativi aggiuntivi per completare la città
            {
                x: 18, y: 14, width: 4, height: 3,
                type: 'decoration',
                name: 'Casa Residenziale',
                entrance: { x: 20, y: 17 },
                color: '#DEB887',
                hasInterior: false
            },
            
            {
                x: 28, y: 14, width: 3, height: 3,
                type: 'decoration', 
                name: 'Piccolo Negozio',
                entrance: { x: 29, y: 17 },
                color: '#CD853F',
                hasInterior: false
            },
            
            {
                x: 18, y: 20, width: 4, height: 4,
                type: 'decoration',
                name: 'Condominio',
                entrance: { x: 20, y: 24 },
                color: '#A0522D',
                hasInterior: false
            },
            
            {
                x: 42, y: 2, width: 4, height: 4,
                type: 'decoration',
                name: 'Villa',
                entrance: { x: 44, y: 6 },
                color: '#8A2BE2',
                hasInterior: false
            },
            
            {
                x: 42, y: 20, width: 3, height: 3,
                type: 'decoration',
                name: 'Market',
                entrance: { x: 43, y: 23 },
                color: '#FF8C00',
                hasInterior: false
            }
        ];

        // DECORAZIONI PRECISE
        const preciseDecorations = [
            // Staccionate/barriere (rappresentate come rocce marroni)
            { x: 11, y: 15, type: 'rock' },
            { x: 11, y: 16, type: 'rock' },
            { x: 11, y: 17, type: 'rock' },
            { x: 11, y: 18, type: 'rock' },
            { x: 11, y: 19, type: 'rock' },
            { x: 11, y: 20, type: 'rock' },
            { x: 11, y: 21, type: 'rock' },
            { x: 11, y: 22, type: 'rock' },
            { x: 11, y: 23, type: 'rock' },
            
            { x: 37, y: 15, type: 'rock' },
            { x: 37, y: 16, type: 'rock' },
            { x: 37, y: 17, type: 'rock' },
            { x: 37, y: 18, type: 'rock' },
            { x: 37, y: 19, type: 'rock' },
            { x: 37, y: 20, type: 'rock' },
            { x: 37, y: 21, type: 'rock' },
            { x: 37, y: 22, type: 'rock' },
            { x: 37, y: 23, type: 'rock' },
            
            // Alberi isolati dentro la città
            { x: 12, y: 4, type: 'tree' },
            { x: 13, y: 5, type: 'tree' },
            { x: 25, y: 4, type: 'tree' },
            { x: 26, y: 5, type: 'tree' },
            { x: 40, y: 4, type: 'tree' },
            { x: 41, y: 5, type: 'tree' },
            { x: 5, y: 15, type: 'tree' },
            { x: 43, y: 15, type: 'tree' },
            { x: 5, y: 30, type: 'tree' },
            { x: 43, y: 30, type: 'tree' },
            
            // Dettagli decorativi vicino agli stagni
            { x: 7, y: 8, type: 'rock' },
            { x: 12, y: 7, type: 'rock' },
            { x: 19, y: 30, type: 'rock' },
            { x: 24, y: 33, type: 'rock' },
            
            // Piccole aiuole/decorazioni
            { x: 14, y: 14, type: 'rock' },
            { x: 30, y: 20, type: 'rock' },
            { x: 22, y: 22, type: 'rock' },
            
            // Alberi negli angoli degli isolati
            { x: 17, y: 13, type: 'tree' },
            { x: 31, y: 13, type: 'tree' },
            { x: 17, y: 27, type: 'tree' },
            { x: 31, y: 27, type: 'tree' },
        ];

        // Aggiungi decorazioni verificando compatibilità
        preciseDecorations.forEach(decoration => {
            if (this.canPlaceDecoration(decoration.x, decoration.y)) {
                this.decorations.push(decoration);
            }
        });
    }
    
    canPlaceDecoration(x, y) {
        if (!this.isValidTile(x, y)) return false;
        if (this.tiles[y][x] === 'path') return false;
        if (this.tiles[y][x] === 'water') return false;
        
        return !CONFIG.BUILDINGS.some(building => {
            return x >= building.x && x < building.x + building.width &&
                   y >= building.y && y < building.y + building.height;
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
            spriteDrawn = spriteManager.drawAnimatedTile(ctx, tile, screenPos.x, screenPos.y, this.animationTimer);
        } else {
            spriteDrawn = spriteManager && spriteManager.drawTile(ctx, tile, screenPos.x, screenPos.y);
        }
        
        if (!spriteDrawn) {
            if (tile === 'water') {
                ctx.fillStyle = '#4a90e2';
            } else if (tile === 'path') {
                ctx.fillStyle = '#c8a882';
            } else {
                ctx.fillStyle = '#4a7c47';
            }
            ctx.fillRect(screenPos.x, screenPos.y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        }
    }
    
    renderDecoration(ctx, camera, decoration, spriteManager) {
        const screenPos = camera.worldToScreen(decoration.x * CONFIG.TILE_SIZE, decoration.y * CONFIG.TILE_SIZE);
        
        const spriteDrawn = spriteManager && spriteManager.drawTile(ctx, decoration.type, screenPos.x, screenPos.y);
        
        if (!spriteDrawn) {
            switch(decoration.type) {
                case 'tree':
                    ctx.fillStyle = CONFIG.COLORS.TREE_TRUNK;
                    ctx.fillRect(screenPos.x + 12, screenPos.y + 20, 8, 12);
                    
                    ctx.fillStyle = CONFIG.COLORS.TREE;
                    ctx.beginPath();
                    ctx.arc(screenPos.x + 16, screenPos.y + 16, 12, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 'rock':
                    // Staccionata/barriera marrone
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(screenPos.x + 2, screenPos.y + 8, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 16);
                    ctx.fillStyle = '#654321';
                    ctx.fillRect(screenPos.x + 4, screenPos.y + 10, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 20);
                    break;
            }
        }
    }
}
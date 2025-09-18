window.SpriteManager = class SpriteManager {
    constructor() {
        this.sprites = {};
        this.loaded = false;
        this.loadingPromises = [];
    }
    
    async loadAllSprites() {
        const spritePaths = {
            // Player sprites
            'player_boy_down': 'assets/sprite/player/player_boy_down.png',
            'player_boy_up': 'assets/sprite/player/player_boy_up.png',
            'player_boy_left': 'assets/sprite/player/player_boy_left.png',
            'player_boy_right': 'assets/sprite/player/player_boy_right.png',
            'player_girl_down': 'assets/sprite/player/player_girl_down.png',
            'player_girl_up': 'assets/sprite/player/player_girl_up.png',
            'player_girl_left': 'assets/sprite/player/player_girl_left.png',
            'player_girl_right': 'assets/sprite/player/player_girl_right.png',
            
            // Tile sprites (32x32)
            'grass-flowers': 'assets/sprite/tiles/grass-flowers.png',
            'path': 'assets/sprite/tiles/path.png',
            'water': 'assets/sprite/tiles/water.png',
            'stone': 'assets/sprite/tiles/stone.png',
            'sand': 'assets/sprite/tiles/sand.png',
            'bridge': 'assets/sprite/tiles/bridge.png',
            
            // Decoration sprites (32x32)
            'tree': 'assets/sprite/decorations/tree.png',
            'flower1': 'assets/sprite/decorations/flower1.png',
            'flower2': 'assets/sprite/decorations/flower2.png',
            'rock': 'assets/sprite/decorations/rock.png',
            
            // Building sprites (dimensioni variabili)
            'building_projects': 'assets/sprite/buildings/building_projects.png',
            'building_casino': 'assets/sprite/buildings/building_casino.png',
            'building_about': 'assets/sprite/buildings/building_about.png',
            'building_contact': 'assets/sprite/buildings/building_contact.png',
            'building_skills': 'assets/sprite/buildings/building_skills.png'
        };
        
        console.log('Caricamento sprite...');
        
        this.loadingPromises = Object.entries(spritePaths).map(([name, path]) =>
            this.loadSprite(name, path)
        );
        
        await Promise.all(this.loadingPromises);
        this.loaded = true;
        console.log('Sprite caricati!');
    }
    
    loadSprite(name, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites[name] = img;
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Sprite non trovato: ${path}`);
                this.sprites[name] = null;
                resolve(null);
            };
            img.src = path;
        });
    }
    
    getSprite(name) {
        return this.sprites[name] || null;
    }
    
    hasSprite(name) {
        return this.sprites[name] !== null && this.sprites[name] !== undefined;
    }
    
    // Disegna tile della mappa
    drawTile(ctx, tileName, x, y, width = CONFIG.TILE_SIZE, height = CONFIG.TILE_SIZE) {
        const sprite = this.getSprite(tileName);
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, x, y, width, height);
            return true;
        }
        return false;
    }
    
    // Disegna decorazione
    drawDecoration(ctx, decorationName, x, y, width = CONFIG.TILE_SIZE, height = CONFIG.TILE_SIZE) {
        const sprite = this.getSprite(decorationName);
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, x, y, width, height);
            return true;
        }
        return false;
    }
    
    // Disegna edificio
    drawBuilding(ctx, buildingName, x, y, width, height) {
        const sprite = this.getSprite(`building_${buildingName}`);
        if (sprite && sprite.complete) {
            // Gli sprite degli edifici possono essere scalati
            ctx.drawImage(sprite, x, y, width, height);
            return true;
        }
        return false;
    }
    
    // Disegna sprite del player con animazione a 4 frame
    drawSprite(ctx, spriteName, x, y, frame = 0, direction = 'down') {
        if (spriteName === 'player') {
            const genderPrefix = CONFIG.PLAYER_GENDER === 'female' ? 'girl' : 'boy';
            const actualSpriteName = `player_${genderPrefix}_${direction}`;
            
            const sprite = this.getSprite(actualSpriteName);
            if (sprite && sprite.complete) {
                const renderSize = 32;
                
                // Spritesheet con 4 frame orizzontali
                const frameWidth = sprite.width / 4;
                const frameHeight = sprite.height;
                
                // Assicurati che il frame sia nel range 0-3
                const clampedFrame = Math.floor(frame) % 4;
                
                ctx.drawImage(
                    sprite,
                    clampedFrame * frameWidth, 0, frameWidth, frameHeight, // Frame specifico dal spritesheet
                    x - renderSize/2, y - renderSize/2, renderSize, renderSize // Destinazione scalata
                );
                return true;
            }
        }
        
        return false;
    }
    
    // Disegna tile (per mappa)
    drawTile(ctx, tileName, x, y) {
        const sprite = this.getSprite(tileName);
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            return true;
        }
        return false;
    }

    drawVariatedTile(ctx, tileName, x, y, variation = 0) {
        if (tileName === 'grass-flowers') {
            const sprite = this.getSprite('grass-flowers');
            if (sprite && sprite.complete) {
                const sourceX = variation === 0 ? 0 : 128;
                // Rimuovi il random qui - usa sempre la stessa sezione verticale
                const sourceY = 0; // Sempre la prima riga
                
                ctx.drawImage(
                    sprite,
                    sourceX, sourceY, 128, 32,
                    x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE
                );
                return true;
            }
        }
        return this.drawTile(ctx, tileName, x, y);
    }

    drawAnimatedTile(ctx, tileName, x, y, animationFrame) {
        if (tileName === 'water') {
            const sprite = this.getSprite('water');
            if (sprite && sprite.complete) {
                // 3 frame da 16x16 in orizzontale (sprite totale: 48x16)
                const frameWidth = 16;
                const frameHeight = 16;
                const currentFrame = Math.floor(animationFrame / 40) % 3; 
                
                ctx.drawImage(
                    sprite,
                    currentFrame * frameWidth, 0, frameWidth, frameHeight, 
                    x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE 
                );
                return true;
            }
        }
        return false;
    }
    
    // Disegna edificio
    drawBuilding(ctx, buildingName, x, y, width, height) {
        const sprite = this.getSprite(`building_${buildingName}`);
        if (sprite && sprite.complete) {
            ctx.drawImage(sprite, x, y, width, height);
            return true;
        }
        return false;
    }
    
};
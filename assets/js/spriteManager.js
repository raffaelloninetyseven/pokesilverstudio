window.SpriteManager = class SpriteManager {
    constructor() {
        this.sprites = {};
        this.loaded = false;
        this.loadingPromises = [];
    }
    
    // Carica un singolo sprite
    loadSprite(name, path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites[name] = img;
                resolve(img);
            };
            img.onerror = () => {
                this.sprites[name] = null;
                resolve(null);
            };
            img.src = path;
        });
    }
    
    // Carica tutti gli sprite necessari
    async loadAllSprites() {
        const spritePaths = {
            // Player sprites - BOY (4 direzioni con 4 frame ciascuna)
            'player_boy_down': 'assets/sprite/player/player_boy_down.png',
            'player_boy_up': 'assets/sprite/player/player_boy_up.png',
            'player_boy_left': 'assets/sprite/player/player_boy_left.png',
            'player_boy_right': 'assets/sprite/player/player_boy_right.png',
            
            // Player sprites - GIRL (4 direzioni con 4 frame ciascuna)
            'player_girl_down': 'assets/sprite/player/player_girl_down.png',
            'player_girl_up': 'assets/sprite/player/player_girl_up.png',
            'player_girl_left': 'assets/sprite/player/player_girl_left.png',
            'player_girl_right': 'assets/sprite/player/player_girl_right.png'
        };
        
        console.log('Caricamento sprite...');
        
        this.loadingPromises = Object.entries(spritePaths).map(([name, path]) =>
            this.loadSprite(name, path)
        );
        
        await Promise.all(this.loadingPromises);
        this.loaded = true;
        console.log('Sprite caricati!');
    }
    
    // Ottieni sprite con fallback
    getSprite(name) {
        return this.sprites[name] || null;
    }
    
    // Verifica se uno sprite esiste
    hasSprite(name) {
        return this.sprites[name] !== null && this.sprites[name] !== undefined;
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
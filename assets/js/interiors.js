window.InteriorManager = class InteriorManager {
    constructor(game) {
        this.game = game;
        this.currentInterior = null;
        this.exteriorPlayerPos = { x: 0, y: 0 };
        this.currentBuilding = null;
        this.nearExit = false;
        this.originalMap = null;
        
        this.interiorMaps = {
            projects_interior: this.createProjectsInterior(),
            skills_interior: this.createSkillsInterior(),
            about_interior: this.createAboutInterior(),
            contact_interior: this.createContactInterior(),
            casino_interior: this.createCasinoInterior()
        };
    }
    
    update(player) {
        if (!this.currentInterior) return;
        
        const interior = this.interiorMaps[this.currentInterior];
        const doorX = 7 * CONFIG.TILE_SIZE;
        const doorY = (interior.height - 1) * CONFIG.TILE_SIZE;
        
        const distance = Math.sqrt(
            Math.pow(player.x - doorX, 2) + Math.pow(player.y - doorY, 2)
        );
        
        this.nearExit = distance <= (CONFIG.TILE_SIZE * 1.5);
    }
    
    canInteractWithExit() {
        return this.currentInterior && this.nearExit;
    }
    
    enterBuilding(building) {
        console.log('Entering building:', building.name);
        
        // Salva stato esterno
        this.originalMap = this.game.map;
        this.exteriorPlayerPos = {
            x: this.game.player.x,
            y: this.game.player.y
        };
        
        this.currentInterior = building.interiorMap;
        this.currentBuilding = building;
        
        // Posiziona player nell'interno
        this.game.player.x = 7 * CONFIG.TILE_SIZE;
        this.game.player.y = (this.interiorMaps[building.interiorMap].height - 3) * CONFIG.TILE_SIZE;
        
        // Ferma la camera negli interni
        this.game.camera.followSpeed = 0;
        
        console.log('Interior entered successfully');
    }
    
    exitBuilding() {
        if (!this.currentInterior || !this.currentBuilding) return;
        
        console.log('Exiting building');
        
        const building = this.currentBuilding;
        const exitX = building.entrance.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const exitY = (building.entrance.y + 1) * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        
        // Ripristina tutto
        this.game.map = this.originalMap;
        this.currentInterior = null;
        this.currentBuilding = null;
        this.nearExit = false;
        this.originalMap = null;
        
        // Riabilita camera
        this.game.camera.followSpeed = 0.08;
        
        // Posiziona player fuori
        this.game.player.x = exitX;
        this.game.player.y = exitY;
        
        console.log('Exited successfully');
    }
    
    render(ctx, camera, spriteManager) {
        if (!this.currentInterior) return false;
        
        const interior = this.interiorMaps[this.currentInterior];
        const building = this.currentBuilding;
        
        // Sfondo nero
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        const buildingPixelWidth = interior.width * CONFIG.TILE_SIZE;
        const buildingPixelHeight = interior.height * CONFIG.TILE_SIZE;
        const offsetX = (CONFIG.CANVAS_WIDTH - buildingPixelWidth) / 2;
        const offsetY = (CONFIG.CANVAS_HEIGHT - buildingPixelHeight) / 2;
        
        // Disegna l'interno
        this.renderInteriorRoom(ctx, interior, offsetX, offsetY, building);
        
        return true;
    }
    
    renderInteriorRoom(ctx, interior, offsetX, offsetY, building) {
        // Determina colori basati sul tipo di edificio
        let floorColor = '#666';
        let wallColor = '#333';
        let title = building.name;
        
        switch(building.type) {
            case 'projects':
                floorColor = '#555';
                wallColor = '#333';
                break;
            case 'casino':
                floorColor = '#660000';
                wallColor = '#330000';
                break;
            case 'about':
                floorColor = '#2d5016';
                wallColor = '#1a3009';
                break;
            case 'contact':
                floorColor = '#96ceb4';
                wallColor = '#6b9080';
                break;
            case 'skills':
                floorColor = '#4a90e2';
                wallColor = '#2c5282';
                break;
        }
        
        // Disegna pavimento e muri
        for (let y = 0; y < interior.height; y++) {
            for (let x = 0; x < interior.width; x++) {
                const screenX = offsetX + (x * CONFIG.TILE_SIZE);
                const screenY = offsetY + (y * CONFIG.TILE_SIZE);
                
                if (x === 0 || x === interior.width-1 || y === 0 || y === interior.height-1) {
                    // Muri
                    ctx.fillStyle = wallColor;
                    ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                    
                    ctx.strokeStyle = '#555';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                } else {
                    // Pavimento
                    ctx.fillStyle = floorColor;
                    ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                    
                    // Pattern pavimento
                    const patternColor = this.lightenColor(floorColor, 20);
                    ctx.fillStyle = patternColor;
                    if ((x + y) % 2 === 0) {
                        ctx.fillRect(screenX + 8, screenY + 8, 16, 16);
                    }
                }
            }
        }
        
        // Porta di uscita
        const doorX = offsetX + (7 * CONFIG.TILE_SIZE);
        const doorY = offsetY + ((interior.height-1) * CONFIG.TILE_SIZE);
        
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(doorX, doorY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        
        // Maniglia
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(doorX + 24, doorY + 16, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Indicatore uscita se vicino
        if (this.nearExit) {
            const time = Date.now() * 0.005;
            const bounce = Math.sin(time) * 3;
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('▲', doorX + CONFIG.TILE_SIZE/2, doorY - 20 + bounce);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '8px "Press Start 2P"';
            ctx.fillText('ESCI (SPAZIO)', doorX + CONFIG.TILE_SIZE/2, doorY - 35 + bounce);
        }
        
        // Titolo edificio
        ctx.fillStyle = '#fff';
        ctx.font = '16px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(title, CONFIG.CANVAS_WIDTH / 2, offsetY - 20);
        
        // Decorazioni specifiche
        this.addInteriorDecorations(ctx, interior, offsetX, offsetY, building.type);
    }
    
    lightenColor(color, amount) {
        const colorInt = parseInt(color.replace('#', ''), 16);
        const r = Math.min(255, (colorInt >> 16) + amount);
        const g = Math.min(255, ((colorInt >> 8) & 0x00FF) + amount);
        const b = Math.min(255, (colorInt & 0x0000FF) + amount);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
    
    addInteriorDecorations(ctx, interior, offsetX, offsetY, type) {
        switch(type) {
            case 'projects':
                // Computer
                ctx.fillStyle = '#222';
                ctx.fillRect(offsetX + (3 * CONFIG.TILE_SIZE), offsetY + (2 * CONFIG.TILE_SIZE), CONFIG.TILE_SIZE, CONFIG.TILE_SIZE/2);
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(offsetX + (3 * CONFIG.TILE_SIZE) + 4, offsetY + (2 * CONFIG.TILE_SIZE) + 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE/2 - 8);
                break;
                
            case 'casino':
                // Slot machine
                ctx.fillStyle = '#444';
                ctx.fillRect(offsetX + (4 * CONFIG.TILE_SIZE), offsetY + (3 * CONFIG.TILE_SIZE), CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(offsetX + (4 * CONFIG.TILE_SIZE) + 8, offsetY + (3 * CONFIG.TILE_SIZE) + 8, 16, 16);
                break;
                
            case 'skills':
                // Manubri
                ctx.fillStyle = '#333';
                ctx.fillRect(offsetX + (5 * CONFIG.TILE_SIZE), offsetY + (4 * CONFIG.TILE_SIZE), CONFIG.TILE_SIZE/2, CONFIG.TILE_SIZE/4);
                break;
        }
    }
    
    createBaseInterior(width, height, type) {
        return {
            tiles: [],
            decorations: [],
            width: width,
            height: height,
            type: type
        };
    }
    
    createProjectsInterior() {
        return this.createBaseInterior(15, 12, 'projects');
    }
    
    createSkillsInterior() {
        return this.createBaseInterior(12, 10, 'skills');
    }
    
    createAboutInterior() {
        return this.createBaseInterior(14, 12, 'about');
    }
    
    createContactInterior() {
        return this.createBaseInterior(10, 8, 'contact');
    }
    
    createCasinoInterior() {
        return this.createBaseInterior(18, 14, 'casino');
    }
}
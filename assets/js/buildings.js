window.Buildings = class Buildings {
    constructor() {
        this.buildings = CONFIG.BUILDINGS;
        this.nearBuilding = null;
    }
    
    update(player) {
        this.nearBuilding = null;
        const playerTile = player.getTilePosition();
        
        // Cerca edificio vicino controllando le entrate
        for (let building of this.buildings) {
            const entrance = building.entrance;
            const distance = Utils.distance(playerTile.x, playerTile.y, entrance.x, entrance.y);
            
            if (distance <= 1.5) {
                this.nearBuilding = building;
                break;
            }
        }
    }
    
    interact() {
        if (this.nearBuilding) {
            if (this.nearBuilding.hasInterior) {
                return {
                    type: 'enter_building',
                    building: this.nearBuilding,
                    message: `Premi SPAZIO per entrare in ${this.nearBuilding.name}`
                };
            } else {
                // Per edifici decorativi senza interno
                return {
                    type: this.nearBuilding.type,
                    message: CONFIG.DIALOGS[this.nearBuilding.type] || CONFIG.DIALOGS.decoration,
                    building: this.nearBuilding
                };
            }
        }
        return null;
    }
    
    render(ctx, camera, spriteManager) {
        this.buildings.forEach(building => {
            if (camera.isVisible(
                building.x * CONFIG.TILE_SIZE, 
                building.y * CONFIG.TILE_SIZE,
                building.width * CONFIG.TILE_SIZE,
                building.height * CONFIG.TILE_SIZE
            )) {
                this.renderBuilding(ctx, camera, building, spriteManager);
            }
        });
    }
    
    renderBuilding(ctx, camera, building, spriteManager) {
        const screenPos = camera.worldToScreen(
            building.x * CONFIG.TILE_SIZE, 
            building.y * CONFIG.TILE_SIZE
        );
        
        const width = building.width * CONFIG.TILE_SIZE;
        const height = building.height * CONFIG.TILE_SIZE;
        
        // Prova a usare sprite dell'edificio
        const spriteDrawn = spriteManager && spriteManager.drawBuilding(
            ctx, building.type, screenPos.x, screenPos.y, width, height
        );
        
        if (!spriteDrawn) {
            // Fallback: disegna edificio con colori
            
            // Ombra edificio
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(screenPos.x + 4, screenPos.y + 4, width, height);
            
            // Corpo principale dell'edificio
            ctx.fillStyle = '#deb887';
            ctx.fillRect(screenPos.x, screenPos.y, width, height);
            
            // Tetto colorato per identificare il tipo
            ctx.fillStyle = building.color;
            ctx.fillRect(screenPos.x, screenPos.y, width, Math.floor(height * 0.7));
            
            // Bordo dell'edificio
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenPos.x, screenPos.y, width, height);
            
            // Dettagli dell'edificio basati sul tipo
            this.addBuildingDetails(ctx, screenPos, building, width, height);
        }
        
        // Porta dell'edificio (sempre disegnata)
        const doorX = building.entrance.x * CONFIG.TILE_SIZE;
        const doorY = building.entrance.y * CONFIG.TILE_SIZE;
        const doorScreenPos = camera.worldToScreen(doorX, doorY);
        
        // Porta marrone
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(doorScreenPos.x - 8, doorScreenPos.y - 16, 16, 16);
        
        // Maniglia dorata
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(doorScreenPos.x + 4, doorScreenPos.y - 8, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Nome edificio quando vicino
        if (this.nearBuilding === building) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(screenPos.x, screenPos.y - 25, width, 20);
            
            ctx.fillStyle = '#fff';
            ctx.font = '10px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(building.name, screenPos.x + width / 2, screenPos.y - 10);
        }
        
        // Indicatore interazione
        if (this.nearBuilding === building) {
            const time = Date.now() * 0.005;
            const bounce = Math.sin(time) * 2;
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('▲', doorScreenPos.x, doorScreenPos.y - 30 + bounce);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '8px "Press Start 2P"';
            ctx.fillText('SPAZIO', doorScreenPos.x, doorScreenPos.y - 40 + bounce);
        }
    }
    
    addBuildingDetails(ctx, screenPos, building, width, height) {
        // Aggiungi dettagli specifici per tipo di edificio
        switch(building.type) {
            case 'projects':
                // Finestre per il department store
                ctx.fillStyle = '#87CEEB';
                for (let i = 1; i < building.width - 1; i++) {
                    for (let j = 2; j < building.height - 1; j++) {
                        ctx.fillRect(
                            screenPos.x + i * CONFIG.TILE_SIZE/2, 
                            screenPos.y + j * CONFIG.TILE_SIZE/2, 
                            CONFIG.TILE_SIZE/3, CONFIG.TILE_SIZE/3
                        );
                    }
                }
                break;
                
            case 'casino':
                // Luci colorate per il casinò
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(screenPos.x + width/4, screenPos.y + height/3, 4, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(screenPos.x + 3*width/4, screenPos.y + height/3, 4, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'skills':
                // Simbolo palestra
                ctx.fillStyle = '#fff';
                ctx.font = '16px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.fillText('💪', screenPos.x + width/2, screenPos.y + height/2);
                break;
                
            case 'contact':
                // Antenna per il centro contatti
                ctx.fillStyle = '#333';
                ctx.fillRect(screenPos.x + width/2 - 2, screenPos.y - 10, 4, 15);
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(screenPos.x + width/2, screenPos.y - 10, 3, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }
}
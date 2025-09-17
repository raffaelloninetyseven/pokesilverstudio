window.Buildings = class Buildings {
    constructor() {
        this.buildings = CONFIG.BUILDINGS;
        this.nearBuilding = null;
    }
    
    update(player) {
        this.nearBuilding = null;
        const playerTile = player.getTilePosition();
        
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
                    message: `Premi INVIO per entrare in ${this.nearBuilding.name}`
                };
            } else {
                return {
                    type: this.nearBuilding.type,
                    message: CONFIG.DIALOGS[this.nearBuilding.type],
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
        
        // Prova a usare sprite, altrimenti fallback
        const spriteDrawn = spriteManager && spriteManager.drawBuilding(
            ctx, building.type, screenPos.x, screenPos.y, width, height
        );
        
        if (!spriteDrawn) {
            // Fallback rendering originale
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(screenPos.x + 4, screenPos.y + 4, width, height);
            
            ctx.fillStyle = CONFIG.COLORS.BUILDING_WALL;
            ctx.fillRect(screenPos.x, screenPos.y, width, height);
            
            ctx.fillStyle = building.color;
            ctx.fillRect(screenPos.x, screenPos.y, width, height * 0.7);
            
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.strokeRect(screenPos.x, screenPos.y, width, height);
        }
        
        // Porta (sempre disegnata)
        const doorX = building.entrance.x * CONFIG.TILE_SIZE;
        const doorY = building.entrance.y * CONFIG.TILE_SIZE;
        const doorScreenPos = camera.worldToScreen(doorX, doorY);
        
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(doorScreenPos.x - 8, doorScreenPos.y - 16, 16, 16);
        
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(doorScreenPos.x + 4, doorScreenPos.y - 8, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Nome edificio
        if (this.nearBuilding === building) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(screenPos.x, screenPos.y - 20, width, 16);
            
            ctx.fillStyle = '#fff';
            ctx.font = '10px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(building.name, screenPos.x + width / 2, screenPos.y - 8);
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
            ctx.fillText('SPACE', doorScreenPos.x, doorScreenPos.y - 40 + bounce);
        }
    }
}
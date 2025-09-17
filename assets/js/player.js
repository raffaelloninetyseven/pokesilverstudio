window.Player = class Player {
    constructor(x, y) {
        this.x = x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        this.y = y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        this.direction = 'down';
        this.isMoving = false;
        this.animationFrame = 0;
        this.animationTimer = 0;
        this.size = 20;
        this.walkSpeed = CONFIG.PLAYER_SPEED;
    }
    
    update(inputManager, map) {
        const movement = inputManager.getMovementDirection();
        
        if (movement.dx !== 0 || movement.dy !== 0) {
            this.isMoving = true;
            this.updateDirection(movement);
            this.move(movement.dx, movement.dy, map);
            this.updateAnimation();
        } else {
            this.isMoving = false;
            this.animationFrame = 0;
            this.animationTimer = 0;
        }
    }
    
    updateDirection(movement) {
        if (Math.abs(movement.dy) > Math.abs(movement.dx)) {
            this.direction = movement.dy < 0 ? 'up' : 'down';
        } else {
            this.direction = movement.dx < 0 ? 'left' : 'right';
        }
    }
    
    move(dx, dy, map) {
        const newX = this.x + dx * this.walkSpeed;
        const newY = this.y + dy * this.walkSpeed;
        
        // Controlla se siamo in un interno
        const game = window.game;
        const isInterior = game && game.interiorManager && game.interiorManager.currentInterior;
        
        if (isInterior) {
            // Collision detection per interni
            const interior = map;
            const tileSize = CONFIG.TILE_SIZE;
            
            // Controlla bordi dell'interno
            if (newX >= tileSize && newX <= (interior.width - 1) * tileSize && 
                newY >= tileSize && newY <= (interior.height - 1) * tileSize) {
                this.x = newX;
                this.y = newY;
            }
        } else {
            // Collision detection normale per mappa esterna
            if (map.canMoveTo(newX, newY, this.size)) {
                this.x = newX;
                this.y = newY;
            } else {
                if (map.canMoveTo(newX, this.y, this.size)) {
                    this.x = newX;
                }
                if (map.canMoveTo(this.x, newY, this.size)) {
                    this.y = newY;
                }
            }
        }
    }
    
    updateAnimation() {
        this.animationTimer += CONFIG.ANIMATION_SPEED;
        if (this.animationTimer >= 1) {
            this.animationFrame = (this.animationFrame + 1) % 4; // Cicla tra frame 0, 1, 2, 3
            this.animationTimer = 0;
        }
    }
    
    render(ctx, camera, spriteManager) {
        // Ottieni riferimento al game se disponibile
        const game = window.game;
        const isInterior = game && game.interiorManager && game.interiorManager.currentInterior;
        
        let screenPos;
        if (isInterior) {
            // Negli interni, calcola posizione relativa al centro dell'edificio
            const interior = game.map;
            const buildingPixelWidth = interior.width * CONFIG.TILE_SIZE;
            const buildingPixelHeight = interior.height * CONFIG.TILE_SIZE;
            const offsetX = (CONFIG.CANVAS_WIDTH - buildingPixelWidth) / 2;
            const offsetY = (CONFIG.CANVAS_HEIGHT - buildingPixelHeight) / 2;
            
            // Il player x,y sono già in coordinate assolute dell'interno
            // Dobbiamo solo trasformarle in coordinate schermo centrate
            screenPos = {
                x: offsetX + this.x,
                y: offsetY + this.y
            };
        } else {
            screenPos = camera.worldToScreen(this.x, this.y);
        }
        
        // Ombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y + 8, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Resto del rendering del player rimane uguale...
        let bobOffset = 0;
        if (this.isMoving) {
            bobOffset = Math.sin(this.animationFrame * Math.PI * 0.5) * 1;
        }
        
        const renderY = screenPos.y + bobOffset;
        
        const spriteDrawn = spriteManager && spriteManager.drawSprite(
            ctx, 'player', screenPos.x, renderY, 
            this.isMoving ? this.animationFrame : 0, 
            this.direction
        );
        
        if (!spriteDrawn) {
            // Fallback rendering...
            if (CONFIG.PLAYER_GENDER === 'female') {
                ctx.fillStyle = '#e91e63';
                ctx.fillRect(screenPos.x - 6, renderY - 8, 12, 14);
                ctx.fillStyle = '#ffeb3b';
                ctx.fillRect(screenPos.x - 5, renderY - 12, 10, 6);
                ctx.fillStyle = '#9c27b0';
                ctx.fillRect(screenPos.x - 6, renderY - 14, 12, 3);
            } else {
                ctx.fillStyle = '#3498db';
                ctx.fillRect(screenPos.x - 6, renderY - 8, 12, 14);
                ctx.fillStyle = '#f39c12';
                ctx.fillRect(screenPos.x - 5, renderY - 12, 10, 6);
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(screenPos.x - 6, renderY - 14, 12, 3);
            }
            
            // Occhi
            ctx.fillStyle = '#000';
            if (this.direction === 'left') {
                ctx.fillRect(screenPos.x - 3, renderY - 10, 1, 1);
            } else if (this.direction === 'right') {
                ctx.fillRect(screenPos.x + 2, renderY - 10, 1, 1);
            } else {
                ctx.fillRect(screenPos.x - 3, renderY - 10, 1, 1);
                ctx.fillRect(screenPos.x + 2, renderY - 10, 1, 1);
            }
            
            // Gambe
            if (this.isMoving) {
                const legOffset = Math.sin(this.animationFrame * Math.PI) * 2;
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(screenPos.x - 4 + legOffset, renderY + 4, 2, 4);
                ctx.fillRect(screenPos.x + 2 - legOffset, renderY + 4, 2, 4);
            } else {
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(screenPos.x - 3, renderY + 4, 2, 4);
                ctx.fillRect(screenPos.x + 1, renderY + 4, 2, 4);
            }
        }
    }
    
    getTilePosition() {
        return {
            x: Math.floor(this.x / CONFIG.TILE_SIZE),
            y: Math.floor(this.y / CONFIG.TILE_SIZE)
        };
    }
    
    getCollisionBounds() {
        return {
            x: this.x - this.size / 2,
            y: this.y - this.size / 2,
            width: this.size,
            height: this.size
        };
    }
}
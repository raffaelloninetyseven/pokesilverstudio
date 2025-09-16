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
    
    updateAnimation() {
        this.animationTimer += CONFIG.ANIMATION_SPEED;
        if (this.animationTimer >= 1) {
            this.animationFrame = (this.animationFrame + 1) % 4; // Cicla tra frame 0, 1, 2, 3
            this.animationTimer = 0;
        }
    }
    
    render(ctx, camera, spriteManager) {
        const screenPos = camera.worldToScreen(this.x, this.y);
        
        // Ombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y + 8, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Animazione bobbing se si muove
        let bobOffset = 0;
        if (this.isMoving) {
            bobOffset = Math.sin(this.animationFrame * Math.PI * 0.5) * 1;
        }
        
        const renderY = screenPos.y + bobOffset;
        
        // Prova a usare sprite, altrimenti fallback pixel art
        const spriteDrawn = spriteManager && spriteManager.drawSprite(
            ctx, 'player', screenPos.x, renderY, 
            this.isMoving ? this.animationFrame : 0, 
            this.direction
        );
        
        if (!spriteDrawn) {
            // Sprite diversi in base al genere
            if (CONFIG.PLAYER_GENDER === 'female') {
                // Personaggio femminile
                ctx.fillStyle = '#e91e63'; // Rosa
                ctx.fillRect(screenPos.x - 6, renderY - 8, 12, 14);
                
                ctx.fillStyle = '#ffeb3b'; // Capelli biondi
                ctx.fillRect(screenPos.x - 5, renderY - 12, 10, 6);
                
                ctx.fillStyle = '#9c27b0'; // Cappello viola
                ctx.fillRect(screenPos.x - 6, renderY - 14, 12, 3);
            } else {
                // Personaggio maschile (originale)
                ctx.fillStyle = '#3498db';
                ctx.fillRect(screenPos.x - 6, renderY - 8, 12, 14);
                
                ctx.fillStyle = '#f39c12';
                ctx.fillRect(screenPos.x - 5, renderY - 12, 10, 6);
                
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(screenPos.x - 6, renderY - 14, 12, 3);
            }
            
            // Occhi (uguali per entrambi)
            ctx.fillStyle = '#000';
            if (this.direction === 'left') {
                ctx.fillRect(screenPos.x - 3, renderY - 10, 1, 1);
            } else if (this.direction === 'right') {
                ctx.fillRect(screenPos.x + 2, renderY - 10, 1, 1);
            } else {
                ctx.fillRect(screenPos.x - 3, renderY - 10, 1, 1);
                ctx.fillRect(screenPos.x + 2, renderY - 10, 1, 1);
            }
            
            // Gambe (animazione camminata)
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
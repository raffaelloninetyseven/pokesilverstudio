window.Player = class Player {
    constructor(tileX, tileY) {
        // Posiziona il player al centro del tile specificato
        this.x = tileX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        this.y = tileY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        
        // Proprietà di movimento e animazione
        this.direction = 'down';
        this.isMoving = false;
        this.animationFrame = 0;
        this.animationTimer = 0;
        
        // Proprietà fisiche
        this.size = 20;
        this.walkSpeed = CONFIG.PLAYER_SPEED;
        this.runSpeed = CONFIG.PLAYER_RUN_SPEED;
        this.isRunning = false;
    }
    
    update(inputManager, map) {
        const movement = inputManager.getMovementDirection();
        
        if (movement.dx !== 0 || movement.dy !== 0) {
            this.isMoving = true;
            this.updateDirection(movement);
            
            // Controlla se sta correndo
            this.isRunning = inputManager.isPressed('Space');
            
            this.move(movement.dx, movement.dy, map);
            this.updateAnimation();
        } else {
            this.isMoving = false;
            this.isRunning = false;
            this.animationFrame = 0;
            this.animationTimer = 0;
        }
    }
    
    updateDirection(movement) {
        // Determina la direzione basata sul movimento
        if (Math.abs(movement.dy) > Math.abs(movement.dx)) {
            this.direction = movement.dy < 0 ? 'up' : 'down';
        } else {
            this.direction = movement.dx < 0 ? 'left' : 'right';
        }
    }
    
    move(dx, dy, map) {
        const currentSpeed = this.isRunning ? this.runSpeed : this.walkSpeed;
        
        const newX = this.x + dx * currentSpeed;
        const newY = this.y + dy * currentSpeed;
        
        // Controlla se siamo in un interno
        const game = window.game;
        const isInterior = game && game.interiorManager && game.interiorManager.currentInterior;
        
        if (isInterior) {
            this.moveInInterior(newX, newY, game);
        } else {
            this.moveInExterior(newX, newY, map);
        }
    }
    
    moveInInterior(newX, newY, game) {
        const interior = game.interiorManager.interiorMaps[game.interiorManager.currentInterior];
        
        // Limiti dell'interno (lascia un tile di margine per i muri)
        const minX = CONFIG.TILE_SIZE + this.size / 2;
        const maxX = (interior.width - 1) * CONFIG.TILE_SIZE - this.size / 2;
        const minY = CONFIG.TILE_SIZE + this.size / 2;
        const maxY = (interior.height - 1) * CONFIG.TILE_SIZE - this.size / 2;
        
        // Applica movimento se dentro i limiti
        if (newX >= minX && newX <= maxX) {
            this.x = newX;
        }
        if (newY >= minY && newY <= maxY) {
            this.y = newY;
        }
    }
    
    moveInExterior(newX, newY, map) {
        // Movimento normale nella mappa esterna con collision detection
        if (map.canMoveTo(newX, newY, this.size)) {
            this.x = newX;
            this.y = newY;
        } else {
            // Prova movimento separato sui singoli assi
            if (map.canMoveTo(newX, this.y, this.size)) {
                this.x = newX;
            }
            if (map.canMoveTo(this.x, newY, this.size)) {
                this.y = newY;
            }
        }
    }
    
    updateAnimation() {
        const animSpeed = this.isRunning ? CONFIG.ANIMATION_SPEED * 1.5 : CONFIG.ANIMATION_SPEED;
        
        this.animationTimer += animSpeed;
        if (this.animationTimer >= 1) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }
    }
    
    render(ctx, camera, spriteManager) {
        const screenPos = this.calculateScreenPosition(camera);
        
        this.renderShadow(ctx, screenPos);
        this.renderPlayer(ctx, screenPos, spriteManager);
    }
    
    calculateScreenPosition(camera) {
        const game = window.game;
        const isInterior = game && game.interiorManager && game.interiorManager.currentInterior;
        
        if (isInterior) {
            // Negli interni, rendering centrato sullo schermo
            const interior = game.interiorManager.interiorMaps[game.interiorManager.currentInterior];
            const buildingPixelWidth = interior.width * CONFIG.TILE_SIZE;
            const buildingPixelHeight = interior.height * CONFIG.TILE_SIZE;
            const offsetX = (CONFIG.CANVAS_WIDTH - buildingPixelWidth) / 2;
            const offsetY = (CONFIG.CANVAS_HEIGHT - buildingPixelHeight) / 2;
            
            return {
                x: offsetX + this.x,
                y: offsetY + this.y
            };
        } else {
            // Rendering normale con camera
            return camera.worldToScreen(this.x, this.y);
        }
    }
    
    renderShadow(ctx, screenPos) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(screenPos.x, screenPos.y + 8, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderPlayer(ctx, screenPos, spriteManager) {
        // Calcola l'effetto "bob" durante il movimento
        let bobOffset = 0;
        if (this.isMoving) {
            bobOffset = Math.sin(this.animationFrame * Math.PI * 0.5) * 1;
        }
        
        const renderY = screenPos.y + bobOffset;
        
        // Prova a usare sprite, altrimenti fallback
        const spriteDrawn = spriteManager && spriteManager.drawSprite(
            ctx, 'player', screenPos.x, renderY, 
            this.isMoving ? this.animationFrame : 0, 
            this.direction
        );
        
        if (!spriteDrawn) {
            this.renderFallbackPlayer(ctx, screenPos.x, renderY);
        }
    }
    
    renderFallbackPlayer(ctx, x, y) {
        // Rendering fallback senza sprite
        if (CONFIG.PLAYER_GENDER === 'female') {
            // Player femminile
            ctx.fillStyle = '#e91e63'; // Rosa
            ctx.fillRect(x - 6, y - 8, 12, 14);
            
            ctx.fillStyle = '#ffeb3b'; // Giallo per capelli
            ctx.fillRect(x - 5, y - 12, 10, 6);
            
            ctx.fillStyle = '#9c27b0'; // Viola per accessori
            ctx.fillRect(x - 6, y - 14, 12, 3);
        } else {
            // Player maschile
            ctx.fillStyle = '#3498db'; // Blu
            ctx.fillRect(x - 6, y - 8, 12, 14);
            
            ctx.fillStyle = '#f39c12'; // Arancione per capelli
            ctx.fillRect(x - 5, y - 12, 10, 6);
            
            ctx.fillStyle = '#e74c3c'; // Rosso per cappello
            ctx.fillRect(x - 6, y - 14, 12, 3);
        }
        
        // Occhi
        this.renderEyes(ctx, x, y);
        
        // Gambe
        this.renderLegs(ctx, x, y);
    }
    
    renderEyes(ctx, x, y) {
        ctx.fillStyle = '#000';
        
        if (this.direction === 'left') {
            // Solo occhio sinistro visibile
            ctx.fillRect(x - 3, y - 10, 1, 1);
        } else if (this.direction === 'right') {
            // Solo occhio destro visibile
            ctx.fillRect(x + 2, y - 10, 1, 1);
        } else {
            // Entrambi gli occhi visibili (up/down)
            ctx.fillRect(x - 3, y - 10, 1, 1);
            ctx.fillRect(x + 2, y - 10, 1, 1);
        }
    }
    
    renderLegs(ctx, x, y) {
        ctx.fillStyle = '#2c3e50';
        
        if (this.isMoving) {
            // Gambe animate durante il movimento
            const legOffset = Math.sin(this.animationFrame * Math.PI) * 2;
            ctx.fillRect(x - 4 + legOffset, y + 4, 2, 4);
            ctx.fillRect(x + 2 - legOffset, y + 4, 2, 4);
        } else {
            // Gambe statiche
            ctx.fillRect(x - 3, y + 4, 2, 4);
            ctx.fillRect(x + 1, y + 4, 2, 4);
        }
    }
    
    getTilePosition() {
        return {
            x: Math.floor(this.x / CONFIG.TILE_SIZE),
            y: Math.floor(this.y / CONFIG.TILE_SIZE)
        };
    }
    
    getWorldPosition() {
        return {
            x: this.x,
            y: this.y
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
    
    setPosition(tileX, tileY) {
        this.x = tileX * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        this.y = tileY * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
    }
    
    setWorldPosition(worldX, worldY) {
        this.x = worldX;
        this.y = worldY;
    }
}
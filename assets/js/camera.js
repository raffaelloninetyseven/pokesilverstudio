window.Camera = class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.followSpeed = 0.08;
        this.updateBounds();
    }
    
    updateBounds() {
        this.maxX = Math.max(0, CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE - this.canvasWidth);
        this.maxY = Math.max(0, CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE - this.canvasHeight);
    }
    
    follow(target) {
        this.targetX = target.x - this.canvasWidth / 2;
        this.targetY = target.y - this.canvasHeight / 2;
        
        this.x = Utils.lerp(this.x, this.targetX, this.followSpeed);
        this.y = Utils.lerp(this.y, this.targetY, this.followSpeed);
        
        this.x = Utils.clamp(this.x, 0, this.maxX);
        this.y = Utils.clamp(this.y, 0, this.maxY);
    }
    
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }
    
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }
    
    isVisible(worldX, worldY, width = CONFIG.TILE_SIZE, height = CONFIG.TILE_SIZE) {
        return worldX + width > this.x && 
               worldX < this.x + this.canvasWidth &&
               worldY + height > this.y && 
               worldY < this.y + this.canvasHeight;
    }
}
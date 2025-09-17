window.UI = class UI {
    constructor() {
        this.dialogBox = document.getElementById('dialogBox');
        this.dialogContent = document.querySelector('.dialog-content');
        this.menu = document.getElementById('menu');
        this.minimap = document.getElementById('minimapCanvas');
        this.minimapCtx = this.minimap.getContext('2d');
        
        this.isDialogOpen = false;
        this.isMenuOpen = false;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                this.navigateToPage(page);
            });
        });
        
        document.addEventListener('click', (e) => {
            if (this.isDialogOpen && !this.dialogBox.contains(e.target)) {
                this.hideDialog();
            }
        });
    }
    
    showDialog(message) {
        this.dialogContent.textContent = message;
        this.dialogBox.classList.remove('hidden');
        this.isDialogOpen = true;
        
        setTimeout(() => {
            this.hideDialog();
        }, 5000);
    }
    
    hideDialog() {
        this.dialogBox.classList.add('hidden');
        this.isDialogOpen = false;
    }
    
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        if (this.isMenuOpen) {
            this.menu.classList.remove('hidden');
        } else {
            this.menu.classList.add('hidden');
        }
    }
    
    navigateToPage(page) {
        window.open(`pages/${page}.html`, '_blank');
        this.toggleMenu();
    }
    
    updateMinimap(player, camera, map) {
        this.minimapCtx.clearRect(0, 0, this.minimap.width, this.minimap.height);
        
        // Controlla se siamo in un interno
        if (map.width && map.height) {
            // Siamo in un interno
            const scaleX = this.minimap.width / (map.width * CONFIG.TILE_SIZE);
            const scaleY = this.minimap.height / (map.height * CONFIG.TILE_SIZE);
            
            for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
                for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                    const tile = map.tiles[y][x];
                    // Tutti i tile grass-flowers appaiono verdi nella minimappa
                    this.minimapCtx.fillStyle = tile === 'path' ? '#d4b896' : '#4a7c47';
                    this.minimapCtx.fillRect(
                        x * CONFIG.TILE_SIZE * scaleX,
                        y * CONFIG.TILE_SIZE * scaleY,
                        CONFIG.TILE_SIZE * scaleX,
                        CONFIG.TILE_SIZE * scaleY
                    );
                }
            }
            
            // Player nell'interno
            this.minimapCtx.fillStyle = '#ff0000';
            this.minimapCtx.beginPath();
            this.minimapCtx.arc(
                player.x * scaleX,
                player.y * scaleY,
                3, 0, Math.PI * 2
            );
            this.minimapCtx.fill();
            
            return;
        }
        
        // Codice originale per la mappa esterna
        const scaleX = this.minimap.width / (CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE);
        const scaleY = this.minimap.height / (CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE);
        
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                const tile = map.tiles[y][x];
                this.minimapCtx.fillStyle = tile === 'path' ? '#d4b896' : '#4a7c47';
                this.minimapCtx.fillRect(
                    x * CONFIG.TILE_SIZE * scaleX,
                    y * CONFIG.TILE_SIZE * scaleY,
                    CONFIG.TILE_SIZE * scaleX,
                    CONFIG.TILE_SIZE * scaleY
                );
            }
        }
        
        CONFIG.BUILDINGS.forEach(building => {
            this.minimapCtx.fillStyle = building.color;
            this.minimapCtx.fillRect(
                building.x * CONFIG.TILE_SIZE * scaleX,
                building.y * CONFIG.TILE_SIZE * scaleY,
                building.width * CONFIG.TILE_SIZE * scaleX,
                building.height * CONFIG.TILE_SIZE * scaleY
            );
        });
        
        this.minimapCtx.fillStyle = '#ff0000';
        this.minimapCtx.beginPath();
        this.minimapCtx.arc(
            player.x * scaleX,
            player.y * scaleY,
            3, 0, Math.PI * 2
        );
        this.minimapCtx.fill();
        
        this.minimapCtx.strokeStyle = '#fff';
        this.minimapCtx.lineWidth = 1;
        this.minimapCtx.strokeRect(
            camera.x * scaleX,
            camera.y * scaleY,
            camera.canvasWidth * scaleX,
            camera.canvasHeight * scaleY
        );
    }
}
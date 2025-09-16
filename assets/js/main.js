// Entry point del gioco
window.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio Game - Inizializzazione...');
    
    // Controlla se tutti i file necessari sono caricati
    const requiredClasses = [
        'Utils', 'InputManager', 'Camera', 
        'Player', 'GameMap', 'Buildings', 'UI', 'Game', 'SpriteManager', 'IntroManager', 'MainMenu'
    ];
    
    const missingClasses = requiredClasses.filter(className => 
        typeof window[className] === 'undefined'
    );
    
    if (missingClasses.length > 0) {
        console.error('Classi mancanti:', missingClasses);
        document.body.innerHTML = `
            <div style="color: red; text-align: center; margin-top: 50px;">
                <h2>Errore di caricamento</h2>
                <p>Classi mancanti: ${missingClasses.join(', ')}</p>
                <p>Controlla che tutti i file JS siano caricati correttamente.</p>
            </div>
        `;
        return;
    }
    
    // Avvia il gioco
    try {
        const game = new Game();
        console.log('Portfolio Game - Avviato con successo!');
        
        // Aggiungi il gioco all'oggetto window per debug
        window.game = game;
        
    } catch (error) {
        console.error('Errore durante l\'avvio del gioco:', error);
        document.body.innerHTML = `
            <div style="color: red; text-align: center; margin-top: 50px;">
                <h2>Errore di avvio</h2>
                <p>${error.message}</p>
                <p>Controlla la console per maggiori dettagli.</p>
            </div>
        `;
    }
});

// Funzioni di utility globali per debug
window.debugGame = {
    teleportPlayer: (x, y) => {
        if (window.game) {
            window.game.player.x = x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
            window.game.player.y = y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        }
    },
    
    showPlayerPosition: () => {
        if (window.game) {
            const pos = window.game.player.getTilePosition();
            console.log(`Player position: ${pos.x}, ${pos.y}`);
        }
    },
    
    toggleGodMode: () => {
        if (window.game) {
            window.game.player.walkSpeed = window.game.player.walkSpeed === CONFIG.PLAYER_SPEED ? 
                CONFIG.PLAYER_SPEED * 3 : CONFIG.PLAYER_SPEED;
            console.log('God mode:', window.game.player.walkSpeed > CONFIG.PLAYER_SPEED ? 'ON' : 'OFF');
        }
    }
};
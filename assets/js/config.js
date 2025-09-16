const CONFIG = {
    TILE_SIZE: 32,
    MAP_WIDTH: 40,
    MAP_HEIGHT: 30,
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    PLAYER_SPEED: 2,
    ANIMATION_SPEED: 0.15,
    PLAYER_GENDER: 'male', // Verrà impostato durante l'intro
    
    COLORS: {
        GRASS: '#4a7c47',
        DARK_GRASS: '#3a6b37',
        PATH: '#d4b896',
        WATER: '#4a90e2',
        BUILDING_ROOF: '#8b4513',
        BUILDING_WALL: '#deb887',
        TREE: '#2d5016',
        TREE_TRUNK: '#8b4513',
        FLOWER_1: '#ff69b4',
        FLOWER_2: '#ffff00',
        ROCK: '#696969'
    },
    
    BUILDINGS: [
        {
            x: 15, y: 8, width: 6, height: 5,
            type: 'projects',
            name: 'Centro Progetti',
            entrance: { x: 18, y: 13 },
            color: '#ff6b6b'
        },
        {
            x: 8, y: 15, width: 4, height: 4,
            type: 'skills',
            name: 'Accademia Skills',
            entrance: { x: 10, y: 19 },
            color: '#4ecdc4'
        },
        {
            x: 25, y: 12, width: 5, height: 4,
            type: 'about',
            name: 'Casa Personale',
            entrance: { x: 27, y: 16 },
            color: '#45b7d1'
        },
        {
            x: 5, y: 5, width: 4, height: 3,
            type: 'contact',
            name: 'Ufficio Contatti',
            entrance: { x: 7, y: 8 },
            color: '#96ceb4'
        }
    ],
    
    DIALOGS: {
        projects: "Benvenuto nel Centro Progetti di SilverStudio!\n\nQui puoi vedere tutti i miei lavori più importanti: applicazioni web innovative, giochi interattivi, API scalabili e molto altro. Ogni progetto racconta una storia di creatività e problem-solving!",
        skills: "Accademia Skills di SilverStudio!\n\nQui trovi tutte le mie competenze tecniche in continua evoluzione: JavaScript, React, Node.js, Python, database avanzati e tecnologie cloud. L'apprendimento non si ferma mai!",
        about: "Casa Personale di SilverStudio!\n\nScopri chi sono, la mia storia e il mio percorso nel mondo dello sviluppo. Dalle prime righe di codice fino ai progetti più ambiziosi. Benvenuto nel mio universo creativo!",
        contact: "Ufficio Contatti di SilverStudio!\n\nVuoi collaborare? Hai un progetto in mente? Sei nel posto giusto! Sono sempre aperto a nuove opportunità, sfide interessanti e partnership creative. Contattiamoci!"
    }
};
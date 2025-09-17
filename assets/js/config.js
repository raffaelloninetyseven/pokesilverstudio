const CONFIG = {
    TILE_SIZE: 32,
    MAP_WIDTH: 60,  // Mappa più grande
    MAP_HEIGHT: 45,
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    PLAYER_SPEED: 2,
    ANIMATION_SPEED: 0.15,
    PLAYER_GENDER: 'male',
    
    // Nuovi tipi di tile per varietà
    TILE_TYPES: {
        GRASS: 'grass',
        DARK_GRASS: 'dark_grass',
        PATH: 'path',
        WATER: 'water',
        SAND: 'sand',
        STONE: 'stone',
        BRIDGE: 'bridge'
    },
    
    COLORS: {
        GRASS: '#4a7c47',
        DARK_GRASS: '#3a6b37',
        PATH: '#d4b896',
        WATER: '#4a90e2',
        SAND: '#f4e4bc',
        STONE: '#8c8c8c',
        BRIDGE: '#8b4513',
        BUILDING_ROOF: '#8b4513',
        BUILDING_WALL: '#deb887',
        TREE: '#2d5016',
        TREE_TRUNK: '#8b4513',
        FLOWER_1: '#ff69b4',
        FLOWER_2: '#ffff00',
        ROCK: '#696969'
    },
    
    // Edifici ridisegnati con interni accessibili
    BUILDINGS: [
        {
            x: 25, y: 12, width: 8, height: 6,
            type: 'projects',
            name: 'Centro Sviluppo',
            entrance: { x: 28, y: 18 },
            color: '#ff6b6b',
            hasInterior: true,
            interiorMap: 'projects_interior'
        },
        {
            x: 12, y: 20, width: 6, height: 5,
            type: 'skills',
            name: 'Laboratorio Skills',
            entrance: { x: 15, y: 25 },
            color: '#4ecdc4',
            hasInterior: true,
            interiorMap: 'skills_interior'
        },
        {
            x: 40, y: 15, width: 7, height: 6,
            type: 'about',
            name: 'Studio Personale',
            entrance: { x: 43, y: 21 },
            color: '#45b7d1',
            hasInterior: true,
            interiorMap: 'about_interior'
        },
        {
            x: 8, y: 8, width: 5, height: 4,
            type: 'contact',
            name: 'Ufficio Contatti',
            entrance: { x: 10, y: 12 },
            color: '#96ceb4',
            hasInterior: true,
            interiorMap: 'contact_interior'
        }
    ],
    
    DIALOGS: {
        projects: "Benvenuto nel Centro Sviluppo!\n\nQui trovi tutti i miei progetti: applicazioni web, API, sistemi complessi e soluzioni innovative. Ogni progetto rappresenta una sfida superata!",
        skills: "Laboratorio Skills!\n\nQui sviluppo e perfeziono le mie competenze: JavaScript, React, Node.js, Python, cloud computing e molto altro. L'innovazione non si ferma mai!",
        about: "Studio Personale!\n\nScopri la mia storia, il mio percorso professionale e la passione che mi guida nel mondo dello sviluppo. Benvenuto nel mio universo creativo!",
        contact: "Ufficio Contatti!\n\nHai un progetto? Cerchi collaborazioni? Questo è il posto giusto! Sono sempre aperto a nuove sfide e opportunità interessanti."
    }
};
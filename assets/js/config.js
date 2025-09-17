const CONFIG = {
    TILE_SIZE: 40,
    MAP_WIDTH: 50,  
    MAP_HEIGHT: 40,
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    PLAYER_SPEED: 3,
    ANIMATION_SPEED: 0.15,
    PLAYER_GENDER: 'male',
    
    COLORS: {
        'GRASS-FLOWERS': '#4a7c47', 
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
    
    BUILDINGS: [
        // Centro sviluppo (Department Store equivalente) - edificio principale più grande
        {
            x: 8, y: 15, width: 8, height: 10,
            type: 'projects',
            name: 'Silver Department',
            entrance: { x: 11, y: 25 },
            color: '#ff6b6b',
            hasInterior: true,
            interiorMap: 'projects_interior'
        },
        // Game Corner (Casinò) - mantenuto come richiesto
        {
            x: 25, y: 20, width: 6, height: 6,
            type: 'casino',
            name: 'Lucky Skills Casino',
            entrance: { x: 28, y: 26 },
            color: '#ffd700',
            hasInterior: true,
            interiorMap: 'casino_interior'
        },
        // Mansion (Studio personale)
        {
            x: 35, y: 10, width: 7, height: 8,
            type: 'about',
            name: 'Silver Mansion',
            entrance: { x: 38, y: 18 },
            color: '#45b7d1',
            hasInterior: true,
            interiorMap: 'about_interior'
        },
        // Pokémon Center equivalente (Contatti)
        {
            x: 15, y: 5, width: 6, height: 5,
            type: 'contact',
            name: 'Contact Center',
            entrance: { x: 18, y: 10 },
            color: '#96ceb4',
            hasInterior: true,
            interiorMap: 'contact_interior'
        },
        // Gym equivalente (Skills Lab)
        {
            x: 5, y: 28, width: 8, height: 6,
            type: 'skills',
            name: 'Skills Gym',
            entrance: { x: 9, y: 34 },
            color: '#4ecdc4',
            hasInterior: true,
            interiorMap: 'skills_interior'
        }
    ],
    
    DIALOGS: {
        projects: "Benvenuto al Silver Department!\n\nIl negozio più grande della città! Qui trovi tutti i miei progetti organizzati per categoria: Web Apps, API, Mobile, AI e molto altro. Ogni piano ha una specializzazione diversa!",
        casino: "Benvenuto al Lucky Skills Casino!\n\nTesta la fortuna mentre esplori le mie competenze! Ogni slot machine rappresenta una tecnologia diversa. Chissà quali sorprese ti aspettano!",
        about: "Benvenuto alla Silver Mansion!\n\nLa mia residenza personale dove sviluppo le idee più innovative. Qui puoi scoprire la mia storia, il mio percorso e le passioni che guidano il mio lavoro.",
        contact: "Benvenuto al Contact Center!\n\nIl centro nevralgico per tutte le comunicazioni! Qui puoi contattarmi per progetti, collaborazioni o semplicemente per una chiacchierata tecnica.",
        skills: "Benvenuto alla Skills Gym!\n\nAllena le tue conoscenze tecniche! Questo è dove perfeziono continuamente le mie competenze e affronto nuove sfide di programmazione."
    }
};
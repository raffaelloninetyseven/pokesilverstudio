const CONFIG = {
    TILE_SIZE: 40,
    MAP_WIDTH: 50,  
    MAP_HEIGHT: 40,
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    PLAYER_SPEED: 3,
    PLAYER_RUN_SPEED: 8,
    ANIMATION_SPEED: 0.15,
    PLAYER_GENDER: 'male',
    
    // POSIZIONE SPAWN 
    PLAYER_SPAWN_X: 24,
    PLAYER_SPAWN_Y: 16,  
    
    COLORS: {
        'GRASS-FLOWERS': '#4a7c47', 
        PATH: '#c8a882',
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
        ROCK: '#8B4513'
    },
    
    // EDIFICI AGGIORNATI con le posizioni corrette
    BUILDINGS: [
        // Edificio blu grande nord-ovest (Department Store)
        {
            x: 3, y: 2, width: 8, height: 8,
            type: 'projects',
            name: 'Silver Department',
            entrance: { x: 7, y: 10 },
            color: '#4169E1',
            hasInterior: true,
            interiorMap: 'projects_interior'
        },
        
        // Game Corner giallo-rosso (casinò)
        {
            x: 17, y: 2, width: 6, height: 7,
            type: 'casino',
            name: 'Game Corner',
            entrance: { x: 20, y: 9 },
            color: '#FFD700',
            hasInterior: true,
            interiorMap: 'casino_interior'
        },
        
        // Mansion marrone grande nord-est
        {
            x: 28, y: 2, width: 10, height: 8,
            type: 'about',
            name: 'Silver Mansion', 
            entrance: { x: 32, y: 10 },
            color: '#8B4513',
            hasInterior: true,
            interiorMap: 'about_interior'
        },
        
        // Contact Center rosa est
        {
            x: 35, y: 14, width: 6, height: 4,
            type: 'contact',
            name: 'Contact Center',
            entrance: { x: 38, y: 18 },
            color: '#FF69B4',
            hasInterior: true,
            interiorMap: 'contact_interior'
        },
        
        // Skills Gym verde sud-ovest
        {
            x: 3, y: 18, width: 6, height: 6,
            type: 'skills',
            name: 'Skills Gym',
            entrance: { x: 6, y: 24 },
            color: '#32CD32',
            hasInterior: true,
            interiorMap: 'skills_interior'
        },
        
        // Edifici decorativi
        {
            x: 18, y: 14, width: 4, height: 3,
            type: 'decoration',
            name: 'Casa Residenziale',
            entrance: { x: 20, y: 17 },
            color: '#DEB887',
            hasInterior: false
        },
        
        {
            x: 28, y: 14, width: 3, height: 3,
            type: 'decoration', 
            name: 'Piccolo Negozio',
            entrance: { x: 29, y: 17 },
            color: '#CD853F',
            hasInterior: false
        },
        
        {
            x: 18, y: 20, width: 4, height: 4,
            type: 'decoration',
            name: 'Condominio',
            entrance: { x: 20, y: 24 },
            color: '#A0522D',
            hasInterior: false
        },
        
        {
            x: 42, y: 2, width: 4, height: 4,
            type: 'decoration',
            name: 'Villa',
            entrance: { x: 44, y: 6 },
            color: '#8A2BE2',
            hasInterior: false
        },
        
        {
            x: 42, y: 20, width: 3, height: 3,
            type: 'decoration',
            name: 'Market',
            entrance: { x: 43, y: 23 },
            color: '#FF8C00',
            hasInterior: false
        }
    ],
    
    DIALOGS: {
        projects: "Benvenuto al Silver Department!\n\nQui puoi esplorare tutti i miei progetti e lavori. Ogni piano è dedicato a tecnologie diverse: Web Development, Mobile Apps, AI Projects e molto altro!",
        casino: "Benvenuto al Game Corner!\n\nMetti alla prova le tue conoscenze tecniche! Ogni gioco rappresenta una sfida diversa nel mondo dello sviluppo software.",
        about: "Benvenuto alla Silver Mansion!\n\nQuesta è la mia dimora digitale dove sviluppo le idee più innovative. Scopri la mia storia, il mio percorso e le passioni che guidano il mio lavoro.",
        contact: "Benvenuto al Contact Center!\n\nQui puoi trovare tutti i modi per contattarmi: email, social media, LinkedIn e molto altro. Sono sempre disponibile per nuove collaborazioni!",
        skills: "Benvenuto alla Skills Gym!\n\nQuesta è la palestra delle competenze! Qui alleno continuamente le mie abilità tecniche e affronto nuove sfide di programmazione.",
        decoration: "Questo è un edificio della città.\n\nFa parte del paesaggio urbano ma non è accessibile al momento."
    }
};
// config.js
const Config = {
    FPS: 60,
    CANVAS_WIDTH: window.innerWidth,
    CANVAS_HEIGHT: window.innerHeight,
    WORLD_SIZE: 3000,
    TILE_SIZE: 80,
    COLORS: {
        BG: '#060614',
        PLAYER: '#00ffcc',
        PLAYER_ORBIT: '#00aaff',
        ENEMY_NORM: '#ff3366',
        ENEMY_FAST: '#ff9900',
        ENEMY_TANK: '#990033',
        BOSS: '#ff00ff',
        BOSS_SHIELD: '#aa00aa',
        EXP: '#00ffff',
        COIN: '#ffcc00',
        DMG_TEXT: '#ffffff',
        CRIT_TEXT: '#ff3300'
    },
    RATES: {
        COMMON: 0.55,
        RARE: 0.25,
        EPIC: 0.15,
        LEGENDARY: 0.05
    }
};
// main.js
window.onload = () => {
    window.game = new Game();
    const engine = new Engine(window.game);
    engine.start();
    window.game.ui.showScreen('main-menu');
};
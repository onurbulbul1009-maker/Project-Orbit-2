// engine.js
class Engine {
    constructor(game) {
        this.game = game;
        this.lastTime = performance.now();
        this.loop = this.loop.bind(this);
    }
    start() { requestAnimationFrame(this.loop); }
    loop(time) {
        let dt = (time - this.lastTime) / 1000;
        if(dt > 0.1) dt = 0.1; 
        this.lastTime = time;
        this.game.update(dt);
        this.game.draw();
        requestAnimationFrame(this.loop);
    }
}
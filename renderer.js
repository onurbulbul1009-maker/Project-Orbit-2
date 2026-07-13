// renderer.js
class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        Config.CANVAS_WIDTH = this.canvas.width;
        Config.CANVAS_HEIGHT = this.canvas.height;
    }
    clear() {
        this.ctx.fillStyle = Config.COLORS.BG;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    drawGrid(camera) {
        this.ctx.strokeStyle = '#111122';
        this.ctx.lineWidth = 1;
        const startX = Math.floor(camera.pos.x / Config.TILE_SIZE) * Config.TILE_SIZE;
        const startY = Math.floor(camera.pos.y / Config.TILE_SIZE) * Config.TILE_SIZE;
        for (let x = startX; x < camera.pos.x + Config.CANVAS_WIDTH; x += Config.TILE_SIZE) {
            this.ctx.beginPath(); this.ctx.moveTo(x, camera.pos.y); this.ctx.lineTo(x, camera.pos.y + Config.CANVAS_HEIGHT); this.ctx.stroke();
        }
        for (let y = startY; y < camera.pos.y + Config.CANVAS_HEIGHT; y += Config.TILE_SIZE) {
            this.ctx.beginPath(); this.ctx.moveTo(camera.pos.x, y); this.ctx.lineTo(camera.pos.x + Config.CANVAS_WIDTH, y); this.ctx.stroke();
        }
    }
    circle(x, y, r, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath(); this.ctx.arc(x, y, r, 0, Math.PI * 2); this.ctx.fill();
    }
}
// camera.js
class Camera {
    constructor() { this.pos = new Vec2(); this.shakeTimer = 0; this.shakeIntensity = 0; }
    update(target, dt) {
        this.pos.x += (target.x - Config.CANVAS_WIDTH / 2 - this.pos.x) * 5 * dt;
        this.pos.y += (target.y - Config.CANVAS_HEIGHT / 2 - this.pos.y) * 5 * dt;
        if (this.shakeTimer > 0) {
            this.pos.x += Random.range(-this.shakeIntensity, this.shakeIntensity);
            this.pos.y += Random.range(-this.shakeIntensity, this.shakeIntensity);
            this.shakeTimer -= dt;
        }
    }
    screenToWorld(screenVec) {
        return new Vec2(screenVec.x + this.pos.x, screenVec.y + this.pos.y);
    }
    shake(duration, intensity) { this.shakeTimer = duration; this.shakeIntensity = intensity; }
    apply(ctx) { ctx.save(); ctx.translate(-this.pos.x, -this.pos.y); }
    clear(ctx) { ctx.restore(); }
}
// entity.js
class Entity {
    constructor(x, y, radius, color) {
        this.pos = new Vec2(x, y);
        this.vel = new Vec2();
        this.radius = radius;
        this.color = color;
        this.active = true;
    }
    update(dt) { this.pos = this.pos.add(this.vel.mult(dt)); }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2); ctx.fill();
    }
}
// effects.js
class FloatingText {
    constructor(x, y, text, color, isCrit) {
        this.pos = new Vec2(x, y);
        this.vel = new Vec2(Random.range(-20, 20), Random.range(-50, -100));
        this.text = text;
        this.color = color;
        this.life = 1.0;
        this.size = isCrit ? 24 : 16;
        this.isCrit = isCrit;
    }
    update(dt) {
        this.pos = this.pos.add(this.vel.mult(dt));
        this.life -= dt;
    }
    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${this.size}px Arial`;
        ctx.fillText(this.text, this.pos.x, this.pos.y);
        ctx.globalAlpha = 1.0;
    }
}
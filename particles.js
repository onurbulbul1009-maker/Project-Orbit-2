// particles.js
class Particle {
    constructor(x, y, color, speed, life) {
        this.pos = new Vec2(x, y);
        this.vel = new Vec2(Random.range(-1, 1), Random.range(-1, 1)).normalize().mult(speed * Random.range(0.5, 1.5));
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = Random.range(2, 5);
    }
    update(dt) {
        this.pos = this.pos.add(this.vel.mult(dt));
        this.life -= dt;
    }
    draw(ctx) {
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}
class ParticleSystem {
    constructor() { this.particles = []; }
    emit(x, y, color, count, speed=100, life=0.5) {
        for(let i=0; i<count; i++) this.particles.push(new Particle(x, y, color, speed, life));
    }
    update(dt) {
        for(let i = this.particles.length-1; i>=0; i--) {
            this.particles[i].update(dt);
            if(this.particles[i].life <= 0) this.particles.splice(i, 1);
        }
    }
    draw(ctx) { this.particles.forEach(p => p.draw(ctx)); }
}
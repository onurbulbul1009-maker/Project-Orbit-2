// boss.js
class Boss extends Enemy {
    constructor(x, y, scaling) {
        super(x, y, 'boss', scaling);
        this.color = Config.COLORS.BOSS;
        this.radius = 45;
        this.hp = 1200 * scaling.hp;
        this.maxHp = this.hp;
        this.damage = 25 * scaling.dmg;
        this.expValue = 1000;
        this.phase = 1;
        this.stateTimer = 3.0;
        this.bossRotation = 0;
    }
    update(dt, player) {
        this.bossRotation += 1.5 * dt;
        if(this.hp < this.maxHp * 0.5 && this.phase === 1) {
            this.phase = 2; this.color = '#ff0055'; this.speed *= 1.4;
            window.game.camera.shake(1.5, 12);
            window.game.addFloatingText(this.pos.x, this.pos.y - 60, "BOSS ÖFKELENDİ!", '#ff0000', true);
        }
        
        this.stateTimer -= dt;
        if(this.stateTimer <= 0) {
            this.stateTimer = this.phase === 1 ? 4.0 : 2.0;
            const dashDir = player.pos.sub(this.pos).normalize();
            this.vel = dashDir.mult(this.speed * 4.5);
            window.game.particles.emit(this.pos.x, this.pos.y, this.color, 15, 150, 0.6);
        } else if (this.stateTimer < (this.phase === 1 ? 3.0 : 1.2)) {
            this.vel = player.pos.sub(this.pos).normalize().mult(this.speed);
        }
        
        let currentSpeed = this.vel.mag();
        if(this.status.slow > 0) { currentSpeed *= 0.5; this.status.slow -= dt; }
        if(this.status.burn > 0) { this.hp -= 15 * dt; this.status.burn -= dt; }
        if(this.status.poison > 0) { this.hp -= 10 * dt; this.status.poison -= dt; }
        
        this.pos = this.pos.add(this.vel.normalize().mult(currentSpeed * dt));
    }
    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.strokeStyle = Config.COLORS.BOSS_SHIELD;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, 0, this.radius + 15, this.bossRotation, this.bossRotation + Math.PI * 0.4); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, this.radius + 15, this.bossRotation + Math.PI, this.bossRotation + Math.PI * 1.4); ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20; 
        ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; 
        ctx.restore();
    }
}
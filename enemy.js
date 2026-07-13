// enemy.js
let enemyIdCounter = 0;
class Enemy extends Entity {
    constructor(x, y, type, scaling) {
        super(x, y, 14, Config.COLORS.ENEMY_NORM);
        this.id = enemyIdCounter++;
        this.type = type;
        
        this.hp = 25 * scaling.hp;
        this.maxHp = this.hp;
        this.speed = 110 * scaling.speed;
        this.damage = 12 * scaling.dmg;
        this.expValue = 15;
        this.pulseTimer = Math.random() * Math.PI; 
        
        this.status = { slow: 0, burn: 0, poison: 0 };
        this.orbitalHitTimer = 0; // Orbitalin saniyede milyon kere vurmasını engellemek için
        
        if(type === 'fast') { this.color = Config.COLORS.ENEMY_FAST; this.speed *= 1.4; this.hp *= 0.7; this.radius = 11; }
        if(type === 'tank') { this.color = Config.COLORS.ENEMY_TANK; this.speed *= 0.65; this.hp *= 3.5; this.radius = 22; }
    }
    
    update(dt, player) {
        let currentSpeed = this.speed;
        
        if(this.orbitalHitTimer > 0) this.orbitalHitTimer -= dt;
        if(this.status.slow > 0) { currentSpeed *= 0.5; this.status.slow -= dt; }
        if(this.status.burn > 0) { this.takeDamage(6 * dt, false, 'burn'); this.status.burn -= dt; }
        if(this.status.poison > 0) { this.takeDamage(4 * dt, false, 'poison'); this.status.poison -= dt; } 
        
        const dir = player.pos.sub(this.pos).normalize();
        this.vel = dir.mult(currentSpeed);
        super.update(dt);
        this.pulseTimer += 5 * dt;
    }
    
    takeDamage(amt, isCrit, type) {
        this.hp -= amt;
        
        // Ekranda kirlilik olmaması için sürekli vuran efektlerde yazı çıkarma
        if(type !== 'burn' && type !== 'poison' && type !== 'blackhole') {
            window.game.addFloatingText(this.pos.x, this.pos.y - 25, Math.floor(amt), isCrit ? Config.COLORS.CRIT_TEXT : Config.COLORS.DMG_TEXT, isCrit);
        }
        
        if(type === 'ice') this.status.slow = 2.0;
        if(type === 'fire') this.status.burn = 2.5;
        if(type === 'poison') this.status.poison = 4.0;
        
        if(this.hp <= 0 && this.active) {
            this.active = false;
            window.game.particles.emit(this.pos.x, this.pos.y, this.color, 12, 120, 0.4);
            window.game.spawnDrop(this.pos, this.expValue);
            Audio.exp();
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        const pulse = Math.sin(this.pulseTimer) * 2;
        const currentRadius = this.radius + pulse;

        if(this.status.poison > 0) ctx.strokeStyle = 'rgba(0, 255, 50, 0.5)';
        else if(this.status.burn > 0) ctx.strokeStyle = 'rgba(255, 100, 0, 0.5)';
        else ctx.strokeStyle = 'rgba(255, 0, 0, 0.2)';

        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 0, currentRadius + 5, 0, Math.PI * 2); ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.type === 'fast') {
            ctx.moveTo(0, -currentRadius); ctx.lineTo(currentRadius, currentRadius); ctx.lineTo(-currentRadius, currentRadius); ctx.closePath();
        } else if (this.type === 'tank') {
            ctx.rect(-currentRadius, -currentRadius, currentRadius*2, currentRadius*2);
        } else {
            ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
    }
}
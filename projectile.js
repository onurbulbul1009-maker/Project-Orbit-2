// projectile.js
class Projectile extends Entity {
    constructor(x, y, dir, type, stats) {
        super(x, y, 8, '#00ffff');
        this.type = type;
        this.dir = dir.normalize();
        this.speed = 400 * stats.projSpeedMult;
        this.damage = stats.baseDmg * stats.dmgMult;
        this.isCrit = Math.random() < stats.critChance;
        this.pierce = stats.pierce;
        this.ricochet = stats.ricochet || 0;
        this.life = 2.0;
        this.hitTargets = new Set();
        
        if(type === 'fire') { this.color = '#ff4400'; this.damage *= 1.3; }
        if(type === 'ice') { this.color = '#00ccff'; }
        if(type === 'poison') { this.color = '#00ff33'; }
        if(type === 'lightning') { this.color = '#ffff00'; this.speed *= 2; this.isCrit = true; }
        
        if(this.isCrit) this.damage *= stats.critMult;
        this.vel = this.dir.mult(this.speed);
    }
    update(dt) {
        super.update(dt);
        this.life -= dt;
        if(this.life <= 0) this.active = false;
    }
    hit(enemy) {
        if(this.hitTargets.has(enemy.id)) return false;
        this.hitTargets.add(enemy.id);
        
        enemy.takeDamage(this.damage, this.isCrit, this.type);

        // Can Çalma (Vampirism)
        if(window.game.player.stats.vampirism > 0) {
            window.game.player.hp = Math.min(window.game.player.maxHp, window.game.player.hp + (this.damage * window.game.player.stats.vampirism));
        }

        // Seken Mermi (Ricochet) Kontrolü
        if(this.ricochet > 0) {
            let nextTarget = null; 
            let minDist = 350; // Sekme menzili
            window.game.enemies.forEach(e => {
                if(!this.hitTargets.has(e.id) && e.active) {
                    let d = e.pos.dist(this.pos);
                    if(d < minDist) { minDist = d; nextTarget = e; }
                }
            });
            
            if(nextTarget) {
                this.ricochet--;
                this.dir = nextTarget.pos.sub(this.pos).normalize();
                this.vel = this.dir.mult(this.speed);
                this.life = 1.0; // Sektiğinde ömrünü tazele
                return true; // Mermi yok olmaz
            }
        }

        // Delip Geçme (Pierce) Kontrolü
        this.pierce--;
        if(this.pierce < 0) this.active = false;
        return true;
    }
}
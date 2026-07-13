// player.js

// Sana yardım edecek Amigo (Pet) Sınıfı
class Pet extends Entity {
    constructor(x, y) {
        super(x, y, 10, '#ff6600');
        this.shootTimer = 2.0;
    }
    update(dt, player) {
        let targetPos = player.pos.add(new Vec2(-45, -45)); // Oyuncunun sol üstünden takip eder
        this.vel = targetPos.sub(this.pos).mult(3); // Yumuşak takip (Lerp)
        super.update(dt);
        
        this.shootTimer -= dt;
        if(this.shootTimer <= 0) {
            let enemy = window.game.getClosestEnemy(this.pos);
            if(enemy) {
                let dir = enemy.pos.sub(this.pos);
                // Pet'in kendi mermi statları
                let stats = { projSpeedMult: 0.8, baseDmg: 8, dmgMult: 1, pierce: 0, ricochet: 0, critChance: 0 };
                window.game.projectiles.push(new Projectile(this.pos.x, this.pos.y, dir, 'fire', stats));
                this.shootTimer = 1.5;
            }
        }
    }
}

class Player extends Entity {
    constructor(x, y) {
        super(x, y, 16, SaveSystem.data.color || Config.COLORS.PLAYER);
        this.playerName = SaveSystem.data.playerName || "İsimsiz";
        
        const shopHp = (SaveSystem.data.upgrades['hp'] || 0) * 15;
        const shopDmg = (SaveSystem.data.upgrades['dmg'] || 0) * 0.1;
        const shopSpd = (SaveSystem.data.upgrades['spd'] || 0) * 0.05;
        const shopRegen = (SaveSystem.data.upgrades['regen'] || 0) * 1; 

        this.maxHp = 100 + shopHp;
        this.hp = this.maxHp;
        this.baseSpeed = 220;
        
        this.stats = {
            dmgMult: 1.0 + shopDmg,
            speedMult: 1.0 + shopSpd,
            baseDmg: 12,
            critChance: 0.08,
            critMult: 2.0,
            fireRate: 1.2,
            projSpeedMult: 1.1,
            projCount: 1,
            pierce: 0,
            magnetRadius: 130, 
            regenAmount: shopRegen,
            
            // Yeni Efsanevi Statlar
            ricochet: 0,
            vampirism: 0,
            thorns: 0,
            orbitals: 0,
            hasShockwave: false,
            hasPet: false,
            hasBlackhole: false
        };
        
        this.exp = 0;
        this.level = 1;
        this.maxExp = 100;
        this.shootTimer = 0;
        this.regenTimer = 1.0;
        this.projectiles = ['energy'];
        this.invincibility = 0;
        this.renderRotation = 0; 

        // Yetenek Zamanlayıcıları
        this.shockwaveTimer = 4.0;
        this.blackholeTimer = 15.0;
        this.orbitalsAngle = 0;
    }
    
    update(dt) {
        const inputDir = Input.getAxis();
        this.vel = inputDir.mult(this.baseSpeed * this.stats.speedMult);
        
        this.pos.x = Math.max(-Config.WORLD_SIZE/2, Math.min(Config.WORLD_SIZE/2, this.pos.x));
        this.pos.y = Math.max(-Config.WORLD_SIZE/2, Math.min(Config.WORLD_SIZE/2, this.pos.y));
        
        super.update(dt);
        
        // Can Yenileme
        if(this.stats.regenAmount > 0 && this.hp < this.maxHp) {
            this.regenTimer -= dt;
            if(this.regenTimer <= 0) {
                this.hp = Math.min(this.maxHp, this.hp + this.stats.regenAmount);
                this.regenTimer = 1.0;
            }
        }

        // Animasyon ve Yörünge Kalkanı Dönüşü
        this.renderRotation += 3 * dt;
        this.orbitalsAngle += 4 * dt;

        if(this.invincibility > 0) this.invincibility -= dt;
        
        // Klasik Atış Mantığı
        this.shootTimer -= dt;
        if(this.shootTimer <= 0) {
            this.shoot();
            this.shootTimer = 1.0 / this.stats.fireRate;
        }

        // Tribün Baskısı (Şok Dalgası) Yeteneği
        if(this.stats.hasShockwave) {
            this.shockwaveTimer -= dt;
            if(this.shockwaveTimer <= 0) {
                window.game.enemies.forEach(e => {
                    if(e.pos.dist(this.pos) < 250) { // 250px etki alanı
                        e.takeDamage(this.stats.baseDmg * this.stats.dmgMult * 2, false, 'shockwave');
                        e.vel = e.pos.sub(this.pos).normalize().mult(400); // Geri İtme (Knockback)
                        e.status.slow = 1.5; // Kısa süreli sersemletme etkisi
                    }
                });
                window.game.drawShockwave = { pos: this.pos.clone(), radius: 0, life: 0.5 }; // Görsel Efekt
                this.shockwaveTimer = 4.0; // Her 4 saniyede bir patlar
            }
        }

        // Kara Delik Yeteneği
        if(this.stats.hasBlackhole) {
            this.blackholeTimer -= dt;
            if(this.blackholeTimer <= 0 && window.game.enemies.length > 5) {
                let center = this.pos.clone();
                window.game.blackholes.push({ pos: center, life: 4.0, radius: 180 });
                this.blackholeTimer = 18.0; // Her 18 saniyede bir açılır
            }
        }
    }
    
    shoot() {
        let baseDir = new Vec2();
        if (SaveSystem.data.aimMode === 'manual') {
            const worldMouse = window.game.camera.screenToWorld(Input.mouse);
            baseDir = worldMouse.sub(this.pos);
            if (baseDir.mag() === 0) return; 
        } else {
            const target = window.game.getClosestEnemy(this.pos);
            if(!target) return;
            baseDir = target.pos.sub(this.pos);
        }
        
        Audio.shoot();
        this.projectiles.forEach(type => {
            for(let i=0; i<this.stats.projCount; i++) {
                const angleOffset = (i - (this.stats.projCount-1)/2) * 0.25;
                const dir = new Vec2(
                    baseDir.x * Math.cos(angleOffset) - baseDir.y * Math.sin(angleOffset),
                    baseDir.x * Math.sin(angleOffset) + baseDir.y * Math.cos(angleOffset)
                );
                window.game.addProjectile(new Projectile(this.pos.x, this.pos.y, dir, type, this.stats));
            }
        });
    }
    
    takeDamage(amt) {
        if(this.invincibility > 0) return;
        this.hp -= amt;
        this.invincibility = 0.4;
        Audio.hit();
        window.game.camera.shake(0.25, 7);
        if(this.hp <= 0) window.game.gameOver();
    }
    
    gainExp(amt) {
        this.exp += amt;
        if(this.exp >= this.maxExp) {
            this.exp -= this.maxExp;
            this.level++;
            this.maxExp *= 1.25;
            Audio.levelUp();
            window.game.triggerLevelUp();
        }
    }
    
    forceLevelUp() {
        this.level++;
        this.maxExp *= 1.25;
        Audio.levelUp();
        window.game.triggerLevelUp();
    }
    
    unlockProjectile(type) { if(!this.projectiles.includes(type)) this.projectiles.push(type); }
    
    draw(ctx) {
        if(this.invincibility > 0 && Math.floor(Date.now() / 80) % 2 === 0) return;

        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        
        // İsim Yazısı
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.playerName, 0, -this.radius - 15);
        
        ctx.rotate(this.renderRotation);

        // Karakter Modellemesi
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-this.radius, 0); ctx.lineTo(this.radius, 0);
        ctx.moveTo(0, -this.radius); ctx.lineTo(0, this.radius); ctx.stroke();

        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(0, 0, this.radius, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Yörünge Kalkanı (Orbitals) Modellemesi (Dönüşten etkilenmemesi için dışarıda çizilir)
        for(let i = 0; i < this.stats.orbitals; i++) {
            let angle = this.orbitalsAngle + (i * (Math.PI * 2 / this.stats.orbitals));
            let ox = this.pos.x + Math.cos(angle) * 55;
            let oy = this.pos.y + Math.sin(angle) * 55;
            
            ctx.fillStyle = '#ffaa00'; 
            ctx.beginPath(); ctx.arc(ox, oy, 8, 0, Math.PI * 2); ctx.fill();
            
            // Orbital Hasar Kontrolü
            window.game.enemies.forEach(e => {
                if(e.active && e.pos.dist(new Vec2(ox, oy)) < e.radius + 8) {
                    if(!e.orbitalHitTimer || e.orbitalHitTimer <= 0) { 
                        e.takeDamage(this.stats.baseDmg * 1.5, false, 'orbital'); 
                        e.orbitalHitTimer = 0.5; // Yarım saniyede bir vurur
                    }
                }
            });
        }
    }
}
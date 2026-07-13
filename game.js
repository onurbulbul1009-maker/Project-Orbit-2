// game.js
class Game {
    constructor() {
        this.state = 'MENU';
        this.renderer = new Renderer('game-canvas');
        this.ui = new UIManager();
        SaveSystem.load();
    }
   start() {
    this.reset();
    this.state = 'PLAY';
    this.ui.showScreen('hud');
    
    // Joystick görünürlüğü
    const joy = document.getElementById('joystick-zone');
    if (SaveSystem.data.controlMode === 'mobile') {
        joy.style.display = 'block'; 
    } else {
        joy.style.display = 'none';
    } }
    reset() {
        this.player = new Player(0, 0);
        this.camera = new Camera();
        this.waveManager = new WaveManager();
        this.enemies = [];
        this.projectiles = [];
        this.drops = [];
        this.floatingTexts = [];
        this.particles = new ParticleSystem();
        this.spatialHash = new SpatialHash(120);
        this.coinsEarned = 0;
        
        // Yeni Mekanik Dizileri
        this.blackholes = [];
        this.pet = null;
        this.drawShockwave = null;
    }
    
    spawnPet() {
        if(!this.pet) this.pet = new Pet(this.player.pos.x, this.player.pos.y);
    }

    togglePause() {
        if(this.state === 'PLAY') { this.state = 'PAUSE'; this.ui.showScreen('pause-screen'); }
        else if(this.state === 'PAUSE') { this.state = 'PLAY'; this.ui.showScreen('hud'); }
    }
    
    triggerLevelUp() {
        this.state = 'UPGRADE';
        const choices = UpgradeManager.getChoices(3);
        this.ui.showUpgrades(choices);
    }
    triggerWaveClearReward() { this.player.forceLevelUp(); }
    applyUpgrade(upgrade) {
        upgrade.apply(this.player);
        this.state = 'PLAY';
        this.ui.showScreen('hud');
    }
    
    gameOver() {
        this.state = 'GAMEOVER';
        SaveSystem.addCoins(this.coinsEarned);
        document.getElementById('go-waves').innerText = this.waveManager.currentWave;
        document.getElementById('go-coins').innerText = this.coinsEarned;
        this.ui.showScreen('game-over-screen');
    }
    
    spawnDrop(pos, exp) {
        this.drops.push({ pos: pos.clone(), exp: exp, radius: 6, active: true, isCoin: Math.random() < 0.18 });
    }
    addFloatingText(x, y, text, color, isCrit) {
        this.floatingTexts.push(new FloatingText(x, y, text, color, isCrit));
    }
    addProjectile(p) { this.projectiles.push(p); }
    getClosestEnemy(pos) {
        let closest = null; let minDist = Infinity;
        this.enemies.forEach(e => {
            const d = e.pos.dist(pos);
            if(d < minDist) { minDist = d; closest = e; }
        });
        return closest;
    }
    
    update(dt) {
        if(this.state !== 'PLAY') return;

        this.player.update(dt);
        this.camera.update(this.player.pos, dt);
        this.waveManager.update(dt, this.player.pos);
        this.particles.update(dt);
        
        if(this.pet) this.pet.update(dt, this.player);

        // Kara Delik (Blackhole) Fizikleri
        for(let i = this.blackholes.length - 1; i >= 0; i--) {
            let bh = this.blackholes[i];
            bh.life -= dt;
            this.enemies.forEach(e => {
                let dist = e.pos.dist(bh.pos);
                if(dist < bh.radius) {
                    e.vel = bh.pos.sub(e.pos).normalize().mult(150); // Merkeze doğru çek
                    e.takeDamage(20 * dt, false, 'blackhole'); // Merkezde ezilme hasarı
                }
            });
            if(bh.life <= 0) this.blackholes.splice(i, 1);
        }

        this.spatialHash.clear();
        this.enemies.forEach(e => { if(e.active) { e.update(dt, this.player); this.spatialHash.insert(e); } });

        this.projectiles.forEach(p => {
            p.update(dt);
            if(!p.active) return;
            const potentials = this.spatialHash.retrieve(p);
            for(let e of potentials) {
                if(e.active && Collision.checkCircle(p, e)) {
                    if(!p.hit(e)) break;
                }
            }
        });

        this.enemies.forEach(e => {
            if(e.active && Collision.checkCircle(this.player, e)) {
                this.player.takeDamage(e.damage);
                // Dikenli Zırh Kontrolü
                if(this.player.stats.thorns > 0) { e.takeDamage(this.player.stats.thorns, false, 'normal'); }
            }
        });

        this.drops.forEach(d => {
            if(!d.active) return;
            const dist = d.pos.dist(this.player.pos);
            if(dist < this.player.stats.magnetRadius) { 
                d.pos = d.pos.add(this.player.pos.sub(d.pos).normalize().mult(450 * dt)); 
            }
            if(dist < this.player.radius + d.radius) {
                d.active = false;
                if(d.isCoin) this.coinsEarned += 5;
                else this.player.gainExp(d.exp);
            }
        });

        this.enemies = this.enemies.filter(e => e.active);
        this.projectiles = this.projectiles.filter(p => p.active);
        this.drops = this.drops.filter(d => d.active);
        
        this.floatingTexts.forEach(ft => ft.update(dt));
        this.floatingTexts = this.floatingTexts.filter(ft => ft.life > 0);

        this.ui.updateHUD(this.player, this.waveManager.currentWave, this.coinsEarned, this.enemies.length);
        
        // Şok Dalgası Görsel Büyümesi
        if(this.drawShockwave) {
            this.drawShockwave.radius += 800 * dt;
            this.drawShockwave.life -= dt;
            if(this.drawShockwave.life <= 0) this.drawShockwave = null;
        }
    }
    
    draw() {
        this.renderer.clear();
        if(this.state === 'MENU') return;
        
        const ctx = this.renderer.ctx;
        this.camera.apply(ctx);
        this.renderer.drawGrid(this.camera);
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 10;
        ctx.strokeRect(-Config.WORLD_SIZE/2, -Config.WORLD_SIZE/2, Config.WORLD_SIZE, Config.WORLD_SIZE);
        
        // Şok Dalgası Çizimi
        if(this.drawShockwave) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.drawShockwave.life})`;
            ctx.lineWidth = 10;
            ctx.beginPath(); ctx.arc(this.drawShockwave.pos.x, this.drawShockwave.pos.y, this.drawShockwave.radius, 0, Math.PI * 2); ctx.stroke();
        }

        // Kara Delik Çizimi
        this.blackholes.forEach(bh => {
            ctx.fillStyle = `rgba(30, 0, 50, ${Math.min(1, bh.life)})`; // Mor Karanlık
            ctx.beginPath(); ctx.arc(bh.pos.x, bh.pos.y, bh.radius, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000'; // Merkez Noktası
            ctx.beginPath(); ctx.arc(bh.pos.x, bh.pos.y, 25, 0, Math.PI * 2); ctx.fill();
        });

        this.drops.forEach(d => { this.renderer.circle(d.pos.x, d.pos.y, d.radius, d.isCoin ? Config.COLORS.COIN : Config.COLORS.EXP); });

        this.particles.draw(ctx);
        this.projectiles.forEach(p => p.draw(ctx));
        this.enemies.forEach(e => {
            e.draw(ctx);
            ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(e.pos.x - 12, e.pos.y - e.radius - 12, 24, 4);
            ctx.fillStyle = '#ff3336'; ctx.fillRect(e.pos.x - 12, e.pos.y - e.radius - 12, 24 * (e.hp/e.maxHp), 4);
        });

        if(this.pet) this.pet.draw(ctx);
        this.player.draw(ctx);
        this.floatingTexts.forEach(ft => ft.draw(ctx));
        this.camera.clear(ctx);
    }
}

// waveManager.js
class WaveManager {
    constructor() {
        this.currentWave = 1;
        this.waveState = 'START_DELAY';
        this.stateTimer = 2.0; 
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.scaling = { hp: 1.0, dmg: 1.0, speed: 1.0 };
    }
    initiateWave(waveNum) {
        this.currentWave = waveNum;
        this.waveState = 'SPAWNING';
        this.spawnQueue = [];
        this.spawnTimer = 0;
        this.scaling.hp = 1.0 + (waveNum - 1) * 0.35;
        this.scaling.dmg = 1.0 + (waveNum - 1) * 0.20;
        this.scaling.speed = Math.min(1.5, 1.0 + (waveNum - 1) * 0.05);

        if (waveNum % 5 === 0) {
            this.spawnQueue.push({ type: 'boss', count: 1 });
        } else {
            let normalCount = 5 + waveNum * 3;
            let fastCount = waveNum > 1 ? 2 + waveNum * 2 : 0;
            let tankCount = waveNum > 2 ? 1 + Math.floor(waveNum / 2) : 0;

            for(let i = 0; i < normalCount; i++) this.spawnQueue.push({ type: 'normal' });
            for(let i = 0; i < fastCount; i++) this.spawnQueue.push({ type: 'fast' });
            for(let i = 0; i < tankCount; i++) this.spawnQueue.push({ type: 'tank' });
        }
        window.game.addFloatingText(window.game.player.pos.x, window.game.player.pos.y - 50, `DALGA ${this.currentWave}`, '#ffcc00', true);
    }
    update(dt, playerPos) {
        switch (this.waveState) {
            case 'START_DELAY':
                this.stateTimer -= dt;
                if (this.stateTimer <= 0) this.initiateWave(this.currentWave);
                break;
            case 'SPAWNING':
                this.spawnTimer -= dt;
                if (this.spawnTimer <= 0 && this.spawnQueue.length > 0) {
                    const nextEnemy = this.spawnQueue.shift();
                    this.spawnEnemy(nextEnemy.type, playerPos);
                    this.spawnTimer = 0.25; 
                }
                if (this.spawnQueue.length === 0) this.waveState = 'FIGHTING';
                break;
            case 'FIGHTING':
                if (window.game.enemies.length === 0) {
                    this.waveState = 'CLEARED';
                    this.stateTimer = 1.0; 
                }
                break;
            case 'CLEARED':
                this.stateTimer -= dt;
                if (this.stateTimer <= 0) {
                    this.currentWave++;
                    this.waveState = 'START_DELAY';
                    this.stateTimer = 2.0;
                    window.game.triggerWaveClearReward();
                }
                break;
        }
    }
    spawnEnemy(type, playerPos) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(Config.CANVAS_WIDTH, Config.CANVAS_HEIGHT) * 0.6;
        const x = playerPos.x + Math.cos(angle) * dist;
        const y = playerPos.y + Math.sin(angle) * dist;
        if (type === 'boss') window.game.enemies.push(new Boss(x, y, this.scaling));
        else window.game.enemies.push(new Enemy(x, y, type, this.scaling));
    }
}
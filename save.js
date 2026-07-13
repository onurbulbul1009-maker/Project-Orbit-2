// save.js
class SaveSystem {
    static KEY = 'ArcaneOrbitSaveData';
    static data = { 
        playerName: '', 
        color: '#00ffcc', 
        aimMode: 'auto',
        controlMode: 'pc', // İŞTE BURASI: PC mi Mobil mi tuttuğumuz yer
        coins: 0, 
        upgrades: {}, 
        stats: { enemiesKilled: 0 } 
    };
    static load() {
        const saved = localStorage.getItem(this.KEY);
        if (saved) this.data = { ...this.data, ...JSON.parse(saved) };
    }
    static save() { localStorage.setItem(this.KEY, JSON.stringify(this.data)); }
    static addCoins(amount) { this.data.coins += amount; this.save(); }
    static buyUpgrade(id, cost) {
        if (this.data.coins >= cost) {
            this.data.coins -= cost;
            this.data.upgrades[id] = (this.data.upgrades[id] || 0) + 1;
            this.save();
            return true;
        }
        return false;
    }
    static resetAll() {
        localStorage.removeItem(this.KEY);
        this.data = { playerName: '', color: '#00ffcc', aimMode: 'auto', controlMode: 'pc', coins: 0, upgrades: {}, stats: { enemiesKilled: 0 } };
        location.reload();
    }
}
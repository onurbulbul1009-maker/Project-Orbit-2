// ui.js
class UIManager {
    constructor() {
        this.screens = document.querySelectorAll('.screen');
        this.hpBar = document.getElementById('hp-bar');
        this.expBar = document.getElementById('exp-bar');
        this.coinDisplay = document.querySelector('#coin-display span');
        this.timerDisplay = document.getElementById('timer-display');
        this.nameInput = document.getElementById('player-name-input');
        this.nameDisplay = document.getElementById('player-name-display');
        
        this.settingAim = document.getElementById('setting-aim');
        this.settingColor = document.getElementById('setting-color');
        this.settingControl = document.getElementById('setting-control'); // Yeni
        
        this.initSettings();
        this.bindEvents();
    }
    initSettings() {
        this.nameInput.value = SaveSystem.data.playerName;
        this.settingAim.value = SaveSystem.data.aimMode;
        this.settingColor.value = SaveSystem.data.color;
        this.settingControl.value = SaveSystem.data.controlMode || 'pc'; // Yeni
    }
    bindEvents() {
        document.getElementById('btn-play').onclick = () => { 
            Audio.button(); 
            SaveSystem.data.playerName = this.nameInput.value.trim() || "İsimsiz";
            SaveSystem.save();
            window.game.start(); 
        };
        document.getElementById('btn-resume').onclick = () => { Audio.button(); window.game.togglePause(); };
        const backToMenu = () => { Audio.button(); window.game.reset(); this.showScreen('main-menu'); };
        document.getElementById('btn-menu').onclick = backToMenu;
        document.getElementById('btn-go-menu').onclick = backToMenu;
        document.getElementById('btn-restart').onclick = () => { Audio.button(); window.game.start(); };
        document.getElementById('btn-shop').onclick = () => { Audio.button(); this.showScreen('shop-screen'); this.renderShop(); };
        document.getElementById('btn-shop-back').onclick = () => { Audio.button(); this.showScreen('main-menu'); };
        document.getElementById('btn-settings').onclick = () => { Audio.button(); this.showScreen('settings-screen'); };
        
        document.getElementById('btn-settings-back').onclick = () => { 
            Audio.button(); 
            SaveSystem.data.aimMode = this.settingAim.value;
            SaveSystem.data.color = this.settingColor.value;
            SaveSystem.data.controlMode = this.settingControl.value; // Yeni Kayıt
            SaveSystem.save();
            this.showScreen('main-menu'); 
        };
        document.getElementById('btn-reset-save').onclick = () => {
            if(confirm("Tüm altınların, kalıcı geliştirmelerin ve ayarların silinecek. Emin misin?")) SaveSystem.resetAll();
        };
    }
    showScreen(id) {
        this.screens.forEach(s => s.classList.remove('active'));
        if(id) document.getElementById(id).classList.add('active');
    }
    updateHUD(player, wave, coins, remainingEnemies) {
        this.hpBar.style.width = `${Math.max(0, (player.hp / player.maxHp) * 100)}%`;
        this.expBar.style.width = `${(player.exp / player.maxExp) * 100}%`;
        this.coinDisplay.innerText = coins;
        this.nameDisplay.innerText = player.playerName;
        
        if (window.game.waveManager.waveState === 'START_DELAY') {
            this.timerDisplay.innerText = `Yeni Dalga Geliyor...`;
        } else {
            this.timerDisplay.innerText = `Dalga: ${wave} | Kalan: ${remainingEnemies}`;
        }
    }
    showUpgrades(choices) {
        this.showScreen('upgrade-screen');
        const container = document.getElementById('upgrade-cards');
        container.innerHTML = '';
        choices.forEach(u => {
            const card = document.createElement('div');
            card.className = `upgrade-card rarity-${u.rarity.toLowerCase()}`;
            card.innerHTML = `<h3>${u.name}</h3><p>${u.desc}</p><br><span style="font-weight:bold; color:var(--${u.rarity.toLowerCase()})">${u.rarity}</span>`;
            card.onclick = () => { Audio.button(); window.game.applyUpgrade(u); };
            container.appendChild(card);
        });
    }
    renderShop() {
        document.querySelector('#shop-coins span').innerText = SaveSystem.data.coins;
        const container = document.getElementById('shop-items');
        container.innerHTML = '';
        const items = [
            { id: 'hp', name: 'Maksimum Can +15', cost: 80 },
            { id: 'dmg', name: 'Hasar Çarpanı +10%', cost: 120 },
            { id: 'spd', name: 'Hareket Hızı +5%', cost: 90 },
            { id: 'regen', name: 'Can Yenileme (+1/sn)', cost: 200 }
        ];
        items.forEach(item => {
            const lvl = SaveSystem.data.upgrades[item.id] || 0;
            const cost = item.cost * (lvl + 1);
            const div = document.createElement('div');
            div.className = 'upgrade-card';
            div.innerHTML = `<h3>${item.name}</h3><p>Seviye: ${lvl}</p><p>Maliyet: ${cost} Altın</p>`;
            div.onclick = () => {
                if(SaveSystem.buyUpgrade(item.id, cost)) { Audio.levelUp(); this.renderShop(); } 
                else { Audio.hit(); }
            };
            container.appendChild(div);
        });
    }
}
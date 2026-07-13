// upgrade.js
const UpgradesDB = [
    { id: 'dmg_up', name: 'Mistik Güç', desc: 'Hasarı %20 Arttırır', rarity: 'Common', apply: p => p.stats.dmgMult += 0.2 },
    { id: 'spd_up', name: 'Çevik Ayaklar', desc: 'Hareket Hızını %15 Arttırır', rarity: 'Common', apply: p => p.stats.speedMult += 0.15 },
    { id: 'hp_up', name: 'Gelişmiş Yaşam', desc: 'Maksimum Can +25', rarity: 'Common', apply: p => { p.maxHp += 25; p.hp += 25; } },
    { id: 'fire_rate', name: 'Hızlı Atış', desc: 'Atış Hızını %20 Arttırır', rarity: 'Rare', apply: p => p.stats.fireRate *= 1.2 },
    { id: 'crit_c', name: 'Keskin Göz', desc: '+%10 Kritik İhtimali', rarity: 'Rare', apply: p => p.stats.critChance += 0.1 },
    { id: 'magnet_up', name: 'Manyetik Alan', desc: 'Eşya Toplama Menzili Büyür', rarity: 'Rare', apply: p => p.stats.magnetRadius += 80 },
    { id: 'proj_count', name: 'Çoklu Atış', desc: 'Aynı Anda +1 Mermi Atar', rarity: 'Epic', apply: p => p.stats.projCount += 1 },
    { id: 'pierce_up', name: 'Hayalet Mermi', desc: 'Mermiler Düşmanın İçinden Geçer (+1)', rarity: 'Epic', apply: p => p.stats.pierce += 1 },
    
    // --- YEPYENİ EFSANEVİ ÖZELLİKLER ---
    { id: 'ricochet', name: 'Seken Mermiler', desc: 'Mermiler Düşmanlar Arasında Seker', rarity: 'Epic', apply: p => p.stats.ricochet += 1 },
    { id: 'vampire', name: 'Can Çalma', desc: 'Verilen Hasarın %2\'si Cana Döner', rarity: 'Epic', apply: p => p.stats.vampirism += 0.02 },
    { id: 'thorns', name: 'Dikenli Zırh', desc: 'Sana Vuranlar Aynı Anda Hasar Alır', rarity: 'Rare', apply: p => p.stats.thorns += 10 },
    
    { id: 'fire_ball', name: 'Ateş Büyüsü', desc: 'Ateş Topu Atar (Yakarak Hasar Verir)', rarity: 'Legendary', apply: p => p.unlockProjectile('fire') },
    { id: 'ice_ball', name: 'Buz Büyüsü', desc: 'Buz Topu Atar (Düşmanı Yavaşlatır)', rarity: 'Legendary', apply: p => p.unlockProjectile('ice') },
    { id: 'poison_ball', name: 'Zehir Büyüsü', desc: 'Zehir Topu Atar (Zamanla Zehirler)', rarity: 'Legendary', apply: p => p.unlockProjectile('poison') },
    { id: 'lightning_ball', name: 'Yıldırım Büyüsü', desc: 'Yıldırım Atar (Çok Hızlı ve Kritik Yüksek)', rarity: 'Legendary', apply: p => p.unlockProjectile('lightning') },
    
    { id: 'orbital', name: 'Yörünge Kalkanı', desc: 'Etrafında Dönen Büyülü Kılıç', rarity: 'Legendary', apply: p => p.stats.orbitals += 1 },
    { id: 'shockwave', name: 'Tribün Baskısı', desc: 'Periyodik Şok Dalgası (Geri İter)', rarity: 'Legendary', apply: p => p.stats.hasShockwave = true },
    { id: 'pet', name: 'Amigo', desc: 'Sana Yardım Eden Ateşli Dost', rarity: 'Legendary', apply: p => { p.stats.hasPet = true; window.game.spawnPet(); } },
    { id: 'blackhole', name: 'Kara Delik', desc: 'Düşmanları Toplayan Singülarite', rarity: 'Legendary', apply: p => p.stats.hasBlackhole = true }
];

class UpgradeManager {
    static getChoices(count = 3) {
        let pool = [...UpgradesDB];
        let choices = [];
        for(let i=0; i<count; i++) {
            if(pool.length === 0) break;
            const r = Math.random();
            let targetRarity = 'Common';
            if (r < Config.RATES.LEGENDARY) targetRarity = 'Legendary';
            else if (r < Config.RATES.EPIC + Config.RATES.LEGENDARY) targetRarity = 'Epic';
            else if (r < Config.RATES.RARE + Config.RATES.EPIC + Config.RATES.LEGENDARY) targetRarity = 'Rare';
            
            let valid = pool.filter(u => u.rarity === targetRarity);
            if(valid.length === 0) valid = pool;
            const chosen = Random.choice(valid);
            choices.push(chosen);
            pool = pool.filter(u => u.id !== chosen.id);
        }
        return choices;
    }
}
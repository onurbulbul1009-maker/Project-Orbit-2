// audio.js
class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
    }
    playTone(freq, type, duration, vol=0.1) {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }
    shoot() { this.playTone(400, 'sine', 0.1, 0.05); }
    hit() { this.playTone(150, 'square', 0.1, 0.05); }
    exp() { this.playTone(800, 'sine', 0.05, 0.02); }
    levelUp() { this.playTone(1200, 'triangle', 0.5, 0.1); }
    button() { this.playTone(600, 'sine', 0.1, 0.05); }
}
const Audio = new AudioManager();
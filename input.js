// input.js
class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = new Vec2();
        this.joystickDir = new Vec2();
        
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
        window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // HTML DOM Yüklendikten sonra Joystick eventlerini bağla
        window.addEventListener('DOMContentLoaded', () => {
            const zone = document.getElementById('joystick-zone');
            const stick = document.getElementById('joystick-stick');
            let touchId = null;
            let startPos = new Vec2();

            zone.addEventListener('touchstart', e => {
                e.preventDefault(); // Ekranın yenilenmesini engeller
                const touch = e.changedTouches[0];
                touchId = touch.identifier;
                const rect = zone.getBoundingClientRect();
                startPos = new Vec2(rect.left + 75, rect.top + 75); // 150px genişlik
                this.updateJoystick(touch.clientX, touch.clientY, startPos, stick);
            }, {passive: false});

            zone.addEventListener('touchmove', e => {
                e.preventDefault();
                for(let i=0; i<e.changedTouches.length; i++) {
                    if(e.changedTouches[i].identifier === touchId) {
                        this.updateJoystick(e.changedTouches[i].clientX, e.changedTouches[i].clientY, startPos, stick);
                    }
                }
            }, {passive: false});

            const resetJoy = (e) => {
                e.preventDefault();
                for(let i=0; i<e.changedTouches.length; i++) {
                    if(e.changedTouches[i].identifier === touchId) {
                        touchId = null;
                        this.joystickDir = new Vec2();
                        stick.style.transform = `translate(0px, 0px)`;
                    }
                }
            };
            zone.addEventListener('touchend', resetJoy);
            zone.addEventListener('touchcancel', resetJoy);
        });
    }

    updateJoystick(x, y, start, stick) {
        let delta = new Vec2(x - start.x, y - start.y);
        let dist = delta.mag();
        if(dist > 50) { delta = delta.normalize().mult(50); } // Sınır dışına çıkmasın
        stick.style.transform = `translate(${delta.x}px, ${delta.y}px)`;
        this.joystickDir = delta.normalize();
    }

    isDown(code) { return !!this.keys[code]; }

    getAxis() {
        // Eğer ayarlardan mobil seçildiyse doğrudan Joystick yönünü ver
        if (SaveSystem.data && SaveSystem.data.controlMode === 'mobile') {
            return this.joystickDir;
        }

        // Değilse klavye
        let x = 0, y = 0;
        if (this.isDown('KeyW') || this.isDown('ArrowUp')) y -= 1;
        if (this.isDown('KeyS') || this.isDown('ArrowDown')) y += 1;
        if (this.isDown('KeyA') || this.isDown('ArrowLeft')) x -= 1;
        if (this.isDown('KeyD') || this.isDown('ArrowRight')) x += 1;
        return new Vec2(x, y).normalize();
    }
}
const Input = new InputManager();
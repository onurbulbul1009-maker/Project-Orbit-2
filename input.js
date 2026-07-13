// input.js (Güncellenmiş Joystick Mantığı)
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

        // Mobil için Joystick'i her zaman hazır tut
        this.initJoystick();
    }

    initJoystick() {
        const zone = document.getElementById('joystick-zone');
        const stick = document.getElementById('joystick-stick');
        let touchId = null;

        zone.addEventListener('touchstart', e => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            touchId = touch.identifier;
            this.moveStick(touch.clientX, touch.clientY, zone, stick);
        }, {passive: false});

        zone.addEventListener('touchmove', e => {
            e.preventDefault();
            for(let i=0; i<e.changedTouches.length; i++) {
                if(e.changedTouches[i].identifier === touchId) {
                    this.moveStick(e.changedTouches[i].clientX, e.changedTouches[i].clientY, zone, stick);
                }
            }
        }, {passive: false});

        const resetJoy = (e) => {
            touchId = null;
            this.joystickDir = new Vec2();
            stick.style.transform = `translate(0px, 0px)`;
        };
        window.addEventListener('touchend', resetJoy);
    }

    moveStick(x, y, zone, stick) {
        const rect = zone.getBoundingClientRect();
        const centerX = rect.left + 75;
        const centerY = rect.top + 75;
        let delta = new Vec2(x - centerX, y - centerY);
        if(delta.mag() > 50) delta = delta.normalize().mult(50);
        stick.style.transform = `translate(${delta.x}px, ${delta.y}px)`;
        this.joystickDir = delta.normalize();
    }

    isDown(code) { return !!this.keys[code]; }

    getAxis() {
        if (SaveSystem.data && SaveSystem.data.controlMode === 'mobile') {
            return this.joystickDir;
        }
        let x = 0, y = 0;
        if (this.isDown('KeyW')) y -= 1;
        if (this.isDown('KeyS')) y += 1;
        if (this.isDown('KeyA')) x -= 1;
        if (this.isDown('KeyD')) x += 1;
        return new Vec2(x, y).normalize();
    }
}
const Input = new InputManager();

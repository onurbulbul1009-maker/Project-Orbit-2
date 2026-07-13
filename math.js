// math.js
class Vec2 {
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
    mult(n) { return new Vec2(this.x * n, this.y * n); }
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() { let m = this.mag(); return m === 0 ? new Vec2() : new Vec2(this.x / m, this.y / m); }
    dist(v) { return this.sub(v).mag(); }
    clone() { return new Vec2(this.x, this.y); }
}
const Random = {
    range: (min, max) => Math.random() * (max - min) + min,
    int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    chance: (percent) => Math.random() < percent,
    choice: (arr) => arr[Math.floor(Math.random() * arr.length)]
};
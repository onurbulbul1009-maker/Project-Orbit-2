// collision.js
class SpatialHash {
    constructor(cellSize) { this.cellSize = cellSize; this.grid = new Map(); }
    hash(vec) { return `${Math.floor(vec.x / this.cellSize)},${Math.floor(vec.y / this.cellSize)}`; }
    clear() { this.grid.clear(); }
    insert(entity) {
        const h = this.hash(entity.pos);
        if(!this.grid.has(h)) this.grid.set(h, []);
        this.grid.get(h).push(entity);
    }
    retrieve(entity) {
        const h = this.hash(entity.pos);
        let results = [];
        for(let x=-1; x<=1; x++) {
            for(let y=-1; y<=1; y++) {
                const key = `${Math.floor(entity.pos.x/this.cellSize)+x},${Math.floor(entity.pos.y/this.cellSize)+y}`;
                if(this.grid.has(key)) results.push(...this.grid.get(key));
            }
        }
        return results;
    }
}
const Collision = {
    checkCircle: (a, b) => a.pos.dist(b.pos) < a.radius + b.radius
};
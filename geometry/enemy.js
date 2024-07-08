class Enemy {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.type = '';
        this.size = 0;
        this.width = 0;
        this.speed = 0;
        this.color = '';
        this.points = 0;
        this.avoidBullets = false;
    }

    init(type, x, y, properties) {
        this.x = x;
        this.y = y;
        this.type = type;
        Object.assign(this, properties);
    }
}
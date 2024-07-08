class Bullet {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.angle = 0;
        this.speed = CONFIG.BULLET_SPEED;
        this.width = CONFIG.BULLET_SIZE;
        this.height = CONFIG.BULLET_THICKNESS;
    }

    init(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
    }
}
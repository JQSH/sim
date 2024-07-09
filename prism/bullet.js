class Bullet {
    constructor(scene, x, y, angle) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = CONFIG.BULLET_SPEED;

        this.mesh = Graphics.createBulletMesh();
        this.mesh.position.set(x, y, 0);
        this.mesh.rotation.z = angle;
        this.scene.add(this.mesh);
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.mesh.position.set(this.x, this.y, 0);
    }

    isOutOfBounds(gameWidth, gameHeight) {
        return (
            this.x < -gameWidth / 2 ||
            this.x > gameWidth / 2 ||
            this.y < -gameHeight / 2 ||
            this.y > gameHeight / 2
        );
    }

    remove() {
        this.scene.remove(this.mesh);
    }
}
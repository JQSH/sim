class Bullet {
    constructor(scene, x, y, angle) {
        this.scene = scene;
        this.speed = CONFIG.BULLET_SPEED;
        this.init(x, y, angle);
    }

    init(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.createMesh();
    }

    createMesh() {
        const geometry = new THREE.CylinderGeometry(
            CONFIG.BULLET_THICKNESS / 2,
            CONFIG.BULLET_THICKNESS / 2,
            CONFIG.BULLET_SIZE,
            8
        );
        geometry.rotateZ(Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.x, this.y, 0);
        this.mesh.rotation.z = this.angle;
        this.scene.add(this.mesh);
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.mesh.position.set(this.x, this.y, 0);
    }

    remove() {
        this.scene.remove(this.mesh);
    }

    isOutOfBounds(gameWidth, gameHeight) {
        return (
            this.x < -gameWidth / 2 ||
            this.x > gameWidth / 2 ||
            this.y < -gameHeight / 2 ||
            this.y > gameHeight / 2
        );
    }
}
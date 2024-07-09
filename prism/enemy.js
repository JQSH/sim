class Enemy {
    constructor(scene, type, x, y, properties) {
        this.scene = scene;
        this.type = type;
        this.x = x;
        this.y = y;
        this.size = properties.size;
        this.speed = properties.speed;
        this.color = properties.color;
        this.points = properties.points;
        this.avoidBullets = properties.avoidBullets;

        this.mesh = Graphics.createEnemyMesh(type);
        this.mesh.position.set(x, y, 0);
        this.scene.add(this.mesh);
    }

    update() {
        this.mesh.position.set(this.x, this.y, 0);
        if (this.type === 'diamond') {
            this.mesh.rotation.z += 0.05; // Rotate diamond enemies
        }
    }

    move(dx, dy) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }

    remove() {
        this.scene.remove(this.mesh);
    }
}
class Enemy {
    constructor(scene, type, x, y, properties) {
        this.scene = scene;
        this.type = type;
        this.x = x;
        this.y = y;
        this.speed = properties.speed;
        this.color = properties.color;
        this.points = properties.points;
        this.avoidBullets = properties.avoidBullets;

        this.mesh = Graphics.createEnemyMesh(type, DEFAULT_LINE_THICKNESS * GLOBAL_SCALE);
        
        if (type === 'diamond') {
            this.mesh.scale.set(0.5 * GLOBAL_SCALE, GLOBAL_SCALE, GLOBAL_SCALE);
            this.width = properties.size * 0.5 * GLOBAL_SCALE;
            this.height = properties.size * GLOBAL_SCALE;
        } else if (type === 'square') {
            this.mesh.scale.set(0.7 * GLOBAL_SCALE, 0.9 * GLOBAL_SCALE, GLOBAL_SCALE);
            this.width = this.height = properties.size * 0.9 * GLOBAL_SCALE;
        }
        
        this.mesh.position.set(x, y, 0);
        this.scene.add(this.mesh);

        this.size = properties.size * GLOBAL_SCALE;
    }
    update() {
        this.mesh.position.set(this.x, this.y, 0);
        if (this.type === 'diamond') {
            // Add specific behavior for diamond enemies if needed
        }
    }

    move(dx, dy) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }

    remove() {
        this.scene.remove(this.mesh);
        if (CONFIG.DEBUG_HITBOXES) {
            this.scene.remove(this.debugHitbox);
        }
    }
}
class Bullet {
    constructor(scene) {
        this.scene = scene;
        this.mesh = this.createMesh();
        this.reset();
    }

    createMesh() {
        const geometry = new THREE.SphereGeometry(CONFIG.BULLET_SIZE);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        return mesh;
    }

    reset() {
        this.mesh.position.set(0, 0, 0);
        this.velocity = new THREE.Vector3();
        this.mesh.visible = false;
    }

    init(position, direction) {
        this.mesh.position.copy(position);
        this.velocity.copy(direction).normalize().multiplyScalar(CONFIG.BULLET_SPEED);
        this.mesh.visible = true;
    }

    update() {
        this.mesh.position.add(this.velocity);
    }
}
class Enemy {
    constructor(scene, type, x, y, properties) {
        this.scene = scene;
        this.size = properties.size; // Make sure this is set
        this.init(type, x, y, properties);
    }

    init(type, x, y, properties) {
        this.type = type;
        this.x = x;
        this.y = y;
        Object.assign(this, properties);

        this.createMesh();
    }

    createMesh() {
        let geometry;
        if (this.type === 'diamond') {
            geometry = new THREE.CircleGeometry(this.size / 2, 4);
        } else if (this.type === 'square') {
            geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        } else {
            geometry = new THREE.CircleGeometry(this.size / 2, 32);
        }

        const material = new THREE.MeshBasicMaterial({ color: this.color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.x, this.y, 0);
        this.scene.add(this.mesh);
    }

    update() {
        this.mesh.position.set(this.x, this.y, 0);
        if (this.type === 'diamond') {
            this.mesh.rotation.z += 0.05; // Rotate diamond enemies
        }
    }

    remove() {
        this.scene.remove(this.mesh);
    }
}
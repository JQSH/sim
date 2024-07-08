class Enemy {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
    }

    init(type, x, y, properties) {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }

        let geometry;
        if (type === 'diamond') {
            geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                0, properties.size, 0,
                properties.size, 0, 0,
                0, -properties.size, 0,
                -properties.size, 0, 0
            ]);
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            geometry.setIndex([0, 1, 2, 2, 3, 0]);
        } else if (type === 'square') {
            geometry = new THREE.BoxGeometry(properties.size, properties.size, properties.size);
        }

        const material = new THREE.MeshBasicMaterial({ color: properties.color });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, 0);
        this.scene.add(this.mesh);

        this.type = type;
        this.speed = properties.speed;
        this.points = properties.points;
        this.avoidBullets = properties.avoidBullets;
    }

    update(playerPosition, bullets) {
        const direction = new THREE.Vector3()
            .subVectors(playerPosition, this.mesh.position)
            .normalize();

        if (this.avoidBullets) {
            for (const bullet of bullets) {
                const bulletDirection = new THREE.Vector3()
                    .subVectors(bullet.mesh.position, this.mesh.position);
                const distance = bulletDirection.length();

                if (distance < 2) {
                    direction.sub(bulletDirection.normalize().multiplyScalar(0.5));
                }
            }
        }

        direction.normalize().multiplyScalar(this.speed);
        this.mesh.position.add(direction);
    }

    reset() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh = null;
        }
    }
}
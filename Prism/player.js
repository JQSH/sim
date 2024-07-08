class Player {
    constructor(scene) {
        this.scene = scene;
        this.mesh = this.createMesh();
        this.speed = 0.1;
        this.bullets = [];
        this.lastFireTime = 0;
        this.fireRate = 200; // milliseconds between shots
    }

    createMesh() {
        const geometry = new THREE.ConeGeometry(0.5, 1, 3);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);
        return mesh;
    }

    update(movement) {
        this.mesh.position.x += movement.x * this.speed;
        this.mesh.position.y += movement.y * this.speed;

        if (movement.x !== 0 || movement.y !== 0) {
            this.mesh.rotation.z = Math.atan2(movement.y, movement.x) - Math.PI / 2;
        }

        this.updateBullets();
    }

    shoot(direction) {
        const currentTime = Date.now();
        if (currentTime - this.lastFireTime < this.fireRate) return;

        this.lastFireTime = currentTime;

        const bulletGeometry = new THREE.SphereGeometry(0.1);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);

        bullet.position.copy(this.mesh.position);
        bullet.velocity = new THREE.Vector3(direction.x, direction.y, 0).normalize().multiplyScalar(0.2);

        this.scene.add(bullet);
        this.bullets.push(bullet);
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.position.add(bullet.velocity);

            // Remove bullets that are out of bounds
            if (bullet.position.length() > 10) {
                this.scene.remove(bullet);
                this.bullets.splice(i, 1);
            }
        }
    }
}
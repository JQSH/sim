class Graphics {
    constructor(scene) {
        this.scene = scene;
        this.shatterParticles = [];
    }

    createPlayerMesh() {
        const geometry = new THREE.CircleGeometry(0.5, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        return new THREE.Mesh(geometry, material);
    }

    createEnemyMesh(type) {
        let geometry;
        let material;

        switch (type) {
            case 'diamond':
                geometry = new THREE.CircleGeometry(0.5, 4);
                material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                break;
            case 'square':
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
                break;
            default:
                geometry = new THREE.CircleGeometry(0.5, 32);
                material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        }

        return new THREE.Mesh(geometry, material);
    }

    createBulletMesh() {
        const geometry = new THREE.CircleGeometry(0.1, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        return new THREE.Mesh(geometry, material);
    }

    drawPlayer(player) {
        if (!player.mesh) {
            player.mesh = this.createPlayerMesh();
            this.scene.add(player.mesh);
        }
        player.mesh.position.set(player.x, player.y, 0);
        player.mesh.rotation.z = player.angle;
    }

    drawEnemy(enemy) {
        if (!enemy.mesh) {
            enemy.mesh = this.createEnemyMesh(enemy.type);
            this.scene.add(enemy.mesh);
        }
        enemy.mesh.position.set(enemy.x, enemy.y, 0);
        if (enemy.type === 'diamond') {
            enemy.mesh.rotation.z += 0.05; // Rotate diamond enemies
        }
    }

    drawBullet(x, y, angle) {
        const bullet = this.createBulletMesh();
        bullet.position.set(x, y, 0);
        bullet.rotation.z = angle;
        this.scene.add(bullet);
        return bullet;
    }

    createShatterParticles(enemy) {
        const particleCount = 20;
        const particleGeometry = new THREE.CircleGeometry(0.05, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(enemy.x, enemy.y, 0);
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1,
                0
            );
            particle.lifespan = 1 + Math.random();
            this.shatterParticles.push(particle);
            this.scene.add(particle);
        }
    }

    updateAnimation(deltaTime) {
        for (let i = this.shatterParticles.length - 1; i >= 0; i--) {
            const particle = this.shatterParticles[i];
            particle.position.add(particle.velocity);
            particle.lifespan -= deltaTime;

            if (particle.lifespan <= 0) {
                this.scene.remove(particle);
                this.shatterParticles.splice(i, 1);
            }
        }
    }

    clear() {
        // In Three.js, clearing is handled by the renderer
    }
}
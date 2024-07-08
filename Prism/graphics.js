class Graphics {
    constructor(scene) {
        this.scene = scene;
        this.shatterParticles = [];
    }

    createShatterEffect(enemy) {
        const particles = this.createShatterParticles(enemy);
        this.shatterParticles.push(...particles);
    }

    createShatterParticles(enemy) {
        const particles = [];
        const color = enemy.userData.type === 'diamond' ? 0x00ffff : 0x00ff00;
        const size = enemy.userData.size;
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 0.05 + Math.random() * 0.1;
            const geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array(3);
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            
            const material = new THREE.PointsMaterial({ color: color, size: size / 4 });
            const particle = new THREE.Points(geometry, material);
            
            particle.position.copy(enemy.position);
            particle.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0
            );
            particle.userData.alpha = 1;
            
            this.scene.add(particle);
            particles.push(particle);
        }

        return particles;
    }

    updateShatterParticles() {
        this.shatterParticles = this.shatterParticles.filter(particle => {
            particle.position.add(particle.userData.velocity);
            particle.userData.alpha -= 0.02;
            particle.material.opacity = particle.userData.alpha;
    
            if (particle.userData.alpha <= 0) {
                this.scene.remove(particle);
                return false;
            }
            return true;
        });
    }

    createBulletTrail(bullet) {
        const trailGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(6);
        trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const trailMaterial = new THREE.LineBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.5
        });
        
        const trail = new THREE.Line(trailGeometry, trailMaterial);
        trail.userData.startPosition = bullet.position.clone();
        trail.userData.endPosition = bullet.position.clone();
        trail.userData.life = 1;
        
        this.scene.add(trail);
        return trail;
    }

    updateBulletTrails(bullets) {
        bullets.forEach(bullet => {
            if (!bullet.userData.trail) {
                bullet.userData.trail = this.createBulletTrail(bullet);
            }

            const trail = bullet.userData.trail;
            trail.userData.endPosition.copy(bullet.position);
            
            const positions = trail.geometry.attributes.position.array;
            positions[0] = trail.userData.startPosition.x;
            positions[1] = trail.userData.startPosition.y;
            positions[2] = trail.userData.startPosition.z;
            positions[3] = trail.userData.endPosition.x;
            positions[4] = trail.userData.endPosition.y;
            positions[5] = trail.userData.endPosition.z;
            trail.geometry.attributes.position.needsUpdate = true;

            trail.userData.life -= 0.05;
            trail.material.opacity = trail.userData.life;

            if (trail.userData.life <= 0) {
                this.scene.remove(trail);
                delete bullet.userData.trail;
            }
        });
    }
}
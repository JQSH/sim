class Bullet {
    constructor(scene, x, y, angle) {
        this.scene = scene;
        this.speed = CONFIG.BULLET_SPEED;
        this.angle = angle;

        this.mesh = Graphics.createBulletMesh(DEFAULT_LINE_THICKNESS * GLOBAL_SCALE);
        this.mesh.scale.set(0.6 * GLOBAL_SCALE, 0.5 * GLOBAL_SCALE, GLOBAL_SCALE);
        this.mesh.position.set(x, y, 0);
        this.mesh.rotation.z = angle - Math.PI/2;
        this.scene.add(this.mesh);

        // Initialize previousPosition
        this.previousPosition = new THREE.Vector3(x, y, 0);

        // Adjust collision size if needed
        this.size = CONFIG.BULLET_SIZE * GLOBAL_SCALE;
    }

    getPosition() {
        return this.mesh.position;
    }

    getPreviousPosition() {
        return this.previousPosition;
    }

    update() {
        // Store the current position as the previous position
        this.previousPosition.copy(this.mesh.position);

        // Update the current position
        const dx = Math.cos(this.angle) * this.speed;
        const dy = Math.sin(this.angle) * this.speed;
        this.mesh.position.x += dx;
        this.mesh.position.y += dy;
    }

    isOutOfBounds(gameWidth, gameHeight) {
        const x = this.mesh.position.x;
        const y = this.mesh.position.y;
        return (x < -gameWidth/2 || x > gameWidth/2 || y < -gameHeight/2 || y > gameHeight/2);
    }

    remove() {
        this.scene.remove(this.mesh);
    }

    checkCollision(enemy) {
        const bulletPos = this.mesh.position;
        const bulletPrevPos = this.previousPosition;
        const enemyPos = enemy.mesh.position;
        
        // Vector from previous position to current position
        const bulletVector = new THREE.Vector3().subVectors(bulletPos, bulletPrevPos);
        const bulletDirection = bulletVector.normalize();
        const bulletLength = bulletVector.length();
        
        // Vector from previous position to enemy
        const toEnemy = new THREE.Vector3().subVectors(enemyPos, bulletPrevPos);
        
        // Project toEnemy onto bulletDirection
        const projection = toEnemy.dot(bulletDirection);
        
        if (projection >= 0 && projection <= bulletLength) {
            // Calculate the closest point on the bullet's path to the enemy
            const closestPoint = new THREE.Vector3()
                .addVectors(bulletPrevPos, bulletDirection.multiplyScalar(projection));
            
            // Check if this point is within the enemy's collision radius
            const distanceSquared = closestPoint.distanceToSquared(enemyPos);
            const collisionRadiusSquared = Math.pow((enemy.size / 2) + (this.size / 2), 2);
            
            return distanceSquared <= collisionRadiusSquared;
        }
        
        return false;
    }
}
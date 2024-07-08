class EnemyAIManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.enemies = [];
        this.enemyTypes = {
            diamond: {
                size: 0.3,
                speed: 0.02,
                color: 0x00ffff,
                points: 50,
                avoidBullets: false,
                spawnInterval: 2000,
                lastSpawnTime: 0
            },
            square: {
                size: 0.25,
                speed: 0.03,
                color: 0x00ff00,
                points: 100,
                avoidBullets: true,
                spawnInterval: 3000,
                lastSpawnTime: 0
            }
        };
    }

    spawnEnemy(type, x, y) {
        const enemyData = this.enemyTypes[type];
        let geometry;

        if (type === 'diamond') {
            geometry = new THREE.BufferGeometry();
            const vertices = new Float32Array([
                0, enemyData.size, 0,
                enemyData.size, 0, 0,
                0, -enemyData.size, 0,
                -enemyData.size, 0, 0
            ]);
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            geometry.setIndex([0, 1, 2, 2, 3, 0]);
        } else if (type === 'square') {
            geometry = new THREE.BoxGeometry(enemyData.size, enemyData.size, enemyData.size);
        }

        const material = new THREE.MeshBasicMaterial({ color: enemyData.color });
        const enemy = new THREE.Mesh(geometry, material);
        enemy.position.set(x, y, 0);
        enemy.userData.type = type;
        enemy.userData.points = enemyData.points;
        enemy.userData.avoidBullets = enemyData.avoidBullets;
        enemy.userData.speed = enemyData.speed;

        this.scene.add(enemy);
        this.enemies.push(enemy);
    }

    checkEnemySpawns(currentTime, score) {
        const spawnedEnemies = [];
        
        for (const [type, props] of Object.entries(this.enemyTypes)) {
            if (currentTime - props.lastSpawnTime > props.spawnInterval) {
                if (type === 'square' && score >= 500) { // Assuming a threshold for square enemies
                    spawnedEnemies.push(type);
                } else if (type === 'diamond') {
                    spawnedEnemies.push(type);
                }
                props.lastSpawnTime = currentTime;
            }
        }

        return spawnedEnemies;
    }

    spawnEnemyAtRandomPosition(type) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 10 + Math.random() * 5; // Spawn outside the visible area
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        this.spawnEnemy(type, x, y);
    }

    updateEnemies(bullets) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const dx = this.player.mesh.position.x - enemy.position.x;
            const dy = this.player.mesh.position.y - enemy.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
    
            let moveX = dx / distance;
            let moveY = dy / distance;
    
            if (enemy.userData.avoidBullets) {
                for (const bullet of bullets) {
                    const bulletDx = bullet.position.x - enemy.position.x;
                    const bulletDy = bullet.position.y - enemy.position.y;
                    const bulletDistance = Math.sqrt(bulletDx * bulletDx + bulletDy * bulletDy);
    
                    if (bulletDistance < 2) { // Adjust this value to change avoidance range
                        moveX -= bulletDx / bulletDistance * 0.5;
                        moveY -= bulletDy / bulletDistance * 0.5;
                    }
                }
            }
    
            const moveMagnitude = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX = (moveX / moveMagnitude) * enemy.userData.speed;
            moveY = (moveY / moveMagnitude) * enemy.userData.speed;
    
            enemy.position.x += moveX;
            enemy.position.y += moveY;
        }
    }

    checkCollisions(bullets, onEnemyDestroyed) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            for (let j = bullets.length - 1; j >= 0; j--) {
                const bullet = bullets[j];
                const dx = bullet.position.x - enemy.position.x;
                const dy = bullet.position.y - enemy.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < enemy.userData.size) {
                    this.scene.remove(enemy);
                    this.enemies.splice(i, 1);
                    onEnemyDestroyed(enemy.userData.points, enemy.position);
                    return true;
                }
            }
        }
        return false;
    }
}
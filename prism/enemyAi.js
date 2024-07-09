class EnemyAIManager {
    constructor(scene) {
        this.scene = scene;
        this.enemyTypes = {
            diamond: {
                size: 0.5,
                speed: 0.02,
                color: 0x00FFFF,
                points: 50,
                avoidBullets: false,
                spawnInterval: 2000,
                lastSpawnTime: 0
            },
            square: {
                size: 0.4,
                speed: 0.03,
                color: 0x00FF00,
                points: 100,
                avoidBullets: true,
                spawnInterval: 3000,
                lastSpawnTime: 0
            }
        };
    }

    spawnEnemy(type, gameWidth, gameHeight, playerX, playerY) {
        let x, y;
        const safeDistance = 4;
        const centerSafeZone = 2;

        do {
            x = (Math.random() - 0.5) * gameWidth;
            y = (Math.random() - 0.5) * gameHeight;
        } while (
            (Math.abs(x) < centerSafeZone && Math.abs(y) < centerSafeZone) ||
            (Math.sqrt(Math.pow(x - playerX, 2) + Math.pow(y - playerY, 2)) < safeDistance)
        );

        const enemyProperties = { ...this.enemyTypes[type] }; // Clone the properties
        return new Enemy(this.scene, type, x, y, enemyProperties);
    }

    updateEnemies(enemies, player, bullets) {
        enemies.forEach(enemy => {
            let dx = player.mesh.position.x - enemy.x;
            let dy = player.mesh.position.y - enemy.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
    
            if (enemy.avoidBullets) {
                for (let bullet of bullets) {
                    const bulletDx = bullet.mesh.position.x - enemy.x;
                    const bulletDy = bullet.mesh.position.y - enemy.y;
                    const bulletDistance = Math.sqrt(bulletDx * bulletDx + bulletDy * bulletDy);
    
                    if (bulletDistance < 2) {
                        dx -= bulletDx * 2;
                        dy -= bulletDy * 2;
                    }
                }
            }
    
            const normalizedDistance = Math.sqrt(dx * dx + dy * dy);
            dx = dx / normalizedDistance;
            dy = dy / normalizedDistance;
    
            enemy.x += dx * enemy.speed;
            enemy.y += dy * enemy.speed;

            enemy.update();
        });
    }

    checkEnemySpawns(currentTime, score) {
        const spawnedEnemies = [];
        
        for (const [type, props] of Object.entries(this.enemyTypes)) {
            if (currentTime - props.lastSpawnTime > props.spawnInterval) {
                if (type === 'square' && score >= CONFIG.SQUARE_ENEMY_SCORE_THRESHOLD) {
                    spawnedEnemies.push(type);
                } else if (type === 'diamond') {
                    spawnedEnemies.push(type);
                }
                props.lastSpawnTime = currentTime;
            }
        }

        return spawnedEnemies;
    }
}
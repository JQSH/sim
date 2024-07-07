class EnemyAIManager {
    constructor() {
        this.enemyTypes = {
            diamond: {
                size: 30,
                width: 18,
                speed: 2,
                color: 'cyan',
                points: 50,
                avoidBullets: false,
                spawnInterval: 2000,
                lastSpawnTime: 0
            },
            square: {
                size: 25,
                speed: 3,
                color: 'green',
                points: 100,
                avoidBullets: true,
                spawnInterval: 3000,
                lastSpawnTime: 0
            }
        };
    }

    createEnemy(type, x, y) {
        return {
            x: x,
            y: y,
            type: type,
            ...this.enemyTypes[type]
        };
    }

    updateEnemies(enemies, player, bullets) {
        enemies.forEach(enemy => {
            let dx = player.x - enemy.x;
            let dy = player.y - enemy.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (enemy.avoidBullets) {
                // Check for nearby bullets and avoid them
                for (let bullet of bullets) {
                    const bulletDx = bullet.x - enemy.x;
                    const bulletDy = bullet.y - enemy.y;
                    const bulletDistance = Math.sqrt(bulletDx * bulletDx + bulletDy * bulletDy);

                    if (bulletDistance < 100) { // Adjust this value to change avoidance range
                        dx -= bulletDx * 2; // Adjust these multipliers to change avoidance strength
                        dy -= bulletDy * 2;
                    }
                }
            }

            // Normalize the direction
            const normalizedDistance = Math.sqrt(dx * dx + dy * dy);
            dx = dx / normalizedDistance;
            dy = dy / normalizedDistance;

            enemy.x += dx * enemy.speed;
            enemy.y += dy * enemy.speed;
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

    spawnEnemy(type, canvasWidth, canvasHeight, playerX, playerY) {
        let x, y;
        const safeDistance = 200; // Minimum distance from player
        const centerSafeZone = 100; // Distance from center to avoid spawning

        do {
            x = Math.random() * canvasWidth;
            y = Math.random() * canvasHeight;
        } while (
            (Math.abs(x - canvasWidth / 2) < centerSafeZone && Math.abs(y - canvasHeight / 2) < centerSafeZone) ||
            (Math.sqrt(Math.pow(x - playerX, 2) + Math.pow(y - playerY, 2)) < safeDistance)
        );

        return this.createEnemy(type, x, y);
    }
}
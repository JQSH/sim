class EnemyAIManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.enemies = [];
        this.enemyPool = [];
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

        // Initialize enemy pool
        for (let i = 0; i < CONFIG.INITIAL_ENEMY_POOL_SIZE; i++) {
            this.enemyPool.push(new Enemy(this.scene));
        }
    }

    getEnemyFromPool() {
        return this.enemyPool.find(e => !e.inUse) || this.enemyPool[0];
    }

    spawnEnemy(type, x, y) {
        const enemyData = this.enemyTypes[type];
        const enemy = this.getEnemyFromPool();
        enemy.init(type, x, y, enemyData);
        this.enemies.push(enemy);
        return enemy;
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

    spawnEnemyAtRandomPosition(type) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 10 + Math.random() * 5; // Spawn outside the visible area
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        return this.spawnEnemy(type, x, y);
    }

    updateEnemies(bullets) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy.inUse) {
                this.enemies.splice(i, 1);
                continue;
            }

            enemy.update(this.player.mesh.position, bullets);
        }
    }

    checkCollisions(bullets, onEnemyDestroyed) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            for (let j = bullets.length - 1; j >= 0; j--) {
                const bullet = bullets[j];
                if (enemy.checkCollision(bullet)) {
                    onEnemyDestroyed(enemy.points, enemy.mesh.position);
                    enemy.reset();
                    this.enemies.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }
}
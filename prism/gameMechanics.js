class GameMechanics {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.composer = composer;

        this.inputManager = new InputManager(camera);
        this.enemyAIManager = new EnemyAIManager(scene);
        this.ui = new UI();

        this.player = this.createPlayer();
        this.enemies = [];
        this.bullets = [];
        this.score = 0;
        this.lives = 3;
        this.lastFireTime = 0;

        this.gameWidth = CONFIG.GAME_WIDTH;
        this.gameHeight = CONFIG.GAME_HEIGHT;

        this.isGameOver = false;
    }

    createPlayer() {
        const playerMesh = Graphics.createPlayerMesh(DEFAULT_LINE_THICKNESS * GLOBAL_SCALE);
        playerMesh.scale.set(0.6 * GLOBAL_SCALE, 0.5 * GLOBAL_SCALE, GLOBAL_SCALE);
        this.scene.add(playerMesh);
        return {
            mesh: playerMesh,
            speed: CONFIG.PLAYER_SPEED,
            angle: 0,
            recentMovements: []
        };
    }

    update(time) {
        if (this.isGameOver) return;

        this.inputManager.update();
        const movement = this.inputManager.getMovement();
        const shootingDirection = this.inputManager.getShootingDirection();

        this.updatePlayer(movement);
        if (this.inputManager.isFirePressed()) {
            this.shootBullet(shootingDirection);
        }

        this.updateBullets();
        this.updateEnemies(time);
        this.checkCollisions();

        this.ui.updateScore(this.score);
        this.ui.updateLives(this.lives);
    }

    updatePlayer(movement) {
        const dx = movement.x * this.player.speed;
        const dy = movement.y * this.player.speed;
        
        this.player.mesh.position.x += dx;
        this.player.mesh.position.y += dy;
        
        // Keep player within game bounds
        this.player.mesh.position.x = Math.max(Math.min(this.player.mesh.position.x, this.gameWidth/2), -this.gameWidth/2);
        this.player.mesh.position.y = Math.max(Math.min(this.player.mesh.position.y, this.gameHeight/2), -this.gameHeight/2);
    
        if (dx !== 0 || dy !== 0) {
            this.player.recentMovements.push({dx, dy});
            if (this.player.recentMovements.length > 10) {
                this.player.recentMovements.shift();
            }
            
            const avgMovement = this.player.recentMovements.reduce((acc, mov) => {
                acc.dx += mov.dx;
                acc.dy += mov.dy;
                return acc;
            }, {dx: 0, dy: 0});
            
            this.player.angle = Math.atan2(-avgMovement.dy, -avgMovement.dx);
            
            // Update the player mesh rotation, adding π/2 (90 degrees) to correct the offset
            this.player.mesh.rotation.z = this.player.angle + Math.PI / 2;
        }
    }

    shootBullet(direction) {
        const currentTime = Date.now();
        if (currentTime - this.lastFireTime < CONFIG.FIRE_RATE) return;

        this.lastFireTime = currentTime;

        const bullet = new Bullet(
            this.scene,
            this.player.mesh.position.x,
            this.player.mesh.position.y,
            Math.atan2(direction.y, direction.x)
        );
        this.bullets.push(bullet);
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            // Check for collisions before updating position
            let collided = false;
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (bullet.checkCollision(enemy)) {
                    // Collision detected
                    this.handleCollision(bullet, enemy);
                    collided = true;
                    break;
                }
            }
            
            if (collided) {
                continue; // Skip to next bullet if this one collided
            }
            
            // Update bullet position
            bullet.update();

            // Check if bullet is out of bounds
            if (bullet.isOutOfBounds(this.gameWidth, this.gameHeight)) {
                bullet.remove();
                this.bullets.splice(i, 1);
            }
        }
    }

    handleCollision(bullet, enemy) {
        bullet.remove();
        this.bullets.splice(this.bullets.indexOf(bullet), 1);
        enemy.remove();
        this.enemies.splice(this.enemies.indexOf(enemy), 1);
        this.score += enemy.points;
    }

    updateEnemies(time) {
        const spawnedEnemies = this.enemyAIManager.checkEnemySpawns(time, this.score);
        spawnedEnemies.forEach(type => {
            const enemy = this.enemyAIManager.spawnEnemy(
                type, 
                this.gameWidth, 
                this.gameHeight, 
                this.player.mesh.position.x, 
                this.player.mesh.position.y
            );
            this.enemies.push(enemy);
        });
        this.enemyAIManager.updateEnemies(this.enemies, this.player, this.bullets);
    }

    checkCollisions() {
        // Check bullet-enemy collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (this.checkBulletEnemyCollision(bullet, enemy)) {
                    // Collision detected
                    bullet.remove();
                    this.bullets.splice(i, 1);
                    enemy.remove();
                    this.enemies.splice(j, 1);
                    this.score += enemy.points;
                    break;
                }
            }
        }
    
        // Check player-enemy collisions
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (this.checkPlayerEnemyCollision(this.player, enemy)) {
                console.log("Player collided with enemy!");
                this.playerDied();
                break;
            }
        }
    }

    checkBulletEnemyCollision(bullet, enemy) {
        const bulletPos = bullet.getPosition();
        const bulletPrevPos = bullet.getPreviousPosition(); // You'll need to track this
        const enemyPos = enemy.mesh.position;
        
        const bulletVector = new THREE.Vector3().subVectors(bulletPos, bulletPrevPos);
        const bulletDirection = bulletVector.normalize();
        const bulletLength = bulletVector.length();
        
        const toEnemy = new THREE.Vector3().subVectors(enemyPos, bulletPrevPos);
        const projection = toEnemy.dot(bulletDirection);
        
        if (projection > 0 && projection < bulletLength) {
            const closestPoint = new THREE.Vector3().addVectors(
                bulletPrevPos,
                bulletDirection.multiplyScalar(projection)
            );
            const distanceSquared = closestPoint.distanceToSquared(enemyPos);
            const collisionRadiusSquared = Math.pow((enemy.size / 2) + (bullet.size / 2), 2);
            return distanceSquared <= collisionRadiusSquared;
        }
        return false;
    }

    checkPlayerEnemyCollision(player, enemy) {
        const dx = player.mesh.position.x - enemy.mesh.position.x;
        const dy = player.mesh.position.y - enemy.mesh.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const collisionThreshold = enemy.size / 2 + CONFIG.PLAYER_SIZE / 2;
        return distance < collisionThreshold;
    }

    pointInRotatedRectangle(px, py, rectWidth, rectHeight, rectRotation) {
        const cos = Math.cos(-rectRotation);
        const sin = Math.sin(-rectRotation);
        
        const rx = cos * px - sin * py;
        const ry = sin * px + cos * py;
    
        return Math.abs(rx) < rectWidth / 2 && Math.abs(ry) < rectHeight / 2;
    }

    playerDied() {
        console.log("Player died! Lives left: " + (this.lives - 1));
        this.lives--;
        this.ui.updateLives(this.lives);
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetPlayerPosition();
        }
    }

    resetPlayerPosition() {
        this.player.mesh.position.set(0, 0, 0);
        // You might want to add invincibility frames here
    }

    gameOver() {
        console.log("Game Over! Your score: " + this.score);
        this.isGameOver = true;
        this.ui.showGameOver(this.score);
    }

    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.isGameOver = false;
        this.ui.updateScore(this.score);
        this.ui.updateLives(this.lives);
        this.ui.hideGameOver();

        this.enemies.forEach(enemy => enemy.remove());
        this.enemies = [];
        this.bullets.forEach(bullet => bullet.remove());
        this.bullets = [];
        this.resetPlayerPosition();

        this.lastFireTime = 0;
    }

    render() {
        this.composer.render();
    }
}
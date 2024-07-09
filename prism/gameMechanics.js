class GameMechanics {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.graphics = new Graphics(scene);
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
        const playerMesh = this.graphics.createPlayerMesh();
        this.scene.add(playerMesh);
        return {
            mesh: playerMesh,
            speed: CONFIG.PLAYER_SPEED
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
        this.player.mesh.position.x += movement.x * this.player.speed;
        this.player.mesh.position.y += movement.y * this.player.speed;

        // Keep player within game bounds
        this.player.mesh.position.x = Math.max(Math.min(this.player.mesh.position.x, this.gameWidth/2), -this.gameWidth/2);
        this.player.mesh.position.y = Math.max(Math.min(this.player.mesh.position.y, this.gameHeight/2), -this.gameHeight/2);
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
            bullet.update();

            if (bullet.isOutOfBounds(this.gameWidth, this.gameHeight)) {
                bullet.remove();
                this.bullets.splice(i, 1);
            }
        }
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
                if (bullet.mesh.position.distanceTo(enemy.mesh.position) < enemy.size) {
                    // Collision detected
                    bullet.remove();
                    this.bullets.splice(i, 1);
                    enemy.remove();
                    this.enemies.splice(j, 1);
                    this.score += enemy.points;
                    //this.graphics.createShatterEffect(enemy.mesh.position, enemy.color);
                    break;
                }
            }
        }

        // Check player-enemy collisions
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const distance = this.player.mesh.position.distanceTo(enemy.mesh.position);
            const collisionThreshold = enemy.size / 2 + CONFIG.PLAYER_SIZE / 2;
            
            if (distance < collisionThreshold) {
                console.log("Player collided with enemy!"); // Add this for debugging
                this.playerDied();
                break;
            }
        }
    }

    playerDied() {
        console.log("Player died! Lives left: " + (this.lives - 1)); // Add this for debugging
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
        this.renderer.render(this.scene, this.camera);
    }
}
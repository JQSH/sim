class ObjectPool {
    constructor(objectType, initialSize) {
        this.objectType = objectType;
        this.pool = [];
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(new objectType());
        }
    }

    get() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return new this.objectType();
    }

    release(object) {
        object.reset();
        this.pool.push(object);
    }
}

class GameMechanics {
    constructor(canvas) {
        this.canvas = canvas;
        this.player = this.createPlayer();
        this.enemyPool = new ObjectPool(Enemy, 20);
        this.bulletPool = new ObjectPool(Bullet, 50);
        this.enemies = [];
        this.bullets = [];
        this.score = 0;
        this.lives = 3;
        this.lastFireTime = 0;

        this.graphics = new Graphics(canvas);
        this.background = new Background(canvas);
        this.input = new InputManager();
        this.enemyAI = new EnemyAIManager();
        this.ui = new UI();
        this.audio = new AudioManager();

        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedTimeStep = 1000 / 60; // 60 FPS
    }

    static startGame(canvas) {
        const game = new GameMechanics(canvas);
        game.gameLoop();
    }

    createPlayer() {
        return {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            size: 20,
            speed: CONFIG.PLAYER_SPEED,
            angle: 0,
            recentMovements: []
        };
    }

    updatePlayer(movement) {
        const dx = movement.x * this.player.speed;
        const dy = movement.y * this.player.speed;
        
        this.player.x += dx;
        this.player.y += dy;
        
        this.player.x = Math.max(this.player.size / 2, Math.min(this.canvas.width - this.player.size / 2, this.player.x));
        this.player.y = Math.max(this.player.size / 2, Math.min(this.canvas.height - this.player.size / 2, this.player.y));

        if (movement.x !== 0 || movement.y !== 0) {
            this.background.interact(this.player.x, this.player.y, 1);
        }
        
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
            
            this.player.angle = Math.atan2(avgMovement.dy, avgMovement.dx);
        }
    }

    shootBullet(shootingDirection) {
        const currentTime = Date.now();
        if (currentTime - this.lastFireTime < CONFIG.FIRE_RATE) return;

        this.lastFireTime = currentTime;

        let shootAngle;
        if (shootingDirection.x !== 0 || shootingDirection.y !== 0) {
            shootAngle = Math.atan2(shootingDirection.y, shootingDirection.x);
        } else {
            return; // Don't shoot if no direction
        }

        const bullet = this.bulletPool.get();
        bullet.x = this.player.x + Math.cos(shootAngle) * this.player.size;
        bullet.y = this.player.y + Math.sin(shootAngle) * this.player.size;
        bullet.angle = shootAngle;
        bullet.speed = CONFIG.BULLET_SPEED;
        this.bullets.push(bullet);
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;

            if (bullet.x < 0 || bullet.x > this.canvas.width || bullet.y < 0 || bullet.y > this.canvas.height) {
                this.bulletPool.release(this.bullets.splice(i, 1)[0]);
            }
        }
    }

    checkCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                const dx = bullet.x - enemy.x;
                const dy = bullet.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < enemy.size) {
                    this.bulletPool.release(this.bullets.splice(i, 1)[0]);
                    this.graphics.createShatterEffect(enemy);
                    this.enemyPool.release(this.enemies.splice(j, 1)[0]);
                    this.score += enemy.points;
                    break;
                }
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.player.size / 2 + enemy.size / 2) {
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                } else {
                    this.playerDied();
                }
                break;
            }
        }
    }

    playerDied() {
        this.enemies.forEach(enemy => this.enemyPool.release(enemy));
        this.enemies = [];
        this.bullets.forEach(bullet => this.bulletPool.release(bullet));
        this.bullets = [];
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.player.angle = 0;
        this.player.recentMovements = [];
    }

    gameOver() {
        console.log("Game Over! Your score: " + this.score);
        this.resetGame();
    }

    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.enemies.forEach(enemy => this.enemyPool.release(enemy));
        this.enemies = [];
        this.bullets.forEach(bullet => this.bulletPool.release(bullet));
        this.bullets = [];
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.player.angle = 0;
        this.player.recentMovements = [];
    }

    update(deltaTime) {
        this.input.update();
        const movement = this.input.getMovement();
        const shootingDirection = this.input.getShootingDirection();

        this.updatePlayer(movement);
        if (this.input.isFirePressed()) {
            this.shootBullet(shootingDirection);
        }
        this.enemyAI.updateEnemies(this.enemies, this.player, this.bullets, this.background);
        this.graphics.updateAnimation(deltaTime);
        this.background.update();
        
        const currentTime = Date.now();
        const spawnedEnemies = this.enemyAI.checkEnemySpawns(currentTime, this.score);
        spawnedEnemies.forEach(type => {
            const enemy = this.enemyPool.get();
            this.enemyAI.initEnemy(enemy, type, this.canvas.width, this.canvas.height, this.player.x, this.player.y);
            this.enemies.push(enemy);
        });

        this.updateBullets();
        this.checkCollisions();

        if (this.ui) {
            this.ui.updateScore(this.score);
            this.ui.updateLives(this.lives);
        }
    }

    render() {
        this.graphics.clear();
        this.background.draw();
        this.graphics.drawPlayer(this.player);
        this.graphics.batchDraw(this.enemies, this.graphics.drawEnemy.bind(this.graphics));
        this.graphics.batchDraw(this.bullets, this.graphics.drawBullet.bind(this.graphics));
        this.graphics.drawShatterParticles();
    }

    gameLoop(currentTime) {
        if (!this.lastTime) this.lastTime = currentTime;
        let deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.accumulator += deltaTime;

        while (this.accumulator >= this.fixedTimeStep) {
            this.update(this.fixedTimeStep);
            this.accumulator -= this.fixedTimeStep;
        }

        this.render();
        requestAnimationFrame(time => this.gameLoop(time));
    }
}
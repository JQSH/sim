class GameMechanics {
    constructor(canvas) {
        this.canvas = canvas;
        this.player = this.createPlayer();
        this.enemies = [];
        this.bullets = [];
        this.score = 0;
        this.lives = 3;
        this.lastFireTime = 0;
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

        this.bullets.push({
            x: this.player.x + Math.cos(shootAngle) * this.player.size,
            y: this.player.y + Math.sin(shootAngle) * this.player.size,
            angle: shootAngle,
            speed: CONFIG.BULLET_SPEED
        });
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;

            if (bullet.x < 0 || bullet.x > this.canvas.width || bullet.y < 0 || bullet.y > this.canvas.height) {
                this.bullets.splice(i, 1);
            }
        }
    }

    spawnEnemy(type) {
        let x, y;
        const safeDistance = 200;
        const centerSafeZone = 100;

        do {
            x = Math.random() * this.canvas.width;
            y = Math.random() * this.canvas.height;
        } while (
            (Math.abs(x - this.canvas.width / 2) < centerSafeZone && Math.abs(y - this.canvas.height / 2) < centerSafeZone) ||
            (Math.sqrt(Math.pow(x - this.player.x, 2) + Math.pow(y - this.player.y, 2)) < safeDistance)
        );

        const enemyProps = type === 'diamond' 
            ? { size: 30, width: 18, speed: 2, color: 'cyan', points: 50, avoidBullets: false }
            : { size: 25, speed: 3, color: 'green', points: 100, avoidBullets: true };

        this.enemies.push({ x, y, type, ...enemyProps });
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
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
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
        this.enemies = [];
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
        this.enemies = [];
        this.bullets = [];
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.player.angle = 0;
        this.player.recentMovements = [];
    }

    gameLoop() {
        this.updateBullets();
        this.checkCollisions();
        
        if (Math.random() < 0.02) {
            this.spawnEnemy(Math.random() < 0.7 ? 'diamond' : 'square');
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
}
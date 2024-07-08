class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, CONFIG.CANVAS_WIDTH / CONFIG.CANVAS_HEIGHT, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
        this.renderer.setSize(CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        this.camera.position.z = 10;

        this.input = new InputManager();
        this.background = new Background(this.scene);
        this.player = new Player(this.scene);
        this.enemyAI = new EnemyAIManager(this.scene, this.player);
        this.graphics = new Graphics(this.scene);
        this.ui = new UI();

        this.score = 0;
        this.lives = 3;

        this.bulletPool = [];
        for (let i = 0; i < CONFIG.INITIAL_BULLET_POOL_SIZE; i++) {
            this.bulletPool.push(new Bullet(this.scene));
        }

        this.init();
        this.animate();
    }

    init() {
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    update() {
        this.input.update();
        const movement = this.input.getMovement();
        this.player.update(movement);

        if (this.input.isFirePressed()) {
            this.shootBullet();
        }

        this.background.update();

        const currentTime = Date.now();
        const spawnedEnemies = this.enemyAI.checkEnemySpawns(currentTime, this.score);
        spawnedEnemies.forEach(type => {
            this.enemyAI.spawnEnemyAtRandomPosition(type);
        });

        const activeBullets = this.bulletPool.filter(b => b.inUse);
        this.enemyAI.updateEnemies(activeBullets);

        this.checkCollisions();

        this.graphics.updateShatterParticles();
        this.graphics.updateBulletTrails(activeBullets);

        this.background.interact(this.player.mesh.position.x, this.player.mesh.position.y, 1);
        activeBullets.forEach(bullet => {
            if (bullet.mesh) {
                this.background.interact(bullet.mesh.position.x, bullet.mesh.position.y, 0.5);
                bullet.update();
            }
        });
        this.enemyAI.enemies.forEach(enemy => {
            if (enemy.mesh) {
                this.background.interact(enemy.mesh.position.x, enemy.mesh.position.y, 0.5);
            }
        });

        this.ui.updateScore(this.score);
        this.ui.updateLives(this.lives);
    }

    checkCollisions() {
        const activeBullets = this.bulletPool.filter(b => b.inUse);
    
        const enemyDestroyed = this.enemyAI.checkCollisions(activeBullets, (points, position) => {
            this.score += points;
            this.graphics.createShatterEffect(position);
        });
    
        if (enemyDestroyed) {
            // Remove the collided bullet
            const collidedBullet = activeBullets.find(b => !b.inUse);
            if (collidedBullet) {
                collidedBullet.reset();
            }
        }
    
        // Check for player-enemy collisions
        for (const enemy of this.enemyAI.enemies) {
            if (enemy.mesh && this.player.mesh) {
                const distance = this.player.mesh.position.distanceTo(enemy.mesh.position);
                const collisionThreshold = (this.player.mesh.geometry.parameters.radius || 0.5) + 
                                           (enemy.mesh.geometry.parameters.width || enemy.mesh.geometry.parameters.radius || 0.5) / 2;
                
                if (distance < collisionThreshold) {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.resetPlayerPosition();
                    }
                    enemy.reset();
                    break;
                }
            }
        }
    }

    shootBullet() {
        const bullet = this.getBulletFromPool();
        if (bullet) {
            const direction = new THREE.Vector3(
                Math.cos(this.player.mesh.rotation.z + Math.PI / 2),
                Math.sin(this.player.mesh.rotation.z + Math.PI / 2),
                0
            );
            bullet.init(this.player.mesh.position, direction);
        }
    }

    getBulletFromPool() {
        return this.bulletPool.find(b => !b.inUse);
    }

    checkCollisions() {
        const activeBullets = this.bulletPool.filter(b => b.inUse);

        const enemyDestroyed = this.enemyAI.checkCollisions(activeBullets, (points, position) => {
            this.score += points;
            this.graphics.createShatterEffect(position);
        });

        if (enemyDestroyed) {
            // Remove the collided bullet
            const collidedBullet = activeBullets.find(b => !b.inUse);
            if (collidedBullet) {
                collidedBullet.reset();
            }
        }

        // Check for player-enemy collisions
        for (const enemy of this.enemyAI.enemies) {
            if (enemy.mesh && this.player.checkCollision(enemy)) {
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                } else {
                    this.resetPlayerPosition();
                }
                enemy.reset();
                break;
            }
        }
    }

    resetPlayerPosition() {
        this.player.mesh.position.set(0, 0, 0);
    }

    gameOver() {
        this.ui.showGameOver(this.score);
        // Implement game over logic here
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.update();
        this.render();
    }
}

// Initialize the game when the window loads
window.onload = () => {
    window.game = new Game();
};
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

        this.enemyPool = [];
        for (let i = 0; i < CONFIG.INITIAL_ENEMY_POOL_SIZE; i++) {
            this.enemyPool.push(new Enemy(this.scene));
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
            const enemyData = this.enemyAI.spawnEnemy(type, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT, this.player.mesh.position.x, this.player.mesh.position.y);
            const enemy = this.getEnemyFromPool();
            enemy.init(type, enemyData.x, enemyData.y, this.enemyAI.enemyTypes[type]);
        });

        this.enemyAI.updateEnemies(this.player.mesh.position, this.bulletPool.filter(b => b.mesh.visible));

        this.checkCollisions();

        this.graphics.updateShatterParticles();
        this.graphics.updateBulletTrails(this.bulletPool.filter(b => b.mesh.visible));

        this.background.interact(this.player.mesh.position.x, this.player.mesh.position.y, 1);
        this.bulletPool.filter(b => b.mesh.visible).forEach(bullet => {
            this.background.interact(bullet.mesh.position.x, bullet.mesh.position.y, 0.5);
            bullet.update();
        });
        this.enemyAI.enemies.forEach(enemy => {
            this.background.interact(enemy.mesh.position.x, enemy.mesh.position.y, 0.5);
        });

        this.ui.updateScore(this.score);
        this.ui.updateLives(this.lives);
    }

    shootBullet() {
        const bullet = this.getBulletFromPool();
        const direction = new THREE.Vector3(
            Math.cos(this.player.mesh.rotation.z + Math.PI / 2),
            Math.sin(this.player.mesh.rotation.z + Math.PI / 2),
            0
        );
        bullet.init(this.player.mesh.position, direction);
    }

    getBulletFromPool() {
        return this.bulletPool.find(b => !b.mesh.visible) || this.bulletPool[0];
    }

    getEnemyFromPool() {
        return this.enemyPool.find(e => !e.mesh) || this.enemyPool[0];
    }

    checkCollisions() {
        const activeBullets = this.bulletPool.filter(b => b.mesh.visible);
        const activeEnemies = this.enemyAI.enemies;

        for (const bullet of activeBullets) {
            for (const enemy of activeEnemies) {
                if (bullet.mesh.position.distanceTo(enemy.mesh.position) < enemy.mesh.geometry.parameters.width / 2) {
                    this.score += enemy.points;
                    this.graphics.createShatterEffect(enemy.mesh);
                    enemy.reset();
                    bullet.reset();
                    break;
                }
            }
        }

        for (const enemy of activeEnemies) {
            if (this.player.mesh.position.distanceTo(enemy.mesh.position) < (this.player.mesh.geometry.parameters.radius + enemy.mesh.geometry.parameters.width / 2)) {
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

const game = new Game();
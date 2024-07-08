class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        this.init();
    }

    resize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    init() {
        this.gridSize = 80;
        this.cols = Math.ceil(this.width / this.gridSize) + 1;
        this.rows = Math.ceil(this.height / this.gridSize) + 1;
        this.points = new Float32Array(this.cols * this.rows * 4); // x, y, dx, dy

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const i = (y * this.cols + x) * 4;
                this.points[i] = this.points[i + 2] = x * this.gridSize; // x and baseX
                this.points[i + 1] = this.points[i + 3] = y * this.gridSize; // y and baseY
            }
        }

        this.interactionPoints = [];
        
        this.forceMultiplier = 10000;
        this.effectRadius = 338;
        this.fadeSpeed = 0.15;
        this.elasticity = 0.8;
        this.lineWidth = 1.5;
        this.glowIntensity = 7;

        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = this.width;
        this.offscreenCanvas.height = this.height;
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    }

    interact(x, y, mass = 1) {
        this.interactionPoints.push({ x, y, mass, life: 1 });
    }

    update() {
        this.interactionPoints = this.interactionPoints.filter(point => {
            point.life -= 0.02;
            return point.life > 0;
        });

        const effectRadiusSquared = this.effectRadius * this.effectRadius;
        for (let i = 0; i < this.points.length; i += 4) {
            let totalForceX = 0;
            let totalForceY = 0;

            for (const point of this.interactionPoints) {
                const dx = point.x - this.points[i + 2];
                const dy = point.y - this.points[i + 3];
                const distanceSquared = dx * dx + dy * dy;

                if (distanceSquared < effectRadiusSquared) {
                    const distance = Math.sqrt(distanceSquared);
                    const force = (1 - distance / this.effectRadius) * this.forceMultiplier * point.mass * point.life;
                    totalForceX += (dx / distance) * force;
                    totalForceY += (dy / distance) * force;
                }
            }

            this.points[i] += totalForceX * 0.0001;
            this.points[i + 1] += totalForceY * 0.0001;
        }

        this.relaxPoints();
    }

    relaxPoints() {
        const elasticityFactor = 1 - this.elasticity;
        for (let i = 0; i < this.points.length; i += 4) {
            const dx = this.points[i] - this.points[i + 2];
            const dy = this.points[i + 1] - this.points[i + 3];
            this.points[i] -= dx * elasticityFactor;
            this.points[i + 1] -= dy * elasticityFactor;
        }
    }

    draw() {
        this.offscreenCtx.fillStyle = `rgba(0, 0, 0, ${this.fadeSpeed})`;
        this.offscreenCtx.fillRect(0, 0, this.width, this.height);
        
        this.offscreenCtx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        this.offscreenCtx.lineWidth = this.lineWidth;
        this.offscreenCtx.shadowBlur = this.glowIntensity;
        this.offscreenCtx.shadowColor = 'cyan';

        this.offscreenCtx.beginPath();
        for (let y = 0; y < this.rows - 1; y++) {
            for (let x = 0; x < this.cols - 1; x++) {
                const i = (y * this.cols + x) * 4;
                const x1 = this.points[i];
                const y1 = this.points[i + 1];
                const x2 = this.points[i + 4];
                const y2 = this.points[i + 5];
                const x3 = this.points[i + this.cols * 4];
                const y3 = this.points[i + this.cols * 4 + 1];

                this.offscreenCtx.moveTo(x1, y1);
                this.offscreenCtx.lineTo(x2, y2);
                this.offscreenCtx.moveTo(x1, y1);
                this.offscreenCtx.lineTo(x3, y3);
            }
        }
        this.offscreenCtx.stroke();

        this.offscreenCtx.shadowBlur = 0;

        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }
}
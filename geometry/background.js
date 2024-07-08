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
        this.cellSize = 50; // Increased cell size for fewer calculations
        this.cols = Math.ceil(this.width / this.cellSize) + 1;
        this.rows = Math.ceil(this.height / this.cellSize) + 1;
        this.points = [];

        for (let y = 0; y <= this.rows; y++) {
            for (let x = 0; x <= this.cols; x++) {
                this.points.push({
                    x: x * this.cellSize,
                    y: y * this.cellSize,
                    originX: x * this.cellSize,
                    originY: y * this.cellSize,
                    dx: 0,
                    dy: 0
                });
            }
        }

        this.time = 0;
        this.interactionPoints = new Set(); // Using a Set for faster operations
        this.lastInteractionPoints = new Set();
    }

    interact(x, y, mass) {
        const key = `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
        this.interactionPoints.add(key);
    }

    update() {
        this.time += 0.01;

        // Only update points near interaction points
        this.interactionPoints.forEach(key => {
            const [x, y] = key.split(',').map(Number);
            this.updateNearbyPoints(x, y);
        });

        // Reset points that were affected in the last frame but not in this one
        this.lastInteractionPoints.forEach(key => {
            if (!this.interactionPoints.has(key)) {
                const [x, y] = key.split(',').map(Number);
                this.resetNearbyPoints(x, y);
            }
        });

        this.lastInteractionPoints = new Set(this.interactionPoints);
        this.interactionPoints.clear();
    }

    updateNearbyPoints(gridX, gridY) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const x = gridX + dx;
                const y = gridY + dy;
                if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
                    const index = y * (this.cols + 1) + x;
                    const point = this.points[index];
                    if (point) {
                        const force = 5; // Reduced force for smoother effect
                        point.dx = (Math.random() - 0.5) * force;
                        point.dy = (Math.random() - 0.5) * force;
                        point.x = point.originX + point.dx;
                        point.y = point.originY + point.dy;
                    }
                }
            }
        }
    }

    resetNearbyPoints(gridX, gridY) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const x = gridX + dx;
                const y = gridY + dy;
                if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
                    const index = y * (this.cols + 1) + x;
                    const point = this.points[index];
                    if (point) {
                        point.x = point.originX;
                        point.y = point.originY;
                        point.dx = 0;
                        point.dy = 0;
                    }
                }
            }
        }
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 20, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const p0 = this.points[y * (this.cols + 1) + x];
                const p1 = this.points[y * (this.cols + 1) + x + 1];
                const p2 = this.points[(y + 1) * (this.cols + 1) + x];

                if (p0 && p1 && p2) {
                    const gradient = this.ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
                    gradient.addColorStop(0, `hsl(${(x + y) * 2 + this.time * 10}, 100%, 50%)`);
                    gradient.addColorStop(1, `hsl(${(x + y + 1) * 2 + this.time * 10}, 100%, 50%)`);

                    this.ctx.beginPath();
                    this.ctx.moveTo(p0.x, p0.y);
                    this.ctx.lineTo(p1.x, p1.y);
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();

                    this.ctx.beginPath();
                    this.ctx.moveTo(p0.x, p0.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = gradient;
                    this.ctx.stroke();
                }
            }
        }
    }
}
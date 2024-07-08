
class CyberpunkGrid {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        this.init();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    init() {
        this.cellSize = 30;
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
        this.interactionPoints = [];
    }

    // Method to allow external objects to interact with the grid
    interact(x, y, mass) {
        this.interactionPoints.push({ x, y, mass });
    }

    update() {
        this.time += 0.01;

        this.points.forEach(point => {
            point.dx = 0;
            point.dy = 0;

            this.interactionPoints.forEach(ip => {
                const dx = ip.x - point.originX;
                const dy = ip.y - point.originY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const force = (ip.mass * 5000) / (distance * distance);

                if (distance > 10) {
                    point.dx += (dx / distance) * force;
                    point.dy += (dy / distance) * force;
                }
            });

            point.x = point.originX + point.dx;
            point.y = point.originY + point.dy;
        });

        // Clear interaction points for the next frame
        this.interactionPoints = [];
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 20, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw warped grid
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const p0 = this.points[y * (this.cols + 1) + x];
                const p1 = this.points[y * (this.cols + 1) + x + 1];
                const p2 = this.points[(y + 1) * (this.cols + 1) + x];

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

        // Draw glowing intersections
        this.points.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fill();
        });
    }
}

// Global variable to store the grid instance
let cyberpunkGrid;

function initCyberpunkGridTest() {
    const canvas = document.getElementById('gameCanvas');
    cyberpunkGrid = new CyberpunkGrid(canvas);

    function animate() {
        cyberpunkGrid.update();
        cyberpunkGrid.draw();
        requestAnimationFrame(animate);
    }

    animate();

    // Simulate external interactions
    setInterval(() => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const mass = Math.random() * 20 + 10;
        cyberpunkGrid.interact(x, y, mass);
    }, 1000);
}

window.onload = initCyberpunkGridTest;

// Expose the interact method globally so it can be called from other parts of the code
window.interactWithGrid = (x, y, mass) => {
    if (cyberpunkGrid) {
        cyberpunkGrid.interact(x, y, mass);
    }
};
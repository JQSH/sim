class Background {
    constructor(scene) {
        this.scene = scene;
        this.points = [];
        this.lines = [];
        this.interactionPoints = [];
        this.init();
    }

    init() {
        this.gridSize = 1;
        this.cols = 20;
        this.rows = 20;
        this.forceMultiplier = 0.05;
        this.effectRadius = 3;
        this.elasticity = 0.55;

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const point = new THREE.Vector3(
                    (x - this.cols / 2) * this.gridSize,
                    (y - this.rows / 2) * this.gridSize,
                    0
                );
                this.points.push({
                    current: point.clone(),
                    base: point.clone()
                });
            }
        }

        this.createGrid();
    }

    createGrid() {
        const material = new THREE.LineBasicMaterial({
            color: 0x191970,
            transparent: true,
            opacity: 0.5
        });

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols - 1; x++) {
                const index = y * this.cols + x;
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array(6);
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const line = new THREE.Line(geometry, material);
                this.lines.push(line);
                this.scene.add(line);
            }
        }

        for (let y = 0; y < this.rows - 1; y++) {
            for (let x = 0; x < this.cols; x++) {
                const index = y * this.cols + x;
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array(6);
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const line = new THREE.Line(geometry, material);
                this.lines.push(line);
                this.scene.add(line);
            }
        }
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
        for (let point of this.points) {
            let totalForceX = 0;
            let totalForceY = 0;

            for (const interactionPoint of this.interactionPoints) {
                const dx = interactionPoint.x - point.base.x;
                const dy = interactionPoint.y - point.base.y;
                const distanceSquared = dx * dx + dy * dy;

                if (distanceSquared < effectRadiusSquared) {
                    const distance = Math.sqrt(distanceSquared);
                    const force = (1 - distance / this.effectRadius) * this.forceMultiplier * interactionPoint.mass * interactionPoint.life;
                    totalForceX += (dx / distance) * force;
                    totalForceY += (dy / distance) * force;
                }
            }

            point.current.x = point.base.x + totalForceX;
            point.current.y = point.base.y + totalForceY;
        }

        this.relaxPoints();
        this.updateLines();
    }

    relaxPoints() {
        const elasticityFactor = 1 - this.elasticity;
        for (let point of this.points) {
            const dx = point.current.x - point.base.x;
            const dy = point.current.y - point.base.y;
            point.current.x -= dx * elasticityFactor;
            point.current.y -= dy * elasticityFactor;
        }
    }

    updateLines() {
        let lineIndex = 0;
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols - 1; x++) {
                const index = y * this.cols + x;
                const positions = this.lines[lineIndex].geometry.attributes.position.array;
                positions[0] = this.points[index].current.x;
                positions[1] = this.points[index].current.y;
                positions[2] = 0;
                positions[3] = this.points[index + 1].current.x;
                positions[4] = this.points[index + 1].current.y;
                positions[5] = 0;
                this.lines[lineIndex].geometry.attributes.position.needsUpdate = true;
                lineIndex++;
            }
        }

        for (let y = 0; y < this.rows - 1; y++) {
            for (let x = 0; x < this.cols; x++) {
                const index = y * this.cols + x;
                const positions = this.lines[lineIndex].geometry.attributes.position.array;
                positions[0] = this.points[index].current.x;
                positions[1] = this.points[index].current.y;
                positions[2] = 0;
                positions[3] = this.points[index + this.cols].current.x;
                positions[4] = this.points[index + this.cols].current.y;
                positions[5] = 0;
                this.lines[lineIndex].geometry.attributes.position.needsUpdate = true;
                lineIndex++;
            }
        }
    }
}

class Graphics {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animationTime = 0;
        this.shatterParticles = [];
        this.updateSettings();
        this.lastUpdateTime = Date.now();
    }

    updateSettings() {
        this.segmentsPerSide = 3;
        this.maxVelocity = 2;
        this.rotationSpeed = 2;
        this.fadeSpeed = 0.5;
    }

    createShatterParticles(enemy) {
        const particles = [];
        const color = enemy.type === 'diamond' ? '#00ffff' : '#00ff00';
        const size = enemy.size * 1.1;

        if (enemy.type === 'diamond') {
            const halfWidth = size / 2;
            const halfHeight = size * 0.4;
            const points = [
                {x: 0, y: -halfHeight},
                {x: halfWidth, y: 0},
                {x: 0, y: halfHeight},
                {x: -halfWidth, y: 0}
            ];
            for (let i = 0; i < 4; i++) {
                this.createSegmentedParticles(enemy,
                    points[i], points[(i + 1) % 4], this.segmentsPerSide, particles, color);
            }
        } else { // square
            const halfSize = size / 2;
            const points = [
                {x: -halfSize, y: -halfSize},
                {x: halfSize, y: -halfSize},
                {x: halfSize, y: halfSize},
                {x: -halfSize, y: halfSize}
            ];
            for (let i = 0; i < 4; i++) {
                this.createSegmentedParticles(enemy, points[i], points[(i + 1) % 4], this.segmentsPerSide, particles, color);
            }
        }

        this.shatterParticles.push(...particles);
    }

    createSegmentedParticles(enemy, start, end, segments, particles, color) {
        for (let i = 0; i < segments; i++) {
            const startX = start.x + (end.x - start.x) * (i / segments);
            const startY = start.y + (end.y - start.y) * (i / segments);
            const endX = start.x + (end.x - start.x) * ((i + 1) / segments);
            const endY = start.y + (end.y - start.y) * ((i + 1) / segments);

            const midX = (startX + endX) / 2;
            const midY = (startY + endY) / 2;
            const angle = Math.atan2(midY, midX);
            const velocity = this.maxVelocity * (0.5 + Math.random() * 0.5);

            particles.push({
                x: enemy.x + midX * 1.1,
                y: enemy.y + midY * 1.1,
                startX: (startX - midX) * 0.9,
                startY: (startY - midY) * 0.9,
                endX: (endX - midX) * 0.9,
                endY: (endY - midY) * 0.9,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                color: color,
                alpha: 1,
                type: enemy.type,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * this.rotationSpeed * 2
            });
        }
    }

    updateShatterParticles(deltaTime) {
        this.shatterParticles = this.shatterParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.rotationSpeed * deltaTime;
            particle.alpha -= this.fadeSpeed * deltaTime;

            return particle.alpha > 0;
        });
    }

    drawShatterParticles() {
        this.shatterParticles.forEach(particle => {
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            this.ctx.globalAlpha = particle.alpha;

            const rgb = this.hexToRgb(particle.color);
            this.ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.alpha})`;
            this.ctx.lineWidth = 3;

            this.ctx.beginPath();
            this.ctx.moveTo(particle.startX, particle.startY);
            this.ctx.lineTo(particle.endX, particle.endY);
            
            this.ctx.lineCap = 'round';
            
            this.ctx.stroke();

            this.ctx.restore();
        });
    }

    updateAnimation(deltaTime) {
        this.animationTime += deltaTime * 1.5;
        this.updateShatterParticles(deltaTime);
    }

    hexToRgb(hex) {
        // Remove the hash at the start if it's there
        hex = hex.replace(/^#/, '');
    
        // Parse the hex string
        let r, g, b;
    
        if (hex.length === 3) {
            // 3-digit hex
            r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
            g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
        } else if (hex.length === 6) {
            // 6-digit hex
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            throw new Error('Invalid hex color format');
        }
    
        // Ensure r, g, b are within valid range
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
    
        return { r, g, b };
    }

    drawWithGlow(drawFunction, x, y, size, angle, color) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);

        const currentGlowSize = 9;
        const currentGlowIntensity = 0.85;

        // Draw enhanced glow
        const rgb = this.hexToRgb(color);
        this.ctx.shadowBlur = currentGlowSize / 2;
        this.ctx.shadowColor = color;

        for (let i = 0; i < 20; i++) {
            this.ctx.beginPath();
            drawFunction(this.ctx, size);
            
            const alpha = (currentGlowIntensity / 20) * Math.pow(1 - i / 20, 2);
            this.ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
            this.ctx.lineWidth = currentGlowSize * (1 - i / 20);
            this.ctx.stroke();
        }

        this.ctx.shadowBlur = 0;

        // Draw actual object
        this.ctx.beginPath();
        drawFunction(this.ctx, size);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawPlayer(player) {
        const drawPlayerShape = (ctx, size) => {
            ctx.moveTo(size / 2, 0);
            ctx.lineTo(-size / 2, -size / 2);
            ctx.lineTo(-size / 2, size / 2);
            ctx.closePath();
        };
        this.drawWithGlow(drawPlayerShape, player.x, player.y, player.size, player.angle, '#ffffff');
        
        // Fill the first third of the triangle
        this.ctx.save();
        this.ctx.translate(player.x, player.y);
        this.ctx.rotate(player.angle);
        this.ctx.beginPath();
        this.ctx.moveTo(player.size / 2, 0);
        this.ctx.lineTo(-player.size / 6, -player.size / 6);
        this.ctx.lineTo(-player.size / 6, player.size / 6);
        this.ctx.closePath();
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.restore();
    }

    drawEnemy(enemy) {
        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;
        
        this.animationTime += deltaTime * 1.5;
    
        if (enemy.type === 'diamond') {
            const drawDiamondShape = (ctx, size) => {
                const scaleFactor = 1.6;
                const widthScale = (Math.sin(this.animationTime * 1.8 + 0) * 0.22 + 1) * scaleFactor;
                const heightScale = (Math.cos(this.animationTime * 1.8 + 1.57) * 0.22 + 1) * scaleFactor;
                
                const width = Math.max(size * widthScale, size * 0.7 * scaleFactor);
                const height = Math.max(size * heightScale, size * 0.66 * scaleFactor);
                const halfWidth = width / 2;
                const halfHeight = height / 2;
                const maxRadius = Math.min(halfWidth, halfHeight) / 2;
                const radius = Math.min(2, maxRadius);
    
                ctx.moveTo(0, -halfHeight);
                ctx.lineTo(halfWidth - radius, -radius);
                ctx.quadraticCurveTo(halfWidth, 0, halfWidth - radius, radius);
                ctx.lineTo(0, halfHeight);
                ctx.lineTo(-halfWidth + radius, radius);
                ctx.quadraticCurveTo(-halfWidth, 0, -halfWidth + radius, -radius);
                ctx.closePath();
            };
            this.drawWithGlow(drawDiamondShape, enemy.x, enemy.y, enemy.size, 0, '#00ffff');
        } else if (enemy.type === 'square') {
            const drawSquareShape = (ctx, size) => {
                ctx.rect(-size / 2, -size / 2, size, size);
            };
            this.drawWithGlow(drawSquareShape, enemy.x, enemy.y, enemy.size, 0, '#00ff00');
        }
    }

    drawBullet(bullet) {
        const width = 5;  // Default width if not specified
        const height = 2;  // Default height if not specified
        const cornerRadius = 1;  // Default corner radius if not specified
        const color = bullet.color || '#ffffff';  // Default to white if color not specified
    
        this.ctx.save();
        this.ctx.translate(bullet.x, bullet.y);
        this.ctx.rotate(bullet.angle);
    
        const drawBulletShape = (ctx) => {
            ctx.moveTo(width, 0);
            ctx.arcTo(width, height/2, width - cornerRadius, height/2, cornerRadius);
            ctx.lineTo(-width + cornerRadius, height/2);
            ctx.arcTo(-width, height/2, -width, 0, cornerRadius);
            ctx.arcTo(-width, -height/2, -width + cornerRadius, -height/2, cornerRadius);
            ctx.lineTo(width - cornerRadius, -height/2);
            ctx.arcTo(width, -height/2, width, 0, cornerRadius);
            ctx.closePath();
        };
    
        // Draw glow
        const rgb = this.hexToRgb(color);
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = color;
    
        for (let i = 0; i < 3; i++) {
            this.ctx.beginPath();
            drawBulletShape(this.ctx);
            
            const alpha = 0.3 * (1 - i / 3);
            this.ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
            this.ctx.lineWidth = 3 * (1 - i / 3);
            this.ctx.stroke();
        }
    
        this.ctx.shadowBlur = 0;
    
        // Draw and fill actual bullet
        this.ctx.beginPath();
        drawBulletShape(this.ctx);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    
        this.ctx.restore();
    }

    drawEnvironment() {
        // You can add environment drawing code here if needed
    }

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
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

    createShatterEffect(enemy) {
        const particles = this.createShatterParticles(enemy);
        this.shatterParticles.push(...particles);
    }

    createShatterParticles(enemy) {
        const particles = [];
        const color = enemy.type === 'diamond' ? '#00ffff' : '#00ff00';
        const size = enemy.size;
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 1 + Math.random() * 2;
            particles.push({
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size / 4 + Math.random() * (size / 4),
                color: color,
                alpha: 1,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }

        return particles;
    }

    updateShatterParticles() {
        this.shatterParticles = this.shatterParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.rotationSpeed;
            particle.alpha -= 0.02;
            particle.size *= 0.97;
    
            return particle.alpha > 0 && particle.size > 0.5;
        });
    }
    
    drawShatterParticles() {
        this.shatterParticles.forEach(particle => {
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            this.ctx.globalAlpha = particle.alpha;

            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.rect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            this.ctx.fill();

            this.ctx.restore();
        });
    }

    updateAnimation(deltaTime) {
        this.animationTime += deltaTime * 1.5;
        this.updateShatterParticles(deltaTime);
    }

    hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        let r, g, b;
    
        if (hex.length === 3) {
            r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
            g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            throw new Error('Invalid hex color format');
        }
    
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

    drawBullet(x, y, angle) {
        const width = 12;
        const height = 7;
        const frontPointiness = 1;
        const rearPointiness = 0.34;
        const sideIndent = 0;
        const color = '#ffff00';
        const glowSize = 9;
        const glowIntensity = 0.85;
    
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
    
        const drawBulletShape = (ctx) => {
            const frontTip = width * (1 - frontPointiness);
            const rearTip = width * (1 - rearPointiness);
            const sideDepth = height * sideIndent / 2;
    
            ctx.moveTo(width, 0);
            ctx.quadraticCurveTo(width, height/2, frontTip, height/2);
            ctx.lineTo(-rearTip, height/2);
            ctx.quadraticCurveTo(-width, height/2, -width, 0);
            ctx.quadraticCurveTo(-width, -height/2, -rearTip, -height/2);
            ctx.lineTo(frontTip, -height/2);
            ctx.quadraticCurveTo(width, -height/2, width, 0);
    
            if (sideIndent > 0) {
                ctx.quadraticCurveTo(width/2, sideDepth, 0, sideDepth);
                ctx.quadraticCurveTo(-width/2, sideDepth, -width, 0);
            }
    
            ctx.closePath();
        };
    
        const rgb = this.hexToRgb(color);
        this.ctx.shadowBlur = glowSize / 2;
        this.ctx.shadowColor = color;
    
        for (let i = 0; i < 20; i++) {
            this.ctx.beginPath();
            drawBulletShape(this.ctx);
            
            const alpha = (glowIntensity / 20) * Math.pow(1 - i / 20, 2);
            this.ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
            this.ctx.lineWidth = glowSize * (1 - i / 20);
            this.ctx.stroke();
        }
    
        this.ctx.shadowBlur = 0;
    
        this.ctx.beginPath();
        drawBulletShape(this.ctx);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
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
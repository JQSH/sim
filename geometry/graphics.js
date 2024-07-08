class Graphics {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animationTime = 0;
        this.shatterParticles = [];
        this.updateSettings();
        this.lastUpdateTime = Date.now();
        
        // Particle pool
        this.particlePool = [];
        for (let i = 0; i < 500; i++) {
            this.particlePool.push({});
        }
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
        const color = enemy.type === 'diamond' ? 'rgb(0, 255, 255)' : 'rgb(0, 255, 0)';
        const size = enemy.size;
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = this.particlePool.pop() || {};
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = 1 + Math.random() * 2;
            
            particle.x = enemy.x;
            particle.y = enemy.y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = size / 4 + Math.random() * (size / 4);
            particle.color = color;
            particle.alpha = 1;
            particle.rotation = Math.random() * Math.PI * 2;
            particle.rotationSpeed = (Math.random() - 0.5) * 0.2;
            
            particles.push(particle);
        }

        return particles;
    }

    updateShatterParticles(deltaTime) {
        this.shatterParticles = this.shatterParticles.filter(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.rotation += particle.rotationSpeed * deltaTime;
            particle.alpha -= 0.02 * deltaTime;
            particle.size *= Math.pow(0.97, deltaTime);
    
            if (particle.alpha <= 0 || particle.size <= 0.5) {
                this.particlePool.push(particle);  // Return to pool
                return false;
            }
            return true;
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

    drawWithGlow(drawFunction, x, y, size, angle, color) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);

        const currentGlowSize = 9;
        const currentGlowIntensity = 0.85;

        this.ctx.shadowBlur = currentGlowSize / 2;
        this.ctx.shadowColor = color;

        for (let i = 0; i < 20; i++) {
            this.ctx.beginPath();
            drawFunction(this.ctx, size);
            
            const alpha = (currentGlowIntensity / 20) * Math.pow(1 - i / 20, 2);
            this.ctx.strokeStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
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
        this.drawWithGlow(drawPlayerShape, player.x, player.y, player.size, player.angle, 'rgb(255, 255, 255)');
        
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
            this.drawWithGlow(drawDiamondShape, enemy.x, enemy.y, enemy.size, 0, 'rgb(0, 255, 255)');
        } else if (enemy.type === 'square') {
            const drawSquareShape = (ctx, size) => {
                ctx.rect(-size / 2, -size / 2, size, size);
            };
            this.drawWithGlow(drawSquareShape, enemy.x, enemy.y, enemy.size, 0, 'rgb(0, 255, 0)');
        }
    }

    drawBullet(x, y, angle) {
        const width = 12;
        const height = 7;
        const frontPointiness = 1;
        const rearPointiness = 0.34;
        const sideIndent = 0;
        const color = 'rgb(255, 255, 0)';
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
    
        this.ctx.shadowBlur = glowSize / 2;
        this.ctx.shadowColor = color;
    
        for (let i = 0; i < 20; i++) {
            this.ctx.beginPath();
            drawBulletShape(this.ctx);
            
            const alpha = (glowIntensity / 20) * Math.pow(1 - i / 20, 2);
            this.ctx.strokeStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
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

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
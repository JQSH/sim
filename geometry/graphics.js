class Graphics {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
    }

    drawPlayer(player) {
        this.ctx.save();
        this.ctx.translate(player.x, player.y);
        this.ctx.rotate(player.angle);
        
        // Draw the transparent triangle with white border
        this.ctx.beginPath();
        this.ctx.moveTo(player.size / 2, 0);
        this.ctx.lineTo(-player.size / 2, -player.size / 2);
        this.ctx.lineTo(-player.size / 2, player.size / 2);
        this.ctx.closePath();
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Fill the first third of the triangle
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
        this.ctx.save();
        this.ctx.translate(enemy.x, enemy.y);
        
        if (enemy.type === 'diamond') {
            // Draw the transparent narrow diamond with cyan border
            this.ctx.beginPath();
            this.ctx.moveTo(0, -enemy.size);
            this.ctx.lineTo(enemy.width, 0);
            this.ctx.lineTo(0, enemy.size);
            this.ctx.lineTo(-enemy.width, 0);
            this.ctx.closePath();
            this.ctx.strokeStyle = 'cyan';
        } else if (enemy.type === 'square') {
            // Draw the transparent square with green border
            this.ctx.beginPath();
            this.ctx.rect(-enemy.size / 2, -enemy.size / 2, enemy.size, enemy.size);
            this.ctx.strokeStyle = 'green';
        }
        
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawBullet(bullet) {
        this.ctx.strokeStyle = 'yellow';
        this.ctx.lineWidth = CONFIG.BULLET_THICKNESS;
        this.ctx.beginPath();
        this.ctx.moveTo(bullet.x, bullet.y);
        this.ctx.lineTo(
            bullet.x - Math.cos(bullet.angle) * CONFIG.BULLET_SIZE,
            bullet.y - Math.sin(bullet.angle) * CONFIG.BULLET_SIZE
        );
        this.ctx.stroke();
    }

    drawEnvironment() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class UI {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
    }

    updateScore(score) {
        if (this.scoreElement) {
            this.scoreElement.textContent = `Score: ${score}`;
        }
    }

    updateLives(lives) {
        if (this.livesElement) {
            this.livesElement.textContent = `Lives: ${lives}`;
        }
    }

    showGameOver(finalScore) {
        const gameOverElement = document.createElement('div');
        gameOverElement.style.position = 'absolute';
        gameOverElement.style.top = '50%';
        gameOverElement.style.left = '50%';
        gameOverElement.style.transform = 'translate(-50%, -50%)';
        gameOverElement.style.color = 'white';
        gameOverElement.style.fontSize = '36px';
        gameOverElement.style.textAlign = 'center';
        gameOverElement.innerHTML = `Game Over<br>Final Score: ${finalScore}`;
        document.body.appendChild(gameOverElement);
    }
}
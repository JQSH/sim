class UI {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
    }

    updateScore(score) {
        this.scoreElement.textContent = `Score: ${score}`;
    }

    updateLives(lives) {
        this.livesElement.textContent = `Lives: ${lives}`;
    }

    showGameOver(score) {
        const gameOverElement = document.createElement('div');
        gameOverElement.id = 'game-over';
        gameOverElement.style.position = 'absolute';
        gameOverElement.style.top = '50%';
        gameOverElement.style.left = '50%';
        gameOverElement.style.transform = 'translate(-50%, -50%)';
        gameOverElement.style.color = 'white';
        gameOverElement.style.fontSize = '36px';
        gameOverElement.style.textAlign = 'center';
        gameOverElement.innerHTML = `
            <h1>Game Over</h1>
            <p>Your score: ${score}</p>
            <button id="restart-button">Restart</button>
        `;
        document.body.appendChild(gameOverElement);

        const restartButton = document.getElementById('restart-button');
        restartButton.addEventListener('click', () => {
            this.hideGameOver();
            // You'll need to implement the restartGame function in your game logic
            restartGame();
        });
    }

    hideGameOver() {
        const gameOverElement = document.getElementById('game-over');
        if (gameOverElement) {
            gameOverElement.remove();
        }
    }
}
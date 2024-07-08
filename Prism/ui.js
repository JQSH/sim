// ui.js
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
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <h1>Game Over</h1>
            <p>Your score: ${score}</p>
            <button id="restartButton">Restart</button>
        `;
        document.body.appendChild(gameOverDiv);

        document.getElementById('restartButton').addEventListener('click', () => {
            document.body.removeChild(gameOverDiv);
            // Call the restart game function here
            if (window.game && typeof window.game.restart === 'function') {
                window.game.restart();
            }
        });
    }
}

// Make UI available globally
window.UI = UI;
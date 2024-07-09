class UI {
    constructor() {
        this.scoreElement = this.createUIElement('Score: 0', '10px', '10px');
        this.livesElement = this.createUIElement('Lives: 3', '10px', '30px');
        this.gameOverElement = this.createUIElement('GAME OVER', '50%', '50%');
        this.gameOverElement.style.display = 'none';
        this.gameOverElement.style.transform = 'translate(-50%, -50%)';
    }

    createUIElement(text, left, top) {
        const element = document.createElement('div');
        element.style.position = 'absolute';
        element.style.left = left;
        element.style.top = top;
        element.style.color = 'white';
        element.style.fontFamily = 'Arial, sans-serif';
        element.textContent = text;
        document.body.appendChild(element);
        return element;
    }

    updateScore(score) {
        this.scoreElement.textContent = `Score: ${score}`;
    }

    updateLives(lives) {
        this.livesElement.textContent = `Lives: ${lives}`;
    }

    showGameOver(score) {
        this.gameOverElement.textContent = `GAME OVER\nScore: ${score}\nClick to restart`;
        this.gameOverElement.style.display = 'block';
    }

    hideGameOver() {
        this.gameOverElement.style.display = 'none';
    }
}
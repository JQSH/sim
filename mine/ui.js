let localDiamondCount = 0;

function updateDiamondCounter() {
    const counterElement = document.getElementById('diamondCounter');
    counterElement.textContent = `x ${localDiamondCount}`;
    
    counterElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        counterElement.style.transform = 'scale(1)';
    }, 200);
}

function updateDiamondCount(increment = 1) {
    localDiamondCount += increment;
    updateDiamondCounter();
}

function createDiamondCounter() {
    const counterContainer = document.createElement('div');
    counterContainer.id = 'diamondCounterContainer';
    counterContainer.style.position = 'fixed';
    counterContainer.style.top = '20px';
    counterContainer.style.right = '20px';
    counterContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    counterContainer.style.padding = '10px';
    counterContainer.style.borderRadius = '5px';
    counterContainer.style.color = 'white';
    counterContainer.style.fontFamily = 'Arial, sans-serif';
    counterContainer.style.fontSize = '24px';
    counterContainer.style.transition = 'transform 0.2s';

    const diamondIcon = document.createElement('span');
    diamondIcon.textContent = '💎';
    diamondIcon.style.marginRight = '5px';

    const counterElement = document.createElement('span');
    counterElement.id = 'diamondCounter';
    counterElement.textContent = 'x 0';

    counterContainer.appendChild(diamondIcon);
    counterContainer.appendChild(counterElement);

    document.body.appendChild(counterContainer);
}

function showMessage(message, duration = 3000) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.style.position = 'fixed';
    messageElement.style.top = '50%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';
    messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    messageElement.style.color = 'white';
    messageElement.style.padding = '20px';
    messageElement.style.borderRadius = '10px';
    messageElement.style.fontSize = '24px';
    messageElement.style.textAlign = 'center';
    messageElement.style.transition = 'opacity 0.5s';

    document.body.appendChild(messageElement);

    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 500);
    }, duration);
}

function initUI() {
    createDiamondCounter();
    updateDiamondCounter();
}

window.updateDiamondCounter = updateDiamondCounter;
window.updateDiamondCount = updateDiamondCount;
window.createDiamondCounter = createDiamondCounter;
window.showMessage = showMessage;
window.initUI = initUI;
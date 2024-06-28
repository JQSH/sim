let currentElement = null;
let clickCoords = { x: 0, y: 0 };
let clickMenuEnabled = true;

function initializeUI() {
    const menuToggle = document.getElementById('websim-menu-toggle');
    const resetButton = document.getElementById('websim-reset-button');
    const transformMenu = document.getElementById('websim-transform-menu');
    const sendButton = document.getElementById('websim-send-button');
    const textInput = document.getElementById('websim-text-input');
    const toggleClickMenuButton = document.getElementById('websim-toggle-click-menu');
    const popup = document.getElementById('websim-popup');
    const popupInput = document.getElementById('websim-popup-input');
    const popupSubmit = document.getElementById('websim-popup-submit');
    const popupClose = document.getElementById('websim-popup-close');
    const overlay = document.querySelector('.websim-overlay');
    const content = document.getElementById('content');

    menuToggle.addEventListener('click', function() {
        transformMenu.classList.toggle('open');
    });

    resetButton.addEventListener('click', function() {
        content.innerHTML = originalContent;
        state = JSON.parse(JSON.stringify(originalState));
        updateStyles();
        saveState();
    });

    toggleClickMenuButton.addEventListener('click', function() {
        clickMenuEnabled = !clickMenuEnabled;
        this.textContent = clickMenuEnabled ? 'Disable Click Menu' : 'Enable Click Menu';
    });

    sendButton.addEventListener('click', function() {
        const userRequest = textInput.value;
        if (userRequest.trim() === '') return;
        sendRequest(userRequest);
    });

    document.addEventListener('click', function(e) {
        if (!clickMenuEnabled || isProcessing || e.target.id === 'websim-menu-toggle' || e.target.id === 'websim-reset-button' || transformMenu.contains(e.target) || popup.contains(e.target)) {
            return;
        }

        currentElement = e.target;
        clickCoords = { x: e.clientX, y: e.clientY };
        popup.style.left = `${e.clientX}px`;
        popup.style.top = `${e.clientY}px`;
        popup.style.display = 'block';
        popupInput.focus();
    });

    popupSubmit.addEventListener('click', function() {
        const userRequest = popupInput.value;
        if (userRequest.trim() === '') return;
        sendRequest(userRequest, currentElement);
    });

    popupClose.addEventListener('click', function() {
        popup.style.display = 'none';
    });
}
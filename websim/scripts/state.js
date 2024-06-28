let state = {
    theme: 'light',
    bgColor: '#f0f0f0',
    textColor: '#333333',
    accentColor: '#4CAF50',
    fontSize: '16',
    fontFamily: 'Arial, sans-serif'
};

const originalState = JSON.parse(JSON.stringify(state));

function updateStyles() {
    document.documentElement.style.setProperty('--bg-color', state.bgColor);
    document.documentElement.style.setProperty('--text-color', state.textColor);
    document.documentElement.style.setProperty('--accent-color', state.accentColor);
    document.documentElement.style.setProperty('--font-size', `${state.fontSize}px`);
    document.documentElement.style.setProperty('--font-family', state.fontFamily);

    if (state.theme === 'dark') {
        document.body.style.backgroundColor = '#333333';
        document.body.style.color = '#ffffff';
    } else if (state.theme === 'neon') {
        document.body.style.backgroundColor = '#000000';
        document.body.style.color = state.accentColor;
        document.body.style.textShadow = `0 0 5px ${state.accentColor}, 0 0 10px ${state.accentColor}`;
    } else {
        document.body.style.backgroundColor = state.bgColor;
        document.body.style.color = state.textColor;
        document.body.style.textShadow = 'none';
    }
}

function saveState() {
    localStorage.setItem('websiteTransformerState', JSON.stringify(state));
}

function loadState() {
    const savedState = localStorage.getItem('websiteTransformerState');
    if (savedState) {
        state = JSON.parse(savedState);
        updateStyles();
    }
}

function initializeState() {
    loadState();
}
function initializeAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function createOscillator(frequency, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    return oscillator;
}

function playSound(oscillator, duration = 0.1) {
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

function playEatingSound() {
    const oscillator = createOscillator(220, 'square');
    playSound(oscillator, 0.05);
}

function playDeathSound() {
    const oscillator = createOscillator(150, 'sawtooth');
    playSound(oscillator, 0.5);
}

function playStartSound() {
    const oscillator = createOscillator(440, 'sine');
    playSound(oscillator, 0.2);
    
    setTimeout(() => {
        const oscillator2 = createOscillator(880, 'sine');
        playSound(oscillator2, 0.2);
    }, 200);
}
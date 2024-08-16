function generateRetroCoinSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(987.77, audioContext.currentTime); // B5
    oscillator.frequency.setValueAtTime(1318.51, audioContext.currentTime + 0.1); // E6

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return {
        play: function() {
            const newOscillator = audioContext.createOscillator();
            const newGainNode = audioContext.createGain();

            newOscillator.type = 'square';
            newOscillator.frequency.setValueAtTime(987.77, audioContext.currentTime);
            newOscillator.frequency.setValueAtTime(1318.51, audioContext.currentTime + 0.1);

            newGainNode.gain.setValueAtTime(0, audioContext.currentTime);
            newGainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
            newGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

            newOscillator.connect(newGainNode);
            newGainNode.connect(audioContext.destination);

            newOscillator.start(audioContext.currentTime);
            newOscillator.stop(audioContext.currentTime + 0.2);
        }
    };
}

function playMiningSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(130.81, audioContext.currentTime); // C3
    oscillator.frequency.setValueAtTime(98.00, audioContext.currentTime + 0.1); // G2

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

window.generateRetroCoinSound = generateRetroCoinSound;
window.playMiningSound = playMiningSound;
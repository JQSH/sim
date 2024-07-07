class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
    }

    loadSound(name, url) {
        const audio = new Audio(url);
        this.sounds[name] = audio;
    }

    playSound(name) {
        if (this.sounds[name]) {
            this.sounds[name].currentTime = 0;
            this.sounds[name].play();
        }
    }

    loadMusic(url) {
        this.music = new Audio(url);
        this.music.loop = true;
    }

    playMusic() {
        if (this.music) {
            this.music.play();
        }
    }

    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }
}
// main.js

const gun = Gun(['https://multiplayer-ptsb.onrender.com/gun']);
const gameData = gun.get('mining-game-v1');

window.game = {
    scene: null,
    camera: null,
    renderer: null,
    mine: null,
    character: null,
    controls: null,
    raycaster: null,
    mouse: null,
    interactions: null,
    pickaxe: null,
    isPickaxeAnimating: false,
    collisionObjects: [],
    diamondRocks: [],
    gravity: -9.8,
    velocity: new THREE.Vector3(),
    onGround: false,
    debugMode: false,
    diamondCount: 0,
    sparkParticles: [],
    clock: new THREE.Clock(),
    collectSound: null,
    playerId: 'player-' + Math.random().toString(36).substr(2, 9),
    players: {},
    gun: gun,
    gameData: gameData
};

function initGame() {
    console.log("Initializing game...");

    game.collisionObjects = [];
    game.diamondRocks = [];

    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x87CEEB);

    game.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    game.camera.position.set(0, 10, 10);

    game.renderer = new THREE.WebGLRenderer({ antialias: true });
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(game.renderer.domElement);

    console.log("Creating mine...");
    game.mine = createMine();
    game.scene.add(game.mine);

    console.log("Creating character...");
    game.character = createCharacter();
    game.scene.add(game.character);

    console.log("Creating pickaxe...");
    game.pickaxe = createPickaxe();
    game.character.add(game.pickaxe);

    game.pickaxe.position.set(1.60, 0.80, -0.60);
    game.pickaxe.rotation.set(-10.69, 0.00, 0.11);
    game.pickaxe.scale.set(1.5, 1.5, 1.5);

    console.log("Pickaxe created and added to character:", game.pickaxe instanceof THREE.Group);

    console.log("Initializing controls...");
    game.controls = initControls(game);

    const ambientLight = new THREE.AmbientLight(0x404040);
    game.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    game.scene.add(directionalLight);

    game.raycaster = new THREE.Raycaster();
    game.mouse = new THREE.Vector2();

    console.log("Initializing interactions...");
    game.interactions = initInteractions(game);

    console.log("Generating retro coin sound...");
    game.collectSound = generateRetroCoinSound();

    console.log("Initializing multiplayer...");
    listenToPlayerUpdates();
    updateDiamondCounter();

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('click', onClickMine, false);
    document.addEventListener('keydown', onKeyDown);

    console.log("Starting animation loop...");
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = game.clock.getDelta();

    if (game.controls) {
        game.controls.update();
    }

    if (game.interactions) {
        game.interactions.update();
    }

    if (!game.onGround) {
        game.velocity.y += game.gravity * deltaTime;
    }

    game.character.position.y += game.velocity.y * deltaTime;

    if (game.character.position.y < 2) {
        game.character.position.y = 2;
        game.velocity.y = 0;
        game.onGround = true;
    } else {
        game.onGround = false;
    }

    checkCollisions();

    if (game.debugMode && Math.random() < 0.01) {
        debugLog(`Character position: ${game.character.position.toArray().map(v => v.toFixed(2))}`);
        checkProximityToDiamondRocks();
    }

    updateSparkParticles(deltaTime);
    updatePlayerPosition();
    removeInactivePlayers();

    game.renderer.render(game.scene, game.camera);
}

function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    if (event.key === 'd' || event.key === 'D') {
        game.debugMode = !game.debugMode;
        console.log(`Debug mode ${game.debugMode ? 'enabled' : 'disabled'}`);
    }
    if (event.key === 'p' || event.key === 'P') {
        console.log("Forced proximity check:");
        const nearbyRock = checkProximityToDiamondRocks();
        if (nearbyRock) {
            console.log("Nearby rock detected:", nearbyRock);
        } else {
            console.log("No nearby rocks detected");
        }
    }
}

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

function updatePlayerPosition() {
    game.gameData.get('players').get(game.playerId).put({
        x: game.character.position.x,
        y: game.character.position.y,
        z: game.character.position.z,
        timestamp: Date.now()
    });
}

function listenToPlayerUpdates() {
    game.gameData.get('players').map().on((data, playerId) => {
        if (playerId !== game.playerId && data) {
            if (!game.players[playerId]) {
                // Create a new character for the player
                game.players[playerId] = createCharacter();
                game.scene.add(game.players[playerId]);
            }
            // Update the player's position
            game.players[playerId].position.set(data.x, data.y, data.z);
            game.players[playerId].lastUpdate = Date.now();
        }
    });
}

function removeInactivePlayers() {
    const now = Date.now();
    Object.keys(game.players).forEach(playerId => {
        if (now - game.players[playerId].lastUpdate > 5000) {
            game.scene.remove(game.players[playerId]);
            delete game.players[playerId];
        }
    });
}

function updateDiamondCounter() {
    game.gameData.get('diamondCount').on((count) => {
        game.diamondCount = count || 0;
        const counterElement = document.getElementById('diamondCounter');
        counterElement.textContent = `x ${game.diamondCount}`;
        
        // Add a little animation effect
        counterElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            counterElement.style.transform = 'scale(1)';
        }, 200);
    });
}

window.addEventListener('load', initGame);
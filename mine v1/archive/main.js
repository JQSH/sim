// main.js

const gun = Gun(['https://multiplayer-ptsb.onrender.com/gun']);
const gameData = gun.get('mining-game-v2');

const SESSION_ID_KEY = 'miningGameSessionId';
const POSITION_UPDATE_INTERVAL = 10; // ms
const UPDATE_THRESHOLD = 0.1; // Minimum distance moved before sending an update

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
    sessionId: null,
    players: {},
    gun: gun,
    gameData: gameData,
    heartbeatInterval: null,
    inputState: {
        w: false,
        a: false,
        s: false,
        d: false
    },
    inputDurations: {
        w: 0,
        a: 0,
        s: 0,
        d: 0
    },
    lastPosition: new THREE.Vector3(),
    lastUpdateTime: 0
};

let localDiamondCount = 0;

function initGame() {
    console.log("Initializing game...");

    initSession();
    startHeartbeat();

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

    setInterval(cleanupDisconnectedPlayers, 5000);
}

function initSession() {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
        sessionId = 'session-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    game.sessionId = sessionId;
}

function startHeartbeat() {
    game.heartbeatInterval = setInterval(() => {
        game.gameData.get('players').get(game.sessionId).put({
            lastActive: Date.now()
        });
    }, 5000);
}

function cleanupDisconnectedPlayers() {
    const now = Date.now();
    for (let sessionId in game.players) {
        if (now - game.players[sessionId].lastUpdate > 15000) {
            console.log(`Removing disconnected player: ${sessionId}`);
            game.scene.remove(game.players[sessionId]);
            delete game.players[sessionId];
        }
    }
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

    updateInputDurations(deltaTime);
    updatePlayerPosition();
    updateRemotePlayers(deltaTime);

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

    game.renderer.render(game.scene, game.camera);
}

function calculateMovement(inputDurations, yaw) {
    const moveSpeed = 0.5;
    const movement = new THREE.Vector3();

    if (inputDurations.w > 0) movement.z -= inputDurations.w * moveSpeed;
    if (inputDurations.s > 0) movement.z += inputDurations.s * moveSpeed;
    if (inputDurations.a > 0) movement.x -= inputDurations.a * moveSpeed;
    if (inputDurations.d > 0) movement.x += inputDurations.d * moveSpeed;

    movement.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

    return movement;
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

function updateInputDurations(deltaTime) {
    for (let key in game.inputState) {
        if (game.inputState[key]) {
            game.inputDurations[key] += deltaTime;
        } else {
            game.inputDurations[key] = 0;
        }
    }
}

function updatePlayerPosition() {
    const now = Date.now();
    const currentPosition = game.character.position;
    
    if (now - game.lastUpdateTime > POSITION_UPDATE_INTERVAL && 
        currentPosition.distanceTo(game.lastPosition) > UPDATE_THRESHOLD) {
        
        const playerData = {
            x: currentPosition.x,
            y: currentPosition.y,
            z: currentPosition.z,
            vx: game.velocity.x,
            vy: game.velocity.y,
            vz: game.velocity.z,
            inputDurations: { ...game.inputDurations },
            lastActive: now
        };

        game.gameData.get('players').get(game.sessionId).put(playerData);
        game.lastPosition.copy(currentPosition);
        game.lastUpdateTime = now;

        // Reset input durations after sending
        for (let key in game.inputDurations) {
            game.inputDurations[key] = 0;
        }
    }
}

function updateRemotePlayers(deltaTime) {
    for (let sessionId in game.players) {
        const player = game.players[sessionId];
        if (player.targetPosition) {
            smoothPlayerMovement(player, player.targetPosition, deltaTime);
        }
        applyDeadReckoning(player, deltaTime);
        updatePlayerAnimation(player);
        
        // Visually represent animation state (example)
        if (player.animationState === 'idle') {
            player.scale.set(1, 1, 1);
        } else if (player.animationState === 'walk') {
            player.scale.set(1.1, 1.1, 1.1);
        } else if (player.animationState === 'run') {
            player.scale.set(1.2, 1.2, 1.2);
        }
    }
}

function smoothPlayerMovement(player, targetPosition, deltaTime) {
    const interpolationFactor = 5; // Adjust this value for smoother or more responsive movement
    player.position.lerp(targetPosition, interpolationFactor * deltaTime);
}

function applyDeadReckoning(player, deltaTime) {
    if (player.velocity) {
        const predictedPosition = player.position.clone().add(player.velocity.clone().multiplyScalar(deltaTime));
        player.position.lerp(predictedPosition, 0.5);
    }
}

function updatePlayerAnimation(player) {
    const speed = player.velocity ? player.velocity.length() : 0;
    let newState;
    if (speed < 0.1) {
        newState = 'idle';
    } else if (speed < 0.5) {
        newState = 'walk';
    } else {
        newState = 'run';
    }
    
    if (player.playAnimation && typeof player.playAnimation === 'function') {
        player.playAnimation(newState);
    } else {
        // If playAnimation doesn't exist, just update a property
        player.animationState = newState;
    }
}

function listenToPlayerUpdates() {
    game.gameData.get('players').map().on((data, sessionId) => {
        if (sessionId !== game.sessionId && data) {
            if (data === null) {
                if (game.players[sessionId]) {
                    game.scene.remove(game.players[sessionId]);
                    delete game.players[sessionId];
                }
            } else if (data.lastActive && Date.now() - data.lastActive <= 20000) {
                if (!game.players[sessionId]) {
                    game.players[sessionId] = createCharacter();
                    game.scene.add(game.players[sessionId]);
                }
                
                const player = game.players[sessionId];
                player.targetPosition = new THREE.Vector3(data.x, data.y, data.z);
                player.velocity = new THREE.Vector3(data.vx, data.vy, data.vz);
                player.lastUpdate = Date.now();

                // Apply movement based on input durations
                if (data.inputDurations) {
                    const movement = calculateMovement(data.inputDurations, player.rotation.y);
                    player.position.add(movement);
                }

                // Keep player within bounds
                player.position.x = Math.max(-45, Math.min(45, player.position.x));
                player.position.z = Math.max(-45, Math.min(45, player.position.z));
            }
        }
    });
}

function updateDiamondCount(increment = 1) {
    localDiamondCount += increment;
    updateLocalDiamondCounter();
}

function updateLocalDiamondCounter() {
    const counterElement = document.getElementById('diamondCounter');
    counterElement.textContent = `x ${localDiamondCount}`;
    
    counterElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        counterElement.style.transform = 'scale(1)';
    }, 200);
}

window.addEventListener('load', initGame);

window.addEventListener('beforeunload', () => {
    clearInterval(game.heartbeatInterval);
    game.gameData.get('sessions').get(game.sessionId).put(null);
    game.gameData.get('players').get(game.sessionId).put(null);

    // Force GUN to sync before closing
    gun.get('mining-game-v2').get('sessions').get(game.sessionId).off();
    gun.get('mining-game-v2').get('players').get(game.sessionId).off();
});
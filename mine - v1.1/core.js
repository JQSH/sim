var game = {
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
    gun: null,
    gameData: null,
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

    // Initialize lastCharacterPosition
    game.lastCharacterPosition = game.character.position.clone();

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
    initMultiplayer();

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('click', game.interactions.onClickMine.bind(game.interactions), false);
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

    // Ensure character and lastCharacterPosition exist before comparing
    if (game.character && game.lastCharacterPosition) {
        const characterMoved = game.character.position.distanceToSquared(game.lastCharacterPosition) > 0.0001;

        if (characterMoved) {
            // Update character's bounding box only when it moves
            if (!game.character.boundingBox) {
                game.character.boundingBox = new THREE.Box3();
            }
            game.character.boundingBox.setFromObject(game.character);
            game.lastCharacterPosition.copy(game.character.position);
        }
    }

    checkCollisions();

    if (game.debugMode && Math.random() < 0.01) {
        debugLog(`Character position: ${game.character.position.toArray().map(v => v.toFixed(2))}`);
        checkProximityToDiamondRocks();
    }

    window.updateSparkParticles(deltaTime, game);

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

window.game = game;
window.initGame = initGame;
window.animate = animate;
window.onWindowResize = onWindowResize;
window.onKeyDown = onKeyDown;
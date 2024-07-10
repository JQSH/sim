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
    debugMode: false
};

function initGame() {
    console.log("Initializing game...");

    game.collisionObjects = [];
    game.diamondRocks = [];

    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x87CEEB);

    game.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    game.camera.position.set(0, 10, 10);

    game.renderer = new THREE.WebGLRenderer();
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

    window.addEventListener('resize', onWindowResize);
    document.addEventListener('click', onClickMine, false);
    document.addEventListener('keydown', onKeyDown);

    console.log("Starting animation loop...");
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = 1 / 60;

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

    game.renderer.render(game.scene, game.camera);
}

function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}
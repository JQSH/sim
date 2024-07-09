const game = {
    scene: null,
    camera: null,
    renderer: null,
    mine: null,
    character: null,
    controls: null,
};

function initGame() {
    console.log("Initializing game...");

    // Scene setup
    game.scene = new THREE.Scene();
    game.scene.background = new THREE.Color(0x87CEEB);

    // Camera setup
    game.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    game.camera.position.set(0, 10, 10);

    // Renderer setup
    game.renderer = new THREE.WebGLRenderer();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(game.renderer.domElement);

    // Create and add mine to the scene
    console.log("Creating mine...");
    game.mine = createMine();
    game.scene.add(game.mine);

    // Create and add character to the scene
    console.log("Creating character...");
    game.character = createCharacter();
    game.scene.add(game.character);

    // Initialize controls
    console.log("Initializing controls...");
    game.controls = initControls(game);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040);
    game.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    game.scene.add(directionalLight);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    console.log("Starting animation loop...");
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    if (game.controls) {
        game.controls.update();
    }

    game.renderer.render(game.scene, game.camera);
}

function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize the game when the window loads
window.addEventListener('load', initGame);
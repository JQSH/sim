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

    // Set initial camera look at
    game.camera.lookAt(game.character.position);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Add a simple cube to the scene (for testing purposes)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 0, -5);  // Position the cube in front of the starting position
    game.scene.add(cube);

    console.log("Starting animation loop...");
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    if (game.controls) {
        game.controls.update();
    }

    // Update character position based on controls
    // (This is handled in the controls.update() function)

    // Update camera position
    const cameraOffset = new THREE.Vector3(0, 5, 10);  // Adjust these values to change camera position relative to character
    cameraOffset.applyQuaternion(game.character.quaternion);
    game.camera.position.copy(game.character.position).add(cameraOffset);
    game.camera.lookAt(game.character.position);

    game.renderer.render(game.scene, game.camera);
}

function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize the game when the window loads
window.addEventListener('load', initGame);

// Add some keyboard controls for testing
document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            game.character.position.z -= 1;
            break;
        case 'ArrowDown':
            game.character.position.z += 1;
            break;
        case 'ArrowLeft':
            game.character.position.x -= 1;
            break;
        case 'ArrowRight':
            game.character.position.x += 1;
            break;
    }
});
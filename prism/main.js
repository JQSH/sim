let scene, camera, renderer, composer, bloomPass;
let gameMechanics;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(
        CONFIG.GAME_WIDTH / -2,
        CONFIG.GAME_WIDTH / 2,
        CONFIG.GAME_HEIGHT / 2,
        CONFIG.GAME_HEIGHT / -2,
        0.1,
        1000
    );
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(DEFAULT_PIXEL_RATIO);
    document.body.appendChild(renderer.domElement);

    const renderScene = new THREE.RenderPass(scene, camera);
    bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        DEFAULT_BLOOM_INTENSITY,
        0.1,
        0.1
    );

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    gameMechanics = new GameMechanics(scene, camera, renderer, composer);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumHeight = CONFIG.GAME_HEIGHT;
    const frustumWidth = frustumHeight * aspect;
    
    camera.left = frustumWidth / -2;
    camera.right = frustumWidth / 2;
    camera.top = frustumHeight / 2;
    camera.bottom = frustumHeight / -2;
    
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);

    scene.traverse((object) => {
        if (object.material && object.material.isLineMaterial) {
            object.material.resolution.set(window.innerWidth, window.innerHeight);
        }
    });
}

function animate(time) {
    requestAnimationFrame(animate);
    gameMechanics.update(time);
    gameMechanics.render();
    composer.render();
}

function restartGame() {
    if (gameMechanics) {
        gameMechanics.resetGame();
    }
}

init();
animate(0);
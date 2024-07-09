let scene, camera, renderer;
let gameMechanics;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(
        -10, 10, 7.5, -7.5, 0.1, 1000
    );
    camera.position.z = 10;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    gameMechanics = new GameMechanics(scene, camera, renderer);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumHeight = 15;
    const frustumWidth = frustumHeight * aspect;
    camera.left = frustumWidth / -2;
    camera.right = frustumWidth / 2;
    camera.top = frustumHeight / 2;
    camera.bottom = frustumHeight / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
    requestAnimationFrame(animate);
    gameMechanics.update(time);
    gameMechanics.render();
}

function restartGame() {
    if (gameMechanics) {
        gameMechanics.resetGame();
    }
}

init();
animate(0);
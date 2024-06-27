function initializeThreeJS() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.getElementById('gameContainer').appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    camera.position.set(0, 8, 5);
    camera.lookAt(0, 0, 0);
}

function createWall(x, z) {
    const wallGeometry = new THREE.BoxGeometry(1, 0.67, 1);
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, 0.335, z);
    scene.add(wall);
    return wall;
}

function generateMaze() {
    walls.forEach(wall => scene.remove(wall));
    walls = [];

    for (let i = 0; i < mazeLayout.length; i++) {
        for (let j = 0; j < mazeLayout[i].length; j++) {
            if (mazeLayout[i][j] === 1) {
                walls.push(createWall(j - 9, i - 10));
            }
        }
    }
}

function createPellet(x, z) {
    const pelletGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const pelletMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
    const pellet = new THREE.Mesh(pelletGeometry, pelletMaterial);
    pellet.position.set(x, 0.05, z);
    scene.add(pellet);
    return pellet;
}

function initializePellets() {
    pellets.forEach(pellet => scene.remove(pellet));
    pellets = [];
    for (let i = 0; i < mazeLayout.length; i++) {
        for (let j = 0; j < mazeLayout[i].length; j++) {
            if (mazeLayout[i][j] === 0) {
                pellets.push(createPellet(j - 9, i - 10));
            }
        }
    }
}

function initializePlayer() {
    if (player) scene.remove(player);
    
    const playerGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const playerMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    player = new THREE.Mesh(playerGeometry, playerMaterial);

    const centerX = Math.floor(mazeLayout[0].length / 2);
    const centerZ = Math.floor(mazeLayout.length / 2);
    let playerSpawnPoint = { x: 0, z: 0 };

    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            if (mazeLayout[centerZ + i] && mazeLayout[centerZ + i][centerX + j] === 0) {
                playerSpawnPoint = { x: centerX + j - 9, z: centerZ + i - 10 };
                break;
            }
        }
        if (playerSpawnPoint.x !== 0 || playerSpawnPoint.z !== 0) break;
    }

    player.position.set(playerSpawnPoint.x, 0.4, playerSpawnPoint.z);
    scene.add(player);
}

function getMazeCell(x, z) {
    const i = Math.round(z + 10);
    const j = Math.round(x + 9);
    if (i >= 0 && i < mazeLayout.length && j >= 0 && j < mazeLayout[0].length) {
        return mazeLayout[i][j];
    }
    return 1; // Treat out-of-bounds as walls
}

function alignToGrid(pos) {
    return Math.round(pos);
}

// Animation parameters
const params = {
    waviness: 0.046,
    waveLength: 6.3,
    speed: 3.9,
    verticalStretch: 1,
    horizontalStretch: 1,
    waveStartY: -0.44,
    fillHeight: 0.16
};
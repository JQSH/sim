function createMine() {
    const rockMaterials = [
        new THREE.MeshPhongMaterial({ color: 0x808080 }),
        new THREE.MeshPhongMaterial({ color: 0xA0A0A0 }),
        new THREE.MeshPhongMaterial({ color: 0x606060 }),
        new THREE.MeshPhongMaterial({ color: 0x909090 }),
        new THREE.MeshPhongMaterial({ color: 0x707070 }),
    ];

    const mine = new THREE.Group();

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x3a3a3a });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    mine.add(floor);

    // Cartoon rock walls
    const wallHeight = 20;
    const blockSize = 5;

    for (let x = -50; x <= 50; x += blockSize) {
        for (let y = 0; y < wallHeight; y += blockSize) {
            createRockBlock(mine, x, y, -50, blockSize, rockMaterials);
            createRockBlock(mine, x, y, 50, blockSize, rockMaterials);
            createRockBlock(mine, -50, y, x, blockSize, rockMaterials);
            if (Math.abs(x) > 20) {
                createRockBlock(mine, 50, y, x, blockSize, rockMaterials);
            }
        }
    }

    return mine;
}

function createRockBlock(parent, x, y, z, size, materials) {
    const jitter = size * 0.2;
    const rockGeometry = new THREE.BoxGeometry(size, size, size);
    const rockMaterial = materials[Math.floor(Math.random() * materials.length)];
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.set(
        x + (Math.random() - 0.5) * jitter,
        y + (Math.random() - 0.5) * jitter,
        z + (Math.random() - 0.5) * jitter
    );
    parent.add(rock);
}
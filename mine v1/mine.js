function createMine() {
    const rockMaterials = [
        new THREE.MeshPhongMaterial({ color: 0x808080 }),
        new THREE.MeshPhongMaterial({ color: 0xA0A0A0 }),
        new THREE.MeshPhongMaterial({ color: 0x606060 }),
        new THREE.MeshPhongMaterial({ color: 0x909090 }),
        new THREE.MeshPhongMaterial({ color: 0x707070 }),
    ];

    const mine = new THREE.Group();

    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x3a3a3a });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    mine.add(floor);

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

    const wallPositions = [
        { x: -50, z: 0, rotation: Math.PI / 2 },
        { x: 50, z: 0, rotation: -Math.PI / 2 },
        { x: 0, z: -50, rotation: 0 },
        { x: 0, z: 50, rotation: Math.PI },
    ];

    const numDiamondRocks = 3 + Math.floor(Math.random() * 2);
    console.log(`Attempting to create ${numDiamondRocks} diamond rocks`);

    for (let i = 0; i < numDiamondRocks; i++) {
        const wallIndex = Math.floor(Math.random() * wallPositions.length);
        const wall = wallPositions[wallIndex];
        const y = Math.random() * 15;
        let offset = (Math.random() - 0.5) * 80;

        if (wall.x === 50) {
            offset = Math.max(20, Math.abs(offset)) * Math.sign(offset);
        }

        if (wall.x !== 0) {
            createSingleRockWithDiamond(mine, wall.x, y, offset, blockSize, rockMaterials, wall.rotation);
        } else {
            createSingleRockWithDiamond(mine, offset, y, wall.z, blockSize, rockMaterials, wall.rotation);
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

function createSingleRockWithDiamond(parent, x, y, z, size, materials, rotation) {
    const rockGroup = new THREE.Group();
    
    const rockGeometry = new THREE.BoxGeometry(size * 1.5, size * 1.5, size);
    const rockMaterial = materials[Math.floor(Math.random() * materials.length)];
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rockGroup.add(rock);

    const diamondGeometry = new THREE.OctahedronGeometry(size * 0.2);
    const diamondMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
        shininess: 100
    });
    const diamond = new THREE.Mesh(diamondGeometry, diamondMaterial);
    diamond.position.set(0, 0, size * 0.6);
    rockGroup.add(diamond);

    const stickOutDistance = size * 0.5;
    if (rotation === 0) {
        rockGroup.position.set(x, y, z + stickOutDistance);
    } else if (rotation === Math.PI) {
        rockGroup.position.set(x, y, z - stickOutDistance);
    } else if (rotation === Math.PI / 2) {
        rockGroup.position.set(x + stickOutDistance, y, z);
    } else if (rotation === -Math.PI / 2) {
        rockGroup.position.set(x - stickOutDistance, y, z);
    }
    rockGroup.rotation.y = rotation;
    parent.add(rockGroup);

    if (!game.diamondRocks) game.diamondRocks = [];
    game.diamondRocks.push(rockGroup);
    console.log(`Diamond rock created at position: ${rockGroup.position.toArray().map(v => typeof v === 'number' ? v.toFixed(2) : v)}, Total: ${game.diamondRocks.length}`);

    const collisionGeometry = new THREE.BoxGeometry(size * 1.5, size * 1.5, size);
    const collisionMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
    collisionMesh.position.copy(rockGroup.position);
    collisionMesh.rotation.copy(rockGroup.rotation);
    collisionMesh.userData.associatedRock = rockGroup;
    parent.add(collisionMesh);

    if (!game.collisionObjects) game.collisionObjects = [];
    game.collisionObjects.push(collisionMesh);

    console.log(`Created collision object:`, {
        type: collisionMesh.type,
        position: collisionMesh.position.toArray().map(v => typeof v === 'number' ? v.toFixed(2) : v),
        rotation: collisionMesh.rotation.toArray().map(v => typeof v === 'number' ? v.toFixed(2) : v),
        scale: collisionMesh.scale.toArray().map(v => typeof v === 'number' ? v.toFixed(2) : v),
        geometry: {
            type: collisionMesh.geometry.type,
            parameters: collisionMesh.geometry.parameters
        },
        material: {
            type: collisionMaterial.type,
            visible: collisionMaterial.visible
        }
    });
}
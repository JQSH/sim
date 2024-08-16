// mine.js

function createMine() {
    const rockMaterials = [
        new THREE.MeshPhongMaterial({ color: 0x808080 }),
        new THREE.MeshPhongMaterial({ color: 0xA0A0A0 }),
        new THREE.MeshPhongMaterial({ color: 0x606060 }),
        new THREE.MeshPhongMaterial({ color: 0x909090 }),
        new THREE.MeshPhongMaterial({ color: 0x707070 }),
    ];

    const mine = new THREE.Group();

    const wallHeight = 30;
    const blockSize = 5;

    // Extended floor
    const floorGeometry = new THREE.PlaneGeometry(200, 300);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x3a3a3a });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -blockSize / 2, -25);
    mine.add(floor);

    // Define the dimensions of the mineable diamond blocks area
    const diamondAreaWidth = 90;  // Total width (centered on x-axis)
    const diamondAreaLength = 50; // Length along z-axis

    // Create extended walls
    for (let x = -50; x <= 50; x += blockSize) {
        for (let y = 0; y < wallHeight; y += blockSize) {
            for (let z = -100; z <= 50; z += blockSize) {
                if (z === 50 || x === -50 || x === 50) {
                    createRockBlock(mine, x, y, z, blockSize, rockMaterials);
                }
            }
        }
    }

    // Create mineable diamond blocks in the northern area
    createVisibleDiamondBlocks(mine, diamondAreaWidth, diamondAreaLength, wallHeight, blockSize);

    // Wall positions for diamond rock placement
    const wallPositions = [
        { x: -50, z: -25, rotation: Math.PI / 2 },
        { x: 50, z: -25, rotation: -Math.PI / 2 },
        { x: 0, z: 50, rotation: Math.PI },
    ];

    const numDiamondRocks = 2 + Math.floor(Math.random() * 2);
    console.log(`Attempting to create ${numDiamondRocks} diamond rocks`);

    for (let i = 0; i < numDiamondRocks; i++) {
        const wallIndex = Math.floor(Math.random() * wallPositions.length);
        const wall = wallPositions[wallIndex];
        const y = Math.random() * 15;
        let offset;

        if (wall.x !== 0) {
            offset = Math.random() * 65;
        } else {
            offset = (Math.random() - 0.5) * 80;
        }

        if (wall.x !== 0) {
            createSingleRockWithDiamond(mine, wall.x, y, offset, blockSize, rockMaterials, wall.rotation);
        } else {
            createSingleRockWithDiamond(mine, offset, y, wall.z, blockSize, rockMaterials, wall.rotation);
        }
    }

    console.log("Total collision objects after mine creation:", game.collisionObjects.length);
    return mine;
}

function createVisibleDiamondBlocks(mine, width, length, height, blockSize) {
    const halfWidth = width / 2;
    const blockGrid = {};

    for (let x = -halfWidth - blockSize; x <= halfWidth + blockSize; x += blockSize) {
        blockGrid[x] = {};
        for (let y = 0; y < height + blockSize; y += blockSize) {
            blockGrid[x][y] = {};
            for (let z = -100; z >= -100 - length - blockSize; z -= blockSize) {
                blockGrid[x][y][z] = {
                    created: false,
                    visible: z === -100
                };
            }
        }
    }

    function createBlock(x, y, z) {
        console.log(`Creating block at (${x}, ${y}, ${z})`);
        const diamondBlock = createDiamondBlock(x, y, z, blockSize);
        mine.add(diamondBlock);
        
        const collisionGeometry = new THREE.BoxGeometry(blockSize, blockSize, blockSize);
        const collisionMaterial = new THREE.MeshBasicMaterial({ visible: false });
        const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
        collisionMesh.position.set(x, y, z);
        collisionMesh.userData.associatedBlock = diamondBlock;
        mine.add(collisionMesh);
    
        if (!game.collisionObjects) game.collisionObjects = [];
        game.collisionObjects.push(collisionMesh);
    
        if (!game.diamondRocks) game.diamondRocks = [];
        game.diamondRocks.push(diamondBlock);
    
        blockGrid[x][y][z].created = true;
    }

    function createVisibleBlocks() {
        console.log("Creating visible blocks");
        for (let x in blockGrid) {
            for (let y in blockGrid[x]) {
                for (let z in blockGrid[x][y]) {
                    if (blockGrid[x][y][z].visible && !blockGrid[x][y][z].created) {
                        createBlock(Number(x), Number(y), Number(z));
                    }
                }
            }
        }
    }

    createVisibleBlocks(); // Create initial visible blocks
    game.blockGrid = blockGrid; // Add blockGrid to game object
    game.createVisibleBlocks = createVisibleBlocks; // Add createVisibleBlocks to game object

    game.revealDiamondBlocks = function(x, y, z) {
        console.log(`Revealing blocks around (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
        
        x = Math.round(x / blockSize) * blockSize;
        y = Math.round(y / blockSize) * blockSize;
        z = Math.round(z / blockSize) * blockSize;
    
        // Check a 3x3x3 cube around the mined block
        for (let dx = -blockSize; dx <= blockSize; dx += blockSize) {
            for (let dy = -blockSize; dy <= blockSize; dy += blockSize) {
                for (let dz = -blockSize; dz <= blockSize; dz += blockSize) {
                    const newX = x + dx;
                    const newY = y + dy;
                    const newZ = z + dz;
    
                    console.log(`Checking block at (${newX}, ${newY}, ${newZ})`);
                    
                    if (game.blockGrid[newX] && game.blockGrid[newX][newY] && game.blockGrid[newX][newY][newZ]) {
                        if (!game.blockGrid[newX][newY][newZ].visible && !game.blockGrid[newX][newY][newZ].created) {
                            console.log(`Setting block at (${newX}, ${newY}, ${newZ}) to visible`);
                            game.blockGrid[newX][newY][newZ].visible = true;
                            game.createVisibleBlocks();
                        }
                    } else {
                        console.log(`Block at (${newX}, ${newY}, ${newZ}) not found in grid`);
                    }
                }
            }
        }
    };
}

function createDiamondBlock(x, y, z, size) {
    const rockGeometry = new THREE.BoxGeometry(size, size, size);
    const rockMaterial = new THREE.MeshPhongMaterial({ color: 0x606060 });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.position.set(x, y, z);

    const diamondGeometry = new THREE.OctahedronGeometry(size * 0.2);
    const diamondMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
        shininess: 100
    });
    const diamond = new THREE.Mesh(diamondGeometry, diamondMaterial);
    diamond.position.set(0, 0, 0);
    rock.add(diamond);

    rock.userData.isDiamondBlock = true;
    rock.userData.health = 100;

    return rock;
}

function createRockBlock(parent, x, y, z, size, materials) {
    const jitter = size * 0.2;
    const rockGeometry = new THREE.BoxGeometry(size, size, size);
    const rockMaterial = materials[Math.floor(Math.random() * materials.length)];
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    
    const jitteredX = x + (Math.random() - 0.5) * jitter;
    const jitteredY = y + (Math.random() - 0.5) * jitter;
    const jitteredZ = z + (Math.random() - 0.5) * jitter;
    
    rock.position.set(jitteredX, jitteredY, jitteredZ);
    parent.add(rock);

    const collisionGeometry = new THREE.BoxGeometry(size, size, size);
    const collisionMaterial = new THREE.MeshBasicMaterial({ 
        visible: false,
        transparent: true,
        opacity: 0.5,
        color: 0xff0000
    });
    const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
    collisionMesh.position.set(jitteredX, jitteredY, jitteredZ);
    collisionMesh.userData.isCollider = true;
    
    collisionMesh.userData.cachedBoundingBox = new THREE.Box3().setFromObject(collisionMesh);
    
    parent.add(collisionMesh);

    if (!game.collisionObjects) {
        game.collisionObjects = [];
    }
    game.collisionObjects.push(collisionMesh);

    console.log(`Added collision object. Total: ${game.collisionObjects.length}`);

    return { rock, collisionMesh };
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

    rockGroup.boundingBox = new THREE.Box3().setFromObject(rockGroup);

    if (!game.diamondRocks) game.diamondRocks = [];
    game.diamondRocks.push(rockGroup);
    console.log(`Diamond rock created at position: ${rockGroup.position.toArray().map(v => typeof v === 'number' ? v.toFixed(2) : v)}, Total: ${game.diamondRocks.length}`);

    const collisionGeometry = new THREE.BoxGeometry(size * 1.5, size * 1.5, size);
    const collisionMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const collisionMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
    collisionMesh.position.copy(rockGroup.position);
    collisionMesh.rotation.copy(rockGroup.rotation);
    collisionMesh.userData.associatedRock = rockGroup;
    
    collisionMesh.userData.cachedBoundingBox = new THREE.Box3().setFromObject(collisionMesh);
    
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

    rockGroup.health = 100;

    return rockGroup;
}

window.createMine = createMine;
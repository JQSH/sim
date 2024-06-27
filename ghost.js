function createUnifiedGhost(color) {
    const ghost = new THREE.Group();
    
    const ghostGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const normals = [];
    const uvs = [];

    const radius = 0.3;
    const heightSegments = 32;
    const radialSegments = 32;

    for (let y = 0; y <= heightSegments; y++) {
        const v = y / heightSegments;
        const phi = v * Math.PI;
        
        for (let x = 0; x <= radialSegments; x++) {
            const u = x / radialSegments;
            const theta = u * Math.PI * 2;
            
            let nx, ny, nz, px, py, pz;

            if (y <= heightSegments / 2) {
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);
                
                nx = sinPhi * cosTheta;
                ny = cosPhi;
                nz = sinPhi * sinTheta;
                
                px = radius * nx;
                py = radius * ny;
                pz = radius * nz;
            } else {
                nx = Math.cos(theta);
                ny = 0;
                nz = Math.sin(theta);
                
                px = radius * nx;
                py = radius - v * radius * 2;
                pz = radius * nz;
            }
            
            vertices.push(px, py, pz);
            normals.push(nx, ny, nz);
            uvs.push(u, 1 - v);
        }
    }

    vertices.push(0, -radius, 0);
    normals.push(0, -1, 0);
    uvs.push(0.5, 0.5);

    const indices = [];
    for (let y = 0; y < heightSegments; y++) {
        for (let x = 0; x < radialSegments; x++) {
            const a = y * (radialSegments + 1) + x;
            const b = a + radialSegments + 1;
            indices.push(a, b, a + 1);
            indices.push(b, b + 1, a + 1);
        }
    }

    const bottomCenterIndex = vertices.length / 3 - 1;
    for (let x = 0; x < radialSegments; x++) {
        const a = heightSegments * (radialSegments + 1) + x;
        const b = heightSegments * (radialSegments + 1) + (x + 1) % (radialSegments + 1);
        indices.push(bottomCenterIndex, a, b);
    }

    ghostGeometry.setIndex(indices);
    ghostGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    ghostGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    ghostGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    const ghostMaterial = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 30,
        specular: 0x111111,
        side: THREE.DoubleSide
    });

    const unifiedGhost = new THREE.Mesh(ghostGeometry, ghostMaterial);
    ghost.add(unifiedGhost);

    const ghostEyeGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const ghostEyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const leftEye = new THREE.Mesh(ghostEyeGeometry, ghostEyeMaterial);
    leftEye.position.set(-0.1, 0.1, 0.25);
    ghost.add(leftEye);

    const rightEye = new THREE.Mesh(ghostEyeGeometry, ghostEyeMaterial);
    rightEye.position.set(0.1, 0.1, 0.25);
    ghost.add(rightEye);

    const ghostPupilGeometry = new THREE.SphereGeometry(0.03, 16, 16);
    const ghostPupilMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
    const leftPupil = new THREE.Mesh(ghostPupilGeometry, ghostPupilMaterial);
    leftPupil.position.set(-0.1, 0.1, 0.28);  // Moved slightly forward
    ghost.add(leftPupil);

    const rightPupil = new THREE.Mesh(ghostPupilGeometry, ghostPupilMaterial);
    rightPupil.position.set(0.1, 0.1, 0.28);  // Moved slightly forward
    ghost.add(rightPupil);

    return { ghost, unifiedGhost };
}

function initializeGhosts() {
    // Remove existing ghosts from the scene
    ghosts.forEach(({ ghost }) => scene.remove(ghost));
    
    // Clear the ghosts array
    ghosts = [];

    const ghostColors = [0xff0000, 0x00ffff, 0xff69b4, 0xffa500];
    ghostColors.forEach((color, index) => {
        const { ghost, unifiedGhost } = createUnifiedGhost(color);
        ghost.position.set(-8 + index * 2, 0.3, -9);
        ghost.direction = { x: 1, z: 0 };
        rotateGhost(ghost, ghost.direction);  // Rotate ghost to face initial direction
        scene.add(ghost);
        ghosts.push({ ghost, unifiedGhost });
    });
}

function moveGhost(ghost) {
    const alignedX = alignToGrid(ghost.position.x);
    const alignedZ = alignToGrid(ghost.position.z);

    if (Math.abs(ghost.position.x - alignedX) < 0.01 && Math.abs(ghost.position.z - alignedZ) < 0.01) {
        const possibleDirections = [
            { x: 1, z: 0 },
            { x: -1, z: 0 },
            { x: 0, z: 1 },
            { x: 0, z: -1 }
        ];

        const validDirections = possibleDirections.filter(dir => 
            !(dir.x === -ghost.direction.x && dir.z === -ghost.direction.z) &&
            getMazeCell(alignedX + dir.x, alignedZ + dir.z) === 0
        );

        if (validDirections.length > 0) {
            const newDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
            ghost.direction = newDirection;
            rotateGhost(ghost, newDirection);  // Rotate ghost when changing direction
        }

        ghost.position.x = alignedX;
        ghost.position.z = alignedZ;
    }

    ghost.position.x += ghost.direction.x * 0.02;
    ghost.position.z += ghost.direction.z * 0.02;

    if (ghost.position.x < -9) ghost.position.x = 9;
    if (ghost.position.x > 9) ghost.position.x = -9;
}

function checkCollisionWithGhosts() {
    for (const { ghost } of ghosts) {
        if (player.position.distanceTo(ghost.position) < 0.6) {
            return true;
        }
    }
    return false;
}

function rotateGhost(ghost, direction) {
    if (direction.x !== 0 || direction.z !== 0) {
        const angle = Math.atan2(direction.x, direction.z);
        ghost.rotation.y = angle;
    }
}
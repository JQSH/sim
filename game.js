function initializeGame() {
    initializeGlobals();
    initializeThreeJS();
    if (typeof initializeAudio === 'function') {
        initializeAudio();
    } else {
        console.warn('initializeAudio function not found');
    }
    generateMaze();
    initializePellets();
    initializeGhosts();
    initializePlayer();

    // Reset movement variables
    nextMoveDirection = { x: 0, z: 0 };
    moveDirection = { x: 0, z: 0 };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    restartButton.addEventListener('click', restartGame);
    startButton.addEventListener('click', startGame);

    animate();
}

function handleKeyDown(event) {
    if (isGameOver || !gameStarted) return;
    switch (event.key) {
        case 'ArrowLeft':
            nextMoveDirection = { x: -1, z: 0 };
            break;
        case 'ArrowRight':
            nextMoveDirection = { x: 1, z: 0 };
            break;
        case 'ArrowUp':
            nextMoveDirection = { x: 0, z: -1 };
            break;
        case 'ArrowDown':
            nextMoveDirection = { x: 0, z: 1 };
            break;
    }
}

function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function startGame() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    gameStarted = true;
    startButton.style.display = 'none';
    playStartSound();
}

function restartGame() {
    isGameOver = false;
    score = 0;
    level = 1;
    scoreElement.textContent = 'Score: 0';
    levelElement.textContent = 'Level: 1';
    gameOverElement.style.display = 'none';

    mazeLayout = [...defaultMazeLayout];
    generateMaze();
    initializePellets();
    initializePlayer();
    initializeGhosts();  // This will reset all ghosts

    moveDirection = { x: 0, z: 0 };
    nextMoveDirection = { x: 0, z: 0 };

    playStartSound();
}

function gameOver() {
    isGameOver = true;
    if (finalScoreElement) {
        finalScoreElement.textContent = score;
    }
    if (gameOverElement) {
        gameOverElement.style.display = 'block';
    }
    playDeathSound();
}

function startNextLevel() {
    level++;
    levelElement.textContent = `Level: ${level}`;
    
    mazeLayout = generatePacManMap(19, 21);
    generateMaze();
    initializePellets();
    initializePlayer();
    initializeGhosts();  // This will reset all ghosts

    moveDirection = { x: 0, z: 0 };
    nextMoveDirection = { x: 0, z: 0 };

    playStartSound();
}

function animate() {
    requestAnimationFrame(animate);

    if (gameStarted && !isGameOver) {
        updatePlayerPosition();
        ghosts.forEach(({ ghost }) => moveGhost(ghost));  // Make sure this line is present
        checkCollisions();
        updateCamera();
    }

    updateGhostAnimations();
    renderer.render(scene, camera);
}

function updatePlayerPosition() {
    const alignedX = alignToGrid(player.position.x);
    const alignedZ = alignToGrid(player.position.z);

    if (Math.abs(player.position.x - alignedX) < 0.01 && Math.abs(player.position.z - alignedZ) < 0.01) {
        if (getMazeCell(alignedX + nextMoveDirection.x, alignedZ + nextMoveDirection.z) === 0) {
            moveDirection = nextMoveDirection;
            player.position.x = alignedX;
            player.position.z = alignedZ;
        } else if (getMazeCell(alignedX + moveDirection.x, alignedZ + moveDirection.z) !== 0) {
            moveDirection = { x: 0, z: 0 };
        }
    }

    const newPosition = {
        x: player.position.x + moveDirection.x * moveSpeed,
        z: player.position.z + moveDirection.z * moveSpeed
    };

    if (getMazeCell(newPosition.x, newPosition.z) === 0) {
        player.position.x = newPosition.x;
        player.position.z = newPosition.z;

        if (player.position.x < -9) player.position.x = 9;
        if (player.position.x > 9) player.position.x = -9;
    }
}

function updateGhosts() {
    ghosts.forEach(({ ghost }) => moveGhost(ghost));
}

function checkCollisions() {
    for (let i = pellets.length - 1; i >= 0; i--) {
        if (player.position.distanceTo(pellets[i].position) < 0.4) {
            scene.remove(pellets[i]);
            pellets.splice(i, 1);
            score += 10;
            if (scoreElement) {
                scoreElement.textContent = `Score: ${score}`;
            }
            playEatingSound();
        }
    }

    if (checkCollisionWithGhosts()) {
        gameOver();
    }
    
    if (pellets.length === 0) {
        startNextLevel();
    }
}

function updateCamera() {
    camera.position.x = player.position.x;
    camera.position.y = 8;
    camera.position.z = player.position.z + 5;
    camera.lookAt(player.position.x, 0, player.position.z);
}

function updateGhostAnimations() {
    const time = clock.getElapsedTime();

    ghosts.forEach(({ ghost, unifiedGhost }) => {
        const positions = unifiedGhost.geometry.attributes.position;
        const count = positions.count;

        for (let i = 0; i < count; i++) {
            const y = positions.getY(i);
            if (y < -0.2) {
                const x = positions.getX(i);
                const z = positions.getZ(i);
                const theta = Math.atan2(z, x);
                const newY = Math.sin(theta * params.waveLength + time * params.speed) * params.waviness * params.verticalStretch + params.waveStartY;
                positions.setY(i, newY);
            }
        }

        positions.needsUpdate = true;
        unifiedGhost.geometry.computeVertexNormals();

        const distanceToLight = ghost.position.distanceTo(directionalLight.position);
        const lightIntensity = Math.max(0.5, 1 - distanceToLight / 10);

        unifiedGhost.material.emissive.setHex(unifiedGhost.material.color.getHex());
        unifiedGhost.material.emissiveIntensity = lightIntensity * 0.2;
    });
}

// Initialize the game when the script loads
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});
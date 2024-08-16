// multiplayer.js

function initSession() {
    let sessionId = localStorage.getItem('miningGameSessionId');
    if (!sessionId) {
        sessionId = 'session-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('miningGameSessionId', sessionId);
    }
    game.sessionId = sessionId;
}

function initBlocksData() {
    if (!game.blocksData) {
        game.blocksData = game.gameData.get('blocks');
    }
}

function startHeartbeat() {
    game.heartbeatInterval = setInterval(() => {
        game.gameData.get('players').get(game.sessionId).put({
            lastActive: Date.now()
        });
    }, 5000);
}

function cleanupDisconnectedPlayers() {
    const now = Date.now();
    for (let sessionId in game.players) {
        if (now - game.players[sessionId].lastUpdate > 15000) {
            console.log(`Removing disconnected player: ${sessionId}`);
            game.scene.remove(game.players[sessionId]);
            delete game.players[sessionId];
        }
    }
}

function updatePlayerPosition() {
    const now = Date.now();
    const currentPosition = game.character.position;
    
    if (now - game.lastUpdateTime > 50) {  // Send updates every 50ms
        const playerData = {
            x: currentPosition.x,
            y: currentPosition.y,
            z: currentPosition.z,
            rotationY: game.character.rotation.y,
            lastActive: now
        };

        game.gameData.get('players').get(game.sessionId).put(playerData);
        game.lastUpdateTime = now;
    }
}

function updateRemotePlayers(deltaTime) {
    for (let sessionId in game.players) {
        const player = game.players[sessionId];
        if (player.targetPosition && player.targetRotation !== undefined) {
            const lerpFactor = 1 - Math.pow(0.001, deltaTime);
            
            // Interpolate position
            player.position.lerp(player.targetPosition, lerpFactor);
            
            // Interpolate rotation
            player.rotation.y += shortestAngle(player.rotation.y, player.targetRotation) * lerpFactor;
            
            // Update animation based on movement
            const speed = player.position.distanceTo(player.targetPosition) / deltaTime;
            updatePlayerAnimation(player, speed);
        }
    }
}

function shortestAngle(from, to) {
    const difference = to - from;
    return ((difference + Math.PI) % (Math.PI * 2)) - Math.PI;
}


function smoothPlayerRotation(player, targetRotation, deltaTime) {
    const rotationInterpolationFactor = 5;
    player.rotation.y += (targetRotation - player.rotation.y) * rotationInterpolationFactor * deltaTime;
}

function smoothPlayerMovement(player, targetPosition, deltaTime) {
    const interpolationFactor = 5;
    player.position.lerp(targetPosition, interpolationFactor * deltaTime);
}

function applyDeadReckoning(player, deltaTime) {
    if (player.velocity) {
        const predictedPosition = player.position.clone().add(player.velocity.clone().multiplyScalar(deltaTime));
        player.position.lerp(predictedPosition, 0.5);
    }
}

function updatePlayerAnimation(player, speed) {
    let newState;
    if (speed < 0.1) {
        newState = 'idle';
    } else if (speed < 2) {
        newState = 'walk';
    } else {
        newState = 'run';
    }
    
    if (player.animationState !== newState) {
        player.animationState = newState;
        // Here you would trigger the appropriate animation
        // We're removing the scaling to keep the size consistent
    }
}

function listenToPlayerUpdates() {
    game.gameData.get('players').map().on((data, sessionId) => {
        if (sessionId !== game.sessionId && data) {
            if (data === null) {
                if (game.players[sessionId]) {
                    game.scene.remove(game.players[sessionId]);
                    delete game.players[sessionId];
                }
            } else if (data.lastActive && Date.now() - data.lastActive <= 20000) {
                if (!game.players[sessionId]) {
                    game.players[sessionId] = createCharacter();
                    
                    // Add pickaxe only to remote players
                    const pickaxe = createPickaxe();
                    pickaxe.position.set(1.60, 0.80, -0.60);
                    pickaxe.rotation.set(-10.69, 0.00, 0.11);
                    pickaxe.scale.set(1.5, 1.5, 1.5);
                    game.players[sessionId].add(pickaxe);
                    game.players[sessionId].pickaxe = pickaxe;
                    
                    game.scene.add(game.players[sessionId]);
                }
                
                const player = game.players[sessionId];
                player.targetPosition = new THREE.Vector3(data.x, data.y, data.z);
                player.targetRotation = data.rotationY;
                player.lastUpdate = Date.now();

                // Only trigger mining animation if it's not already animating
                if (data.mining && player.pickaxe && !player.pickaxe.isAnimating) {
                    animateRemotePlayerPickaxe(player);
                }
            }
        }
    });
}

function listenToBlockUpdates() {
    game.blocksData.map().on((data, key) => {
        if (data) {
            const [x, y, z] = key.split(',').map(Number);
            if (!data.exists) {
                // Remove block if it exists in the scene
                const block = game.diamondRocks.find(rock => 
                    rock && rock.position &&
                    Math.round(rock.position.x) === x &&
                    Math.round(rock.position.y) === y &&
                    Math.round(rock.position.z) === z
                );
                if (block) {
                    if (typeof window.mineDiamondRock === 'function') {
                        window.mineDiamondRock(block);
                    } else {
                        console.error('mineDiamondRock function is not available');
                    }
                }
            } else if (data.exists && game.blockGrid && game.blockGrid[x] && game.blockGrid[x][y] && game.blockGrid[x][y][z] && !game.blockGrid[x][y][z].created) {
                // Create block if it doesn't exist in the scene
                if (typeof game.createBlock === 'function') {
                    game.createBlock(x, y, z);
                } else {
                    console.error('createBlock function is not available');
                }
            }
        }
    });
}

function animateRemotePlayerPickaxe(player) {
    if (!player.pickaxe || player.pickaxe.isAnimating) return;

    player.pickaxe.isAnimating = true;

    const duration = 500;
    const startRotation = new THREE.Vector3(-10.69, 0.00, 0.11);
    const endRotation = new THREE.Vector3(-10.69 - Math.PI / 4, 0.00, 0.11);
    const startTime = Date.now();

    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const swingAngle = Math.sin(progress * Math.PI);
        player.pickaxe.rotation.x = startRotation.x + swingAngle * (endRotation.x - startRotation.x);
        player.pickaxe.rotation.y = startRotation.y + swingAngle * (endRotation.y - startRotation.y);
        player.pickaxe.rotation.z = startRotation.z + swingAngle * (endRotation.z - startRotation.z);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            player.pickaxe.rotation.set(startRotation.x, startRotation.y, startRotation.z);
            player.pickaxe.isAnimating = false;
        }
    }

    animate();
}

function initMultiplayer() {
    game.gun = Gun(['https://multiplayer-ptsb.onrender.com/gun']);
    game.gameData = game.gun.get('mining-game-v2');
    
    initSession();
    initBlocksData();  // Ensure this is called
    startHeartbeat();
    listenToPlayerUpdates();
    listenToBlockUpdates();
    
    game.lastUpdateTime = 0;
    
    setInterval(cleanupDisconnectedPlayers, 5000);
}

// Expose necessary functions to the global scope
window.initSession = initSession;
window.startHeartbeat = startHeartbeat;
window.cleanupDisconnectedPlayers = cleanupDisconnectedPlayers;
window.updatePlayerPosition = updatePlayerPosition;
window.updateRemotePlayers = updateRemotePlayers;
window.listenToPlayerUpdates = listenToPlayerUpdates;
window.initMultiplayer = initMultiplayer;
window.listenToBlockUpdates = listenToBlockUpdates;
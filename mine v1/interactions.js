// interactions.js

function initInteractions(game) {
    const interactions = {
        update: function() {
            // Update logic for interactions (if needed)
        },
        onClickMine: onClickMine
    };

    return interactions;
}

function onClickMine() {
    if (game.isPickaxeAnimating) return;

    game.isPickaxeAnimating = true;  // Set this at the beginning of the function

    const nearbyRock = checkProximityToDiamondRocks();
    if (nearbyRock) {
        console.log("Mining nearby rock:", nearbyRock);
        
        // Immediately update diamond count and play sound
        window.updateDiamondCount(1);
        if (game.collectSound) {
            game.collectSound.play();
        }

        // Immediately remove the rock and create spark effect
        mineRock(nearbyRock);
        window.createSparkEffect(nearbyRock.position, game);

        // Animate pickaxe
        animatePickaxe(() => {
            // Callback after animation is complete
            game.gameData.get('players').get(game.sessionId).put({
                mining: false
            });
            game.isPickaxeAnimating = false;  // Reset the flag after animation
        });

        // Update player data to indicate mining action
        game.gameData.get('players').get(game.sessionId).put({
            mining: true,
            miningStartTime: Date.now()
        });
    } else {
        console.log("No nearby rock to mine");
        
        // Animate pickaxe even if no rock is nearby
        animatePickaxe(() => {
            // Callback after animation is complete
            game.gameData.get('players').get(game.sessionId).put({
                mining: false
            });
            game.isPickaxeAnimating = false;  // Reset the flag after animation
        });

        // Update player data to indicate mining action (even if no rock nearby)
        game.gameData.get('players').get(game.sessionId).put({
            mining: true,
            miningStartTime: Date.now()
        });
    }
}

function mineRock(rock) {
    console.log("Mining rock:", rock);
    
    // Remove the rock group from the scene
    if (rock.parent) {
        rock.parent.remove(rock);
    }
    
    // Remove from diamondRocks array
    const index = game.diamondRocks.indexOf(rock);
    if (index > -1) {
        game.diamondRocks.splice(index, 1);
        console.log("Removed rock from diamondRocks. New length:", game.diamondRocks.length);
    }

    // Find and remove the associated collision object
    const collisionIndex = game.collisionObjects.findIndex(obj => obj.userData.associatedRock === rock);
    if (collisionIndex > -1) {
        const collisionObject = game.collisionObjects[collisionIndex];
        if (collisionObject.parent) {
            collisionObject.parent.remove(collisionObject);
        }
        game.collisionObjects.splice(collisionIndex, 1);
        console.log("Removed collision object. New length:", game.collisionObjects.length);
    } else {
        console.warn("Could not find associated collision object for rock:", rock);
    }

    // Dispose of geometries and materials
    rock.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
    });

    // Force a scene update
    game.scene.updateMatrixWorld(true);

    console.log("Rock mined and removed from scene!");
}

function animatePickaxe(callback) {
    if (game.isPickaxeAnimating) return;
    
    game.isPickaxeAnimating = true;
    
    const duration = 500; // milliseconds
    const startRotation = game.pickaxe.rotation.clone();
    const endRotation = new THREE.Euler(startRotation.x - Math.PI / 4, startRotation.y, startRotation.z);
    
    const startTime = performance.now();
    
    function animate() {
        const now = performance.now();
        const progress = Math.min((now - startTime) / duration, 1);
        
        game.pickaxe.rotation.x = startRotation.x + (endRotation.x - startRotation.x) * progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animation complete, return to starting position
            setTimeout(() => {
                game.pickaxe.rotation.copy(startRotation);
                game.isPickaxeAnimating = false;
                if (callback) callback();
            }, 100);
        }
    }
    
    animate();
}

// Expose necessary functions to the global scope
window.initInteractions = initInteractions;
window.onClickMine = onClickMine;
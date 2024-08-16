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

        // Mine the rock
        mineDiamondRock(nearbyRock);

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

function mineDiamondRock(rock) {
    console.log(`Mining rock at (${rock.position.x.toFixed(2)}, ${rock.position.y.toFixed(2)}, ${rock.position.z.toFixed(2)})`);

    // Remove the rock from diamondRocks array
    const index = game.diamondRocks.indexOf(rock);
    if (index > -1) {
        game.diamondRocks.splice(index, 1);
        console.log(`Removed rock from diamondRocks. New length: ${game.diamondRocks.length}`);
    }

    // Remove the associated collision object
    const collisionIndex = game.collisionObjects.findIndex(obj => obj.userData.associatedBlock === rock);
    if (collisionIndex > -1) {
        const collisionObject = game.collisionObjects[collisionIndex];
        game.scene.remove(collisionObject);  // Remove collision object from scene
        game.collisionObjects.splice(collisionIndex, 1);
        console.log(`Removed collision object. New length: ${game.collisionObjects.length}`);
    }

    // Remove the rock from the scene
    if (rock.parent) {
        rock.parent.remove(rock);
    }
    console.log("Rock removed from scene");

    // Dispose of geometries and materials
    rock.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
    });

    // Create spark particles
    window.createSparkEffect(rock.position, game);

    // Reveal new blocks
    console.log("Attempting to reveal new blocks...");
    if (typeof game.revealDiamondBlocks === 'function') {
        game.revealDiamondBlocks(rock.position.x, rock.position.y, rock.position.z);
    } else {
        console.error("game.revealDiamondBlocks is not a function");
    }
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
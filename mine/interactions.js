function initInteractions(game) {
    const interactions = {
        update: function() {
            // Update logic for interactions (if needed)
        }
    };

    return interactions;
}

function onClickMine() {
    const nearbyRock = checkProximityToDiamondRocks();
    if (nearbyRock) {
        console.log("Mining nearby rock:", nearbyRock);
        if (!game.isPickaxeAnimating) {
            animatePickaxe(() => {
                mineRock(nearbyRock);
            });
        } else {
            console.log("Pickaxe is already animating, but rock is nearby");
        }
    } else {
        console.log("No nearby rock to mine");
        if (!game.isPickaxeAnimating) {
            animatePickaxe();
        }
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

function onKeyDown(event) {
    if (event.key === 'd' || event.key === 'D') {
        game.debugMode = !game.debugMode;
        console.log(`Debug mode ${game.debugMode ? 'enabled' : 'disabled'}`);
    }
    if (event.key === 'p' || event.key === 'P') {
        console.log("Forced proximity check:");
        const nearbyRock = checkProximityToDiamondRocks();
        if (nearbyRock) {
            console.log("Nearby rock detected:", nearbyRock);
        } else {
            console.log("No nearby rocks detected");
        }
    }
}
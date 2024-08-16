function checkCollisions() {
    // Create a new bounding box for the character
    const characterBox = new THREE.Box3().setFromObject(game.character);

    let collisionOccurred = false;

    for (let i = 0; i < game.collisionObjects.length; i++) {
        const object = game.collisionObjects[i];
        
        if (!object || !(object instanceof THREE.Mesh) || !object.geometry) {
            console.warn(`Invalid collision object at index ${i}`);
            continue;
        }

        // Create a new bounding box for the object
        const objectBox = new THREE.Box3().setFromObject(object);

        if (characterBox.intersectsBox(objectBox)) {
            // Collision detected
            collisionOccurred = true;
            handleCollision(characterBox, objectBox);
        }
    }

    return collisionOccurred;
}

function handleCollision(characterBox, objectBox) {
    // Calculate the overlap on each axis
    const overlapX = Math.min(characterBox.max.x, objectBox.max.x) - Math.max(characterBox.min.x, objectBox.min.x);
    const overlapY = Math.min(characterBox.max.y, objectBox.max.y) - Math.max(characterBox.min.y, objectBox.min.y);
    const overlapZ = Math.min(characterBox.max.z, objectBox.max.z) - Math.max(characterBox.min.z, objectBox.min.z);

    // Determine the smallest overlap
    const minOverlap = Math.min(overlapX, overlapY, overlapZ);

    // Push the character away based on the smallest overlap
    if (minOverlap === overlapX) {
        game.character.position.x += overlapX * (characterBox.min.x < objectBox.min.x ? -1 : 1);
    } else if (minOverlap === overlapY) {
        game.character.position.y += overlapY * (characterBox.min.y < objectBox.min.y ? -1 : 1);
    } else {
        game.character.position.z += overlapZ * (characterBox.min.z < objectBox.min.z ? -1 : 1);
    }

    // Update the character's bounding box
    game.character.boundingBox.setFromObject(game.character);
}

function checkProximityToDiamondRocks() {
    const characterPosition = game.character.position;
    const maxMiningDistance = 10;

    let nearestRock = null;
    let nearestDistance = Infinity;

    for (let i = 0; i < game.diamondRocks.length; i++) {
        const rock = game.diamondRocks[i];
        const distance = characterPosition.distanceTo(rock.position);
        
        if (distance < nearestDistance) {
            nearestRock = rock;
            nearestDistance = distance;
        }
    }

    if (nearestDistance <= maxMiningDistance) {
        return nearestRock;
    } else {
        return null;
    }
}

function mineDiamondRock(rock) {
    console.log(`Attempting to mine rock at (${rock.position.x.toFixed(2)}, ${rock.position.y.toFixed(2)}, ${rock.position.z.toFixed(2)})`);
    
    const miningStrength = 1;
    rock.userData.health -= miningStrength;

    console.log(`Rock health: ${rock.userData.health}`);

    if (rock.userData.health <= 0) {
        console.log("Rock has been fully mined.");
        
        if (rock.userData.isDiamondBlock) {
            console.log("This is a diamond block.");
            
            // Remove from collision objects
            const index = game.collisionObjects.findIndex(obj => obj.userData.associatedBlock === rock);
            if (index > -1) {
                game.collisionObjects.splice(index, 1);
                console.log("Removed from collision objects.");
            } else {
                console.log("Warning: Rock not found in collision objects.");
            }

            // Remove from scene
            game.scene.remove(rock);
            console.log("Removed from scene.");

            // Create particles
            createSparkParticles(rock.position);
            console.log("Created spark particles.");

            // Update diamond count
            updateDiamondCount(1);
            console.log("Updated diamond count.");

            // Play sound
            game.collectSound.play();
            console.log("Played collect sound.");

            // Reveal new blocks
            console.log("Attempting to reveal new blocks...");
            game.revealDiamondBlocks(rock.position.x, rock.position.y, rock.position.z);

            // Remove from diamondRocks array
            const rockIndex = game.diamondRocks.indexOf(rock);
            if (rockIndex > -1) {
                game.diamondRocks.splice(rockIndex, 1);
                console.log("Removed from diamondRocks array.");
            } else {
                console.log("Warning: Rock not found in diamondRocks array.");
            }

            // Log the current state of the block grid
            console.log("Logging current block grid state:");
            game.logBlockGrid();

        } else {
            console.log("This is a regular diamond rock.");
            
            // Handle mining of original diamond rocks
            const index = game.diamondRocks.indexOf(rock);
            if (index > -1) {
                game.diamondRocks.splice(index, 1);
                console.log("Removed from diamondRocks array.");
            } else {
                console.log("Warning: Rock not found in diamondRocks array.");
            }
            
            game.scene.remove(rock);
            console.log("Removed from scene.");
            
            createSparkParticles(rock.position);
            console.log("Created spark particles.");
            
            updateDiamondCount(1);
            console.log("Updated diamond count.");
            
            game.collectSound.play();
            console.log("Played collect sound.");
        }
    } else {
        console.log("Rock not fully mined yet. Playing mining sound.");
        playMiningSound();
    }
}

window.checkCollisions = checkCollisions;
window.checkProximityToDiamondRocks = checkProximityToDiamondRocks;
//window.onClickMine = onClickMine;
window.mineDiamondRock = mineDiamondRock;
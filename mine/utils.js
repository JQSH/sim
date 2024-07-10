function debugLog(message) {
    if (game.debugMode) {
        console.log(message);
    }
}

function checkCollisions() {
    debugLog(`Checking collisions. Number of collision objects: ${game.collisionObjects.length}`);
    const characterPosition = game.character.position.clone();
    const characterRadius = 1;

    for (let i = 0; i < game.collisionObjects.length; i++) {
        const object = game.collisionObjects[i];
        
        if (!object) {
            console.warn(`Collision object at index ${i} is undefined or null`);
            continue;
        }

        if (!(object instanceof THREE.Mesh)) {
            console.warn(`Collision object at index ${i} is not a THREE.Mesh:`, object);
            continue;
        }

        if (!object.geometry) {
            console.warn(`Collision object at index ${i} has no geometry:`, object);
            continue;
        }

        if (!object.geometry.boundingSphere) {
            object.geometry.computeBoundingSphere();
        }

        const objectPosition = object.position.clone();
        const objectRadius = object.geometry.boundingSphere.radius * Math.max(object.scale.x, object.scale.y, object.scale.z);

        const distance = characterPosition.distanceTo(objectPosition);
        const minDistance = characterRadius + objectRadius;

        if (distance < minDistance) {
            const pushVector = characterPosition.sub(objectPosition).normalize().multiplyScalar(minDistance - distance);
            game.character.position.add(pushVector);
            
            if (game.controls && game.controls.target) {
                game.controls.target.add(pushVector);
            }
        }
    }
}

function checkProximityToDiamondRocks() {
    const characterPosition = game.character.position;
    const maxMiningDistance = 10;

    debugLog(`Checking proximity. Character position: ${characterPosition.toArray().map(v => v.toFixed(2))}`);

    let nearestRock = null;
    let nearestDistance = Infinity;

    for (let i = 0; i < game.diamondRocks.length; i++) {
        const rock = game.diamondRocks[i];
        const distance = characterPosition.distanceTo(rock.position);
        debugLog(`Distance to diamond rock ${i}: ${distance.toFixed(2)}, Rock position: ${rock.position.toArray().map(v => v.toFixed(2))}`);
        
        if (distance < nearestDistance) {
            nearestRock = rock;
            nearestDistance = distance;
        }
    }

    if (nearestDistance <= maxMiningDistance) {
        console.log(`Nearest diamond rock is within mining distance: ${nearestDistance.toFixed(2)}`);
        return nearestRock;
    } else {
        debugLog(`Nearest diamond rock is too far: ${nearestDistance.toFixed(2)}`);
        return null;
    }
}
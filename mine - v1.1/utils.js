function debugLog(message) {
    if (game.debugMode) {
        console.log(message);
    }
}

/*function checkProximityToDiamondRocks() {
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
}*/

// Exposing functions to the global scope
window.debugLog = debugLog;
window.checkCollisions = checkCollisions;
window.checkProximityToDiamondRocks = checkProximityToDiamondRocks;
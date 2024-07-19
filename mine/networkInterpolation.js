// networkInterpolation.js

window.NetworkInterpolator = class NetworkInterpolator {
    constructor(updateRate = 10) {
        this.players = {};
        this.updateRate = updateRate;
        this.interpolationDelay = 100; // ms
    }

    addPlayer(playerId) {
        this.players[playerId] = {
            position: new THREE.Vector3(),
            rotation: new THREE.Quaternion(),
            positionBuffer: [],
            rotationBuffer: [],
            lastUpdateTime: 0
        };
    }

    removePlayer(playerId) {
        delete this.players[playerId];
    }

    updatePlayerState(playerId, position, rotation, serverTime) {
        if (!this.players[playerId]) {
            this.addPlayer(playerId);
        }

        const player = this.players[playerId];
        player.positionBuffer.push({ position: position.clone(), timestamp: serverTime });
        player.rotationBuffer.push({ rotation: rotation.clone(), timestamp: serverTime });

        // Keep only the last second of updates
        const now = Date.now();
        player.positionBuffer = player.positionBuffer.filter(update => now - update.timestamp < 1000);
        player.rotationBuffer = player.rotationBuffer.filter(update => now - update.timestamp < 1000);

        player.lastUpdateTime = serverTime;
    }

    interpolate(renderTime) {
        Object.keys(this.players).forEach(playerId => {
            const player = this.players[playerId];
            const targetTime = renderTime - this.interpolationDelay;

            // Position interpolation
            const positionUpdates = player.positionBuffer.filter(update => update.timestamp <= targetTime);
            if (positionUpdates.length >= 2) {
                const [p1, p2] = positionUpdates.slice(-2);
                const t = (targetTime - p1.timestamp) / (p2.timestamp - p1.timestamp);
                player.position.lerpVectors(p1.position, p2.position, t);
            } else if (positionUpdates.length === 1) {
                player.position.copy(positionUpdates[0].position);
            }

            // Rotation interpolation
            const rotationUpdates = player.rotationBuffer.filter(update => update.timestamp <= targetTime);
            if (rotationUpdates.length >= 2) {
                const [r1, r2] = rotationUpdates.slice(-2);
                const t = (targetTime - r1.timestamp) / (r2.timestamp - r1.timestamp);
                player.rotation.slerpQuaternions(r1.rotation, r2.rotation, t);
            } else if (rotationUpdates.length === 1) {
                player.rotation.copy(rotationUpdates[0].rotation);
            }
        });
    }

    getPlayerState(playerId) {
        return this.players[playerId];
    }

    // Add this method for extrapolation
    extrapolate(playerId, deltaTime) {
        const player = this.players[playerId];
        if (player && player.positionBuffer.length >= 2) {
            const lastTwoUpdates = player.positionBuffer.slice(-2);
            const velocity = new THREE.Vector3().subVectors(
                lastTwoUpdates[1].position,
                lastTwoUpdates[0].position
            ).divideScalar(lastTwoUpdates[1].timestamp - lastTwoUpdates[0].timestamp);

            player.position.add(velocity.multiplyScalar(deltaTime));
        }
    }
};
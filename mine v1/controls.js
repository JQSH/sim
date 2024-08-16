let gameControls;

function initControls(game) {
    const controls = {
        moveSpeed: 0.5,
        keys: { w: false, a: false, s: false, d: false },
        yaw: 0,
        pitch: 18 * Math.PI / 180,
        minPitch: 16 * Math.PI / 180,
        defaultPitch: 18 * Math.PI / 180,
        resetDelay: 500,
        resetSpeed: 0.01,
        lastMouseMoveTime: 0,
        cameraZoom: 8,
        characterYaw: 0,
        cameraSpeed: 0.0016,
        cameraSmoothing: 0.08,
        targetYaw: 0,
        targetPitch: 18 * Math.PI / 180,
    };

    document.addEventListener('keydown', (e) => {
        if (e.key in controls.keys) {
            controls.keys[e.key] = true;
            game.inputState[e.key] = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key in controls.keys) {
            controls.keys[e.key] = false;
            game.inputState[e.key] = false;
        }
    });

    game.renderer.domElement.addEventListener('click', () => {
        game.renderer.domElement.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', lockChangeAlert, false);

    function lockChangeAlert() {
        if (document.pointerLockElement === game.renderer.domElement) {
            document.addEventListener("mousemove", updateMousePosition, false);
        } else {
            document.removeEventListener("mousemove", updateMousePosition, false);
        }
    }

    function updateMousePosition(e) {
        const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

        controls.targetYaw -= movementX * controls.cameraSpeed;
        controls.targetPitch -= movementY * controls.cameraSpeed;

        controls.targetPitch = Math.max(controls.minPitch, Math.min(Math.PI / 2, controls.targetPitch));
        
        controls.lastMouseMoveTime = Date.now();
    }

    function updateControls() {
        moveCharacter();
        updateCameraPosition();
        resetCameraTilt();
        smoothCamera();
    }

    function calculateMovement(inputState, yaw) {
        const forwardVector = new THREE.Vector3(0, 0, -1);
        const rightVector = new THREE.Vector3(1, 0, 0);
        
        forwardVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        rightVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

        const movement = new THREE.Vector3();

        if (inputState.w) movement.add(forwardVector);
        if (inputState.s) movement.sub(forwardVector);
        if (inputState.a) movement.sub(rightVector);
        if (inputState.d) movement.add(rightVector);

        if (movement.length() > 0) {
            movement.normalize().multiplyScalar(controls.moveSpeed);
        }

        return movement;
    }

    function moveCharacter() {
        const movement = calculateMovement(controls.keys, controls.yaw);

        if (movement.length() > 0) {
            game.character.position.add(movement);
            controls.characterYaw = controls.yaw;
        }

        game.character.position.x = Math.max(-45, Math.min(45, game.character.position.x));
        game.character.position.z = Math.max(-45, Math.min(45, game.character.position.z));

        game.character.rotation.y = controls.characterYaw;
    }

    function updateCameraPosition() {
        const offset = new THREE.Vector3(
            Math.sin(controls.yaw) * Math.cos(controls.pitch),
            Math.sin(controls.pitch),
            Math.cos(controls.yaw) * Math.cos(controls.pitch)
        );
        offset.multiplyScalar(controls.cameraZoom);
        game.camera.position.copy(game.character.position).add(offset);
        game.camera.lookAt(game.character.position);
    }

    function resetCameraTilt() {
        if (Date.now() - controls.lastMouseMoveTime > controls.resetDelay) {
            controls.targetPitch = controls.defaultPitch;
        }
    }

    function smoothCamera() {
        controls.yaw += (controls.targetYaw - controls.yaw) * controls.cameraSmoothing;
        controls.pitch += (controls.targetPitch - controls.pitch) * controls.cameraSmoothing;
    }

    gameControls = {
        update: updateControls,
        calculateMovement: calculateMovement
    };

    return gameControls;
}

// Expose updateInputDurations globally
function updateInputDurations(deltaTime) {
    for (let key in game.inputState) {
        if (game.inputState[key]) {
            game.inputDurations[key] += deltaTime;
        } else {
            game.inputDurations[key] = 0;
        }
    }
}

window.initControls = initControls;
window.gameControls = gameControls;
window.updateInputDurations = updateInputDurations;
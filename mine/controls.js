
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
        cameraSpeed: 0.002,
        cameraSmoothing: 0.1,
        targetYaw: 0,
        targetPitch: 18 * Math.PI / 180,
        update: updateControls
    };

    document.addEventListener('keydown', (e) => {
        if (e.key in controls.keys) controls.keys[e.key] = true;
    });

    document.addEventListener('keyup', (e) => {
        if (e.key in controls.keys) controls.keys[e.key] = false;
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

        // Limit pitch to avoid camera flipping and respect minPitch
        controls.targetPitch = Math.max(controls.minPitch, Math.min(Math.PI / 2, controls.targetPitch));
        
        controls.lastMouseMoveTime = Date.now();
    }

    function updateControls() {
        moveCharacter();
        updateCameraPosition();
        resetCameraTilt();
        smoothCamera();
    }

    function moveCharacter() {
        const forwardVector = new THREE.Vector3(0, 0, -1);
        const rightVector = new THREE.Vector3(1, 0, 0);
        
        forwardVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), controls.yaw);
        rightVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), controls.yaw);

        const movement = new THREE.Vector3();

        if (controls.keys.w) movement.add(forwardVector);
        if (controls.keys.s) movement.sub(forwardVector);
        if (controls.keys.a) movement.sub(rightVector);
        if (controls.keys.d) movement.add(rightVector);

        if (movement.length() > 0) {
            movement.normalize().multiplyScalar(controls.moveSpeed);
            game.character.position.add(movement);

            // Update character's yaw to match camera when moving
            controls.characterYaw = controls.yaw;
        }

        // Keep character within bounds
        game.character.position.x = Math.max(-45, Math.min(45, game.character.position.x));
        game.character.position.z = Math.max(-45, Math.min(45, game.character.position.z));

        // Update character rotation to face movement direction
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

    // Camera controls event listeners
    document.getElementById('cameraSpeed').addEventListener('input', function(e) {
        controls.cameraSpeed = parseFloat(e.target.value);
        document.getElementById('cameraSpeedValue').textContent = controls.cameraSpeed.toFixed(3);
    });

    document.getElementById('cameraSmoothing').addEventListener('input', function(e) {
        controls.cameraSmoothing = parseFloat(e.target.value);
        document.getElementById('cameraSmoothingValue').textContent = controls.cameraSmoothing.toFixed(2);
    });

    return controls;
}
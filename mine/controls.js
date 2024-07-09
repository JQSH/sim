function initControls(game) {
    const controls = {
        moveSpeed: 0.5,
        keys: { w: false, a: false, s: false, d: false },
        yaw: 0,
        pitch: 0,
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

        controls.yaw -= movementX * 0.002;
        controls.pitch -= movementY * 0.002;

        // Limit pitch to avoid camera flipping
        controls.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, controls.pitch));
    }

    function updateControls() {
        moveCharacter();
        updateCameraPosition();
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

        movement.normalize().multiplyScalar(controls.moveSpeed);
        game.character.position.add(movement);

        // Keep character within bounds
        game.character.position.x = Math.max(-45, Math.min(45, game.character.position.x));
        game.character.position.z = Math.max(-45, Math.min(45, game.character.position.z));

        // Update character rotation to face camera direction
        game.character.rotation.y = controls.yaw;
    }

    function updateCameraPosition() {
        const offset = new THREE.Vector3(
            Math.sin(controls.yaw) * Math.cos(controls.pitch),
            Math.sin(controls.pitch),
            Math.cos(controls.yaw) * Math.cos(controls.pitch)
        );
        offset.multiplyScalar(10); // Distance from character
        game.camera.position.copy(game.character.position).add(offset);
        game.camera.lookAt(game.character.position);
    }

    return controls;
}
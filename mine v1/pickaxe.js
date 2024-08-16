function createPickaxe() {
    const pickaxeGroup = new THREE.Group();

    const handleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
    const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.rotation.x = Math.PI / 2;
    handle.scale.set(1.3, 1, 1.3);
    pickaxeGroup.add(handle);

    const headGeometry = new THREE.ConeGeometry(0.2, 1, 8);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.rotation.z = Math.PI / 2 + 1.5;
    head.position.set(0, 0, -1);
    head.scale.set(0.7, 1, 0.7);
    pickaxeGroup.add(head);

    return pickaxeGroup;
}

function animatePickaxe(callback) {
    if (!game.pickaxe) {
        console.error("Pickaxe not found in game object");
        return;
    }

    game.isPickaxeAnimating = true;

    const duration = 500;
    const startRotation = new THREE.Vector3(-10.69, 0.00, 0.11);
    const endRotation = new THREE.Vector3(-10.69 - Math.PI / 4, 0.00, 0.11);
    const startTime = Date.now();

    function animate() {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const swingAngle = Math.sin(progress * Math.PI);
        game.pickaxe.rotation.x = startRotation.x + swingAngle * (endRotation.x - startRotation.x);
        game.pickaxe.rotation.y = startRotation.y + swingAngle * (endRotation.y - startRotation.y);
        game.pickaxe.rotation.z = startRotation.z + swingAngle * (endRotation.z - startRotation.z);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            game.pickaxe.rotation.set(startRotation.x, startRotation.y, startRotation.z);
            game.isPickaxeAnimating = false;
            if (callback) callback();
        }
    }

    animate();
}
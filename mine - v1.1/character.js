function createCharacter() {
    const characterGeometry = new THREE.BoxGeometry(2, 4, 2);
    const characterMaterial = new THREE.MeshPhongMaterial({ color: 0xFF0000 });
    const character = new THREE.Mesh(characterGeometry, characterMaterial);
    character.position.set(0, 2, 0);
    character.scale.set(1, 1, 1);

    // Create bounding box
    character.boundingBox = new THREE.Box3().setFromObject(character);

    return character;
}
class Graphics {
    static createPlayerMesh() {
        const geometry = new THREE.CircleGeometry(CONFIG.PLAYER_SIZE, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        return new THREE.Mesh(geometry, material);
    }

    static createBulletMesh() {
        const geometry = new THREE.CylinderGeometry(
            CONFIG.BULLET_THICKNESS / 2,
            CONFIG.BULLET_THICKNESS / 2,
            CONFIG.BULLET_SIZE,
            8
        );
        geometry.rotateZ(Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        return new THREE.Mesh(geometry, material);
    }

    static createEnemyMesh(type) {
        let geometry, material;
        switch (type) {
            case 'diamond':
                geometry = new THREE.CircleGeometry(CONFIG.ENEMY_SIZE, 4);
                material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
                break;
            case 'square':
                geometry = new THREE.BoxGeometry(CONFIG.ENEMY_SIZE, CONFIG.ENEMY_SIZE, CONFIG.ENEMY_SIZE);
                material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
                break;
            default:
                geometry = new THREE.CircleGeometry(CONFIG.ENEMY_SIZE, 32);
                material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        }
        return new THREE.Mesh(geometry, material);
    }
}
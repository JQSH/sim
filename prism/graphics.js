const DEFAULT_BLOOM_INTENSITY = 0.8;
const DEFAULT_LINE_THICKNESS = 0.16;
const DEFAULT_PIXEL_RATIO = 2.0;
const GLOBAL_SCALE = 0.4;

class Graphics {
    static createPlayerMesh(thickness) {
        const points = [
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(-0.5, -1, 0),
            new THREE.Vector3(0.5, -1, 0),
            new THREE.Vector3(0, 1, 0)
        ];
        const line = new MeshLine();
        line.setPoints(points);
        
        const material = new MeshLineMaterial({
            color: 0xffffff,
            lineWidth: thickness,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        });
        
        return new THREE.Mesh(line, material);
    }

    static createBulletMesh(thickness) {
        const points = [];
        const width = 0.30;
        const height = 0.80;
        const domeHeight = 0.20;
        const domeSegments = 32;
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        // Bottom side
        points.push(new THREE.Vector3(-halfWidth, -halfHeight, 0));
        points.push(new THREE.Vector3(halfWidth, -halfHeight, 0));

        // Right side
        points.push(new THREE.Vector3(halfWidth, halfHeight - domeHeight, 0));

        // Top side (domed)
        for (let i = 0; i <= domeSegments; i++) {
            const angle = (Math.PI * i) / domeSegments;
            const x = Math.cos(angle) * halfWidth;
            const y = Math.sin(angle) * domeHeight + (halfHeight - domeHeight);
            points.push(new THREE.Vector3(x, y, 0));
        }

        // Left side
        points.push(new THREE.Vector3(-halfWidth, -halfHeight, 0));

        const line = new MeshLine();
        line.setPoints(points);

        const material = new MeshLineMaterial({
            color: 0xffff00,
            lineWidth: thickness,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        });

        return new THREE.Mesh(line, material);
    }

    static createEnemyMesh(type, thickness) {
        let points;
        let color;
        switch (type) {
            case 'diamond':
                points = [
                    new THREE.Vector3(0, 1, 0),
                    new THREE.Vector3(-1, 0, 0),
                    new THREE.Vector3(0, -1, 0),
                    new THREE.Vector3(1, 0, 0),
                    new THREE.Vector3(0, 1, 0)
                ];
                color = 0x00ffff;
                break;
            case 'square':
                points = [
                    new THREE.Vector3(-0.5, -0.5, 0),
                    new THREE.Vector3(0.5, -0.5, 0),
                    new THREE.Vector3(0.5, 0.5, 0),
                    new THREE.Vector3(-0.5, 0.5, 0),
                    new THREE.Vector3(-0.5, -0.5, 0)
                ];
                color = 0xff00ff;
                break;
        }
        
        const line = new MeshLine();
        line.setPoints(points);
        
        const material = new MeshLineMaterial({
            color: color,
            lineWidth: thickness,
            resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
        });
        
        return new THREE.Mesh(line, material);
    }
}
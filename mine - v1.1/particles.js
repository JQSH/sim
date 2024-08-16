// particles.js

function createSparkEffect(position, game) {
    const particleCount = 10000;
    const particleGeometry = new THREE.BufferGeometry();
    
    const particleMaterials = [
        new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.05,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 1
        }),
        new THREE.PointsMaterial({
            color: 0xFFAA00,
            size: 0.08,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8
        }),
        new THREE.PointsMaterial({
            color: 0xFF0000,
            size: 0.03,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.6
        })
    ];

    const direction = new THREE.Vector3().subVectors(position, game.character.position).normalize();
    const sparkOrigin = new THREE.Vector3().addVectors(position, direction.multiplyScalar(-0.5));

    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = sparkOrigin.x + (Math.random() - 0.5) * 2;
        positions[i3 + 1] = sparkOrigin.y + (Math.random() - 0.5) * 2;
        positions[i3 + 2] = sparkOrigin.z + (Math.random() - 0.5) * 2;

        velocities.push(new THREE.Vector3(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        ));

        colors[i3] = Math.random();
        colors[i3 + 1] = Math.random();
        colors[i3 + 2] = Math.random();

        sizes[i] = Math.random() * 0.1 + 0.01;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleSystems = particleMaterials.map(material => new THREE.Points(particleGeometry, material));
    
    particleSystems.forEach(system => game.scene.add(system));

    const sparkLight = new THREE.PointLight(0xFFAA00, 5, 10);
    sparkLight.position.copy(sparkOrigin);
    game.scene.add(sparkLight);

    game.sparkParticles.push({ 
        particles: particleSystems, 
        velocities, 
        age: 0,
        light: sparkLight,
        origin: sparkOrigin.clone()
    });
}

function updateSparkParticles(deltaTime, game) {
    for (let i = game.sparkParticles.length - 1; i >= 0; i--) {
        const spark = game.sparkParticles[i];
        spark.age += deltaTime;

        if (spark.age > 3) {
            spark.particles.forEach(system => game.scene.remove(system));
            game.scene.remove(spark.light);
            game.sparkParticles.splice(i, 1);
            continue;
        }

        spark.particles.forEach(system => {
            const positions = system.geometry.attributes.position.array;
            const colors = system.geometry.attributes.color.array;
            const sizes = system.geometry.attributes.size.array;

            for (let j = 0; j < positions.length; j += 3) {
                positions[j] += spark.velocities[j / 3].x * deltaTime;
                positions[j + 1] += spark.velocities[j / 3].y * deltaTime;
                positions[j + 2] += spark.velocities[j / 3].z * deltaTime;

                positions[j] += (Math.random() - 0.5) * 0.2;
                positions[j + 1] += (Math.random() - 0.5) * 0.2;
                positions[j + 2] += (Math.random() - 0.5) * 0.2;

                spark.velocities[j / 3].y -= 5 * deltaTime;

                colors[j] = Math.max(0, colors[j] - 0.1 * deltaTime);
                colors[j + 1] = Math.max(0, colors[j + 1] - 0.1 * deltaTime);
                colors[j + 2] = Math.max(0, colors[j + 2] - 0.1 * deltaTime);

                sizes[j / 3] = Math.max(0.01, sizes[j / 3] - 0.05 * deltaTime);
            }

            system.geometry.attributes.position.needsUpdate = true;
            system.geometry.attributes.color.needsUpdate = true;
            system.geometry.attributes.size.needsUpdate = true;
        });

        const lightIntensity = 5 * (1 - spark.age / 3);
        spark.light.intensity = lightIntensity;
        spark.light.position.set(
            spark.origin.x + Math.sin(spark.age * 10) * 0.5,
            spark.origin.y + Math.cos(spark.age * 10) * 0.5,
            spark.origin.z + Math.sin(spark.age * 15) * 0.5
        );
    }
}

window.createSparkEffect = createSparkEffect;
window.updateSparkParticles = updateSparkParticles;
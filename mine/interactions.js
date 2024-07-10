
function initInteractions(game) {
    const interactions = {
        update: function() {
            // Update logic for interactions (if needed)
        }
    };

    return interactions;
}

function onClickMine() {
    const nearbyRock = checkProximityToDiamondRocks();
    if (nearbyRock) {
        console.log("Mining nearby rock:", nearbyRock);
        createSparkEffect(nearbyRock.position);
        mineRock(nearbyRock);
        if (!game.isPickaxeAnimating) {
            animatePickaxe();
        }
    } else {
        console.log("No nearby rock to mine");
        if (!game.isPickaxeAnimating) {
            animatePickaxe();
        }
    }
}

function mineRock(rock) {
    console.log("Mining rock:", rock);
    
    // Remove the rock group from the scene
    if (rock.parent) {
        rock.parent.remove(rock);
    }
    
    // Remove from diamondRocks array
    const index = game.diamondRocks.indexOf(rock);
    if (index > -1) {
        game.diamondRocks.splice(index, 1);
        console.log("Removed rock from diamondRocks. New length:", game.diamondRocks.length);
    }

    // Find and remove the associated collision object
    const collisionIndex = game.collisionObjects.findIndex(obj => obj.userData.associatedRock === rock);
    if (collisionIndex > -1) {
        const collisionObject = game.collisionObjects[collisionIndex];
        if (collisionObject.parent) {
            collisionObject.parent.remove(collisionObject);
        }
        game.collisionObjects.splice(collisionIndex, 1);
        console.log("Removed collision object. New length:", game.collisionObjects.length);
    } else {
        console.warn("Could not find associated collision object for rock:", rock);
    }

    // Dispose of geometries and materials
    rock.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
    });

    // Force a scene update
    game.scene.updateMatrixWorld(true);

    console.log("Rock mined and removed from scene!");

    // Add a diamond
    game.diamondCount++;
    updateDiamondCounter();
    
    // Play collect sound
    if (game.collectSound) {
        game.collectSound.play();
    }
}

function updateDiamondCounter() {
    const counterElement = document.getElementById('diamondCounter');
    counterElement.textContent = `x ${game.diamondCount}`;
    
    // Add a little animation effect
    counterElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        counterElement.style.transform = 'scale(1)';
    }, 200);
}

function onKeyDown(event) {
    if (event.key === 'd' || event.key === 'D') {
        game.debugMode = !game.debugMode;
        console.log(`Debug mode ${game.debugMode ? 'enabled' : 'disabled'}`);
    }
    if (event.key === 'p' || event.key === 'P') {
        console.log("Forced proximity check:");
        const nearbyRock = checkProximityToDiamondRocks();
        if (nearbyRock) {
            console.log("Nearby rock detected:", nearbyRock);
        } else {
            console.log("No nearby rocks detected");
        }
    }
}

function createSparkEffect(position) {
    const particleCount = 10000;  // Increased particle count for more complexity
    const particleGeometry = new THREE.BufferGeometry();
    
    // Create multiple particle systems for different effects
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
            size:0.08,
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

    // Calculate the direction from the character to the rock
    const direction = new THREE.Vector3().subVectors(position, game.character.position).normalize();

    // Move the spark effect origin slightly closer to the player
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

        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 20
        );
        velocities.push(velocity);

        // Random color
        colors[i3] = Math.random();
        colors[i3 + 1] = Math.random();
        colors[i3 + 2] = Math.random();

        // Random size
        sizes[i] = Math.random() * 0.1 + 0.01;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleSystems = particleMaterials.map(material => new THREE.Points(particleGeometry, material));
    
    particleSystems.forEach(system => game.scene.add(system));

    // Create a light source at the spark origin
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

function updateSparkParticles(deltaTime) {
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

                // Add some turbulence
                positions[j] += (Math.random() - 0.5) * 0.2;
                positions[j + 1] += (Math.random() - 0.5) * 0.2;
                positions[j + 2] += (Math.random() - 0.5) * 0.2;

                // Gravity effect
                spark.velocities[j / 3].y -= 5 * deltaTime;

                // Color transition
                colors[j] = Math.max(0, colors[j] - 0.1 * deltaTime);
                colors[j + 1] = Math.max(0, colors[j + 1] - 0.1 * deltaTime);
                colors[j + 2] = Math.max(0, colors[j + 2] - 0.1 * deltaTime);

                // Size reduction
                sizes[j / 3] = Math.max(0.01, sizes[j / 3] - 0.05 * deltaTime);
            }

            system.geometry.attributes.position.needsUpdate = true;
            system.geometry.attributes.color.needsUpdate = true;
            system.geometry.attributes.size.needsUpdate = true;
        });

        // Update light intensity and position
        const lightIntensity = 5 * (1 - spark.age / 3);
        spark.light.intensity = lightIntensity;
        spark.light.position.set(
            spark.origin.x + Math.sin(spark.age * 10) * 0.5,
            spark.origin.y + Math.cos(spark.age * 10) * 0.5,
            spark.origin.z + Math.sin(spark.age * 15) * 0.5
        );
    }
}
function animatePickaxe() {
    game.isPickaxeAnimating = true;
    // Implement your pickaxe animation here
    // For example, you could use a tween library or manually animate the rotation

    // Simulating animation duration
    setTimeout(() => {
        game.isPickaxeAnimating = false;
    }, 500); // 500ms animation duration
}

function generateRetroCoinSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(987.77, audioContext.currentTime); // B5
    oscillator.frequency.setValueAtTime(1318.51, audioContext.currentTime + 0.1); // E6

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    return {
        play: function() {
            const newOscillator = audioContext.createOscillator();
            const newGainNode = audioContext.createGain();

            newOscillator.type = 'square';
            newOscillator.frequency.setValueAtTime(987.77, audioContext.currentTime);
            newOscillator.frequency.setValueAtTime(1318.51, audioContext.currentTime + 0.1);

            newGainNode.gain.setValueAtTime(0, audioContext.currentTime);
            newGainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
            newGainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);

            newOscillator.connect(newGainNode);
            newGainNode.connect(audioContext.destination);

            newOscillator.start(audioContext.currentTime);
            newOscillator.stop(audioContext.currentTime + 0.2);
        }
    };
}
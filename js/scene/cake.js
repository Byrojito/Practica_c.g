// js/scene/cake.js - Pastel pequeño y realista

function createCake() {
    const cakeGroup = new THREE.Group();
    const scale = CONFIG.cake.scale;

    // Plato
    const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45 * scale, 0.45 * scale, 0.02 * scale, 32),
        new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.9,
            roughness: 0.1
        })
    );
    plate.position.y = 0.01 * scale;
    plate.castShadow = true;
    cakeGroup.add(plate);

    // Materiales
    const cakeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFE4B5, // Beige bizcocho
        roughness: 0.85
    });
    
    const creamMaterial = new THREE.MeshStandardMaterial({
        color: 0x87CEEB, // Azul claro (como la imagen que mostraste)
        roughness: 0.4
    });

    // Base del pastel
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4 * scale, 0.4 * scale, 0.25 * scale, 32),
        creamMaterial
    );
    base.position.y = 0.14 * scale;
    base.castShadow = true;
    cakeGroup.add(base);

    // Capa de crema/fresas (intermedia)
    const strawberryLayer = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38 * scale, 0.38 * scale, 0.04 * scale, 32),
        cakeMaterial
    );
    strawberryLayer.position.y = 0.28 * scale;
    cakeGroup.add(strawberryLayer);

    // Fresas alrededor de la capa intermedia
    const strawberryMaterial = new THREE.MeshStandardMaterial({
        color: 0xDC143C,
        roughness: 0.6
    });

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const strawberry = new THREE.Mesh(
            new THREE.SphereGeometry(0.03 * scale, 10, 10),
            strawberryMaterial
        );
        strawberry.scale.set(1, 1.3, 1);
        strawberry.position.set(
            Math.cos(angle) * 0.37 * scale,
            0.28 * scale,
            Math.sin(angle) * 0.37 * scale
        );
        strawberry.castShadow = true;
        cakeGroup.add(strawberry);
    }

    // Capa superior
    const topLayer = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35 * scale, 0.35 * scale, 0.2 * scale, 32),
        creamMaterial
    );
    topLayer.position.y = 0.42 * scale;
    topLayer.castShadow = true;
    cakeGroup.add(topLayer);

    // Decoración de bolitas en el borde (como en tu imagen)
    const pearlMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFAF0,
        metalness: 0.3,
        roughness: 0.5
    });

    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const pearl = new THREE.Mesh(
            new THREE.SphereGeometry(0.012 * scale, 8, 8),
            pearlMaterial
        );
        pearl.position.set(
            Math.cos(angle) * 0.36 * scale,
            0.32 * scale,
            Math.sin(angle) * 0.36 * scale
        );
        cakeGroup.add(pearl);
        }

    // Velas (más delgadas y realistas)
    const candlePositions = [
        [0, 0.54 * scale, 0],
        [0.08 * scale, 0.54 * scale, 0.08 * scale],
        [-0.08 * scale, 0.54 * scale, 0.08 * scale],
        [0.08 * scale, 0.54 * scale, -0.08 * scale],
        [-0.08 * scale, 0.54 * scale, -0.08 * scale],
        [0, 0.54 * scale, 0.12 * scale],
        [0, 0.54 * scale, -0.12 * scale]
    ];

    const candleMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFF8DC,
        roughness: 0.7
    });

    candlePositions.forEach(pos => {
        // Vela delgada
        const candle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.012 * scale, 0.012 * scale, 0.18 * scale, 12),
            candleMaterial
        );
        candle.position.set(...pos);
        candle.castShadow = true;
        cakeGroup.add(candle);

        // Llama
        const flame = new THREE.Mesh(
            new THREE.SphereGeometry(0.02 * scale, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xFF6600 })
        );
        flame.position.set(pos[0], pos[1] + 0.1 * scale, pos[2]);
        flame.scale.set(1, 1.5, 1);
        cakeGroup.add(flame);

        // Luz de cada vela
        const flameLight = new THREE.PointLight(0xFF6600, 0.5, 0.8);
        flameLight.position.set(pos[0], pos[1] + 0.1 * scale, pos[2]);
        cakeGroup.add(flameLight);
    });

    // Posicionar pastel en la mesa
    cakeGroup.position.set(
        CONFIG.cake.position.x,
        CONFIG.cake.position.y,
        CONFIG.cake.position.z
    );
    
    cakeGroup.userData = {
        interactive: true,
        type: 'cake',
        name: 'Pastel de Cumpleaños'
    };
    
    interactiveObjects.push(cakeGroup);
    scene.add(cakeGroup);
    cake = cakeGroup;
}
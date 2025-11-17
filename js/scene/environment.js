// js/scene/environment.js - Entorno inmersivo con París 360°

function createEnvironment() {
    // SKYBOX INMERSIVO DE PARÍS (envuelve toda la escena)
    createParisSkybox();
    
    // Estrellas
    createStars();
    
    // Suelo realista (césped)
    createGround();
    
    // Torre Eiffel 3D
    createEiffelTower();
}

function createParisSkybox() {
    const loader = new THREE.TextureLoader();
    
    // Crear esfera gigante que envuelve la escena (SKYBOX)
    const skyboxGeometry = new THREE.SphereGeometry(50, 64, 64);
    
    // Material base (color nocturno)
    const skyboxMaterial = new THREE.MeshBasicMaterial({
        color: 0x1a1a3e,
        side: THREE.BackSide, // CRÍTICO: renderizar desde dentro
        fog: false
    });
    
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    scene.add(skybox);
    
    // Cargar tu foto de París y mapearla a la esfera
    loader.load(
        CONFIG.images.parisBackground,
        (texture) => {
            // Configurar textura para que se repita/estire correctamente
            texture.wrapS = THREE.RepeatWrapping;
            texture.repeat.x = -1; // Invertir para que se vea bien desde dentro
            
            skyboxMaterial.map = texture;
            skyboxMaterial.needsUpdate = true;
            
            console.log('✅ Foto de París cargada como skybox 360°');
        },
        undefined,
        (error) => {
            console.error('❌ Error cargando foto de París:', error);
            console.log('Verifica que exista: ' + CONFIG.images.parisBackground);
            console.log('La foto debe estar en: assets/images/paris-night.jpg');
        }
    );
}

function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 800;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        // Distribuir estrellas en toda la esfera
        const radius = 40 + Math.random() * 8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.cos(phi);
        positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.08,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a4a2a, // Verde césped oscuro
        roughness: 0.9,
        metalness: 0.1
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
}

function createEiffelTower() {
    const towerGroup = new THREE.Group();
    
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a3f35,
        metalness: 0.7,
        roughness: 0.3,
        emissive: 0xffd700,
        emissiveIntensity: 0.15
    });

    // Torre simplificada pero reconocible
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.6, 4, 4),
        metalMaterial
    );
    base.position.y = 2;
    base.castShadow = true;
    towerGroup.add(base);

    const mid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 3, 4),
        metalMaterial
    );
    mid.position.y = 5.5;
    mid.castShadow = true;
    towerGroup.add(mid);

    const top = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.2, 2, 4),
        metalMaterial
    );
    top.position.y = 8;
    top.castShadow = true;
    towerGroup.add(top);

    // Luces en la torre
    for (let i = 0; i < 15; i++) {
        const light = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.9 })
        );
        
        const height = Math.random() * 8 + 1;
        const radius = 0.6 - (height / 8) * 0.5;
        const angle = Math.random() * Math.PI * 2;
        
        light.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        towerGroup.add(light);
    }

    // Posicionar la torre a la izquierda, en el fondo
    towerGroup.position.set(-6, 0, -12);
    towerGroup.scale.set(1.2, 1.2, 1.2);
    scene.add(towerGroup);
}

function setupLighting() {
    // Luz ambiental suave
    const ambientLight = new THREE.AmbientLight(0x404080, 0.7);
    scene.add(ambientLight);

    // Luz principal (simula luna/París iluminado)
    const mainLight = new THREE.DirectionalLight(0xb8d4f7, 0.9);
    mainLight.position.set(3, 8, -8);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);

    // Luz de las velas del pastel (MUY CERCA y BRILLANTE)
    const candleLight = new THREE.PointLight(0xffaa00, 3, 3);
    candleLight.position.set(0, 1.2, -0.4);
    candleLight.castShadow = true;
    scene.add(candleLight);

    // Luz de acento desde París
    const parisLight = new THREE.PointLight(0xffd700, 2, 20);
    parisLight.position.set(-6, 4, -12);
    scene.add(parisLight);

    // Luz de relleno suave
    const fillLight = new THREE.HemisphereLight(0x4a5f7f, 0x1a1a2e, 0.5);
    scene.add(fillLight);
}
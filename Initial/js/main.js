// js/main.js - Archivo principal que orquesta todo

function init3DScene() {
    console.log('🎨 Inicializando escena 3D...');
    
    clock = new THREE.Clock();
    
    // Escena
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 30);

    // Cámara en PRIMERA PERSONA REALISTA
    camera = new THREE.PerspectiveCamera(
        CONFIG.camera.fov,
        window.innerWidth / window.innerHeight,
        CONFIG.camera.near,
        CONFIG.camera.far
    );
    
    // Posición: sentado MUY CERCA de la mesa
    camera.position.set(
        CONFIG.camera.position.x,
        CONFIG.camera.position.y,
        CONFIG.camera.position.z
    );
    camera.rotation.order = 'YXZ';

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Crear escena (orden importa)
    console.log('🌍 Creando entorno...');
    setupLighting();
    createEnvironment();
    
    console.log('🪑 Creando mesa de picnic...');
    createPicnicTable();
    
    console.log('🎂 Creando pastel...');
    createCake();
    
    console.log('🖼️ Creando marcos...');
    createRealisticFrames();
    
    console.log('🎉 Creando decoraciones...');
    createDecorations();
    
    setupAudio();
    setupEventListeners();
    
    console.log('✅ Escena 3D lista!');
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Rotar pastel suavemente
    if (cake) {
        cake.rotation.y += 0.001;
    }

    // Animar confeti
    scene.children.forEach(child => {
        if (child.userData.velocity) {
            child.position.y -= child.userData.velocity;
            child.rotation.x += child.userData.rotationSpeed.x;
            child.rotation.y += child.userData.rotationSpeed.y;
            child.rotation.z += child.userData.rotationSpeed.z;

            // Reciclar confeti cuando cae al suelo
            if (child.position.y < 0.3) {
                child.position.y = 5;
                child.position.x = (Math.random() - 0.5) * 6;
                child.position.z = (Math.random() - 0.5) * 6;
            }
        }
    });

    // Animar llamas de las velas (parpadeo)
    if (cake) {
        cake.children.forEach(child => {
            if (child.material && child.material.color && 
                child.material.color.r > 0.9 && child.material.color.g < 0.5) {
                const flicker = Math.sin(time * 8 + child.position.x * 10) * 0.12;
                child.scale.y = 1.5 + flicker;
                child.scale.x = 1 + flicker * 0.4;
                child.scale.z = 1 + flicker * 0.4;
            }
        });
    }

    // Animación sutil de respiración en los marcos
    frames.forEach((frame, index) => {
        const breathe = Math.sin(time * 0.5 + index) * 0.001;
        const originalY = CONFIG.table.height + 0.05;
        frame.position.y = originalY + breathe;
    });

    renderer.render(scene, camera);
}

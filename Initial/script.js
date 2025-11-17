// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
    images: {
        parisBackground: 'assets/images/paris-night.jpg',
        photo1: 'assets/images/photo1.jpg',
        photo2: 'assets/images/photo2.jpg',
        photo3: 'assets/images/photo3.jpg'
    },
    music: [
        { name: 'Video Games', artist: 'Lana Del Rey', url: 'assets/music/track1.mp3' },
        { name: 'BIZCOCHITO', artist: 'ROSALÍA', url: 'assets/music/track2.mp3' },
        { name: 'Lover', artist: 'Taylor Swift', url: 'assets/music/track3.mp3' }
    ]
};

// ============================================
// VARIABLES GLOBALES
// ============================================
let scene, camera, renderer, clock;
let cake, table, frames = [];
let raycaster, mouse;
let interactiveObjects = [];
let audioElement, currentTrackIndex = 0, isPlaying = false;

// Controles de cámara (primera persona)
let cameraControls = {
    position: { x: 0, y: 1.6, z: 3.5 }, // Sentado en la mesa
    rotation: { x: 0, y: 0 },
    isDragging: false,
    previousMouse: { x: 0, y: 0 }
};

// ============================================
// PARTE 1: TERMINAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const inputLine = document.getElementById('input-line');
    const passwordInput = document.getElementById('password-input');
    const terminalDiv = document.getElementById('terminal');
    const sceneDiv = document.getElementById('escena-3d');
    
    const messages = ["tina", "today is your birthday", "so i made you this computer program"];
    let messageIndex = 0;

    function typeWriter(text, element, callback) {
        let i = 0;
        const speed = 70;
        function typing() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typing, speed);
            } else if (callback) {
                setTimeout(callback, 500);
            }
        }
        typing();
    }

    function processMessages() {
        if (messageIndex < messages.length) {
            const line = document.createElement('div');
            line.innerHTML = '<span class="prompt">> </span><span class="text"></span>';
            output.appendChild(line);
            
            const textSpan = line.querySelector('.text');
            typeWriter(messages[messageIndex], textSpan, () => {
                messageIndex++;
                processMessages();
            });
        } else {
            const passwordLine = document.createElement('div');
            passwordLine.innerHTML = '<span class="prompt">> </span><span class="text">enter password:</span>';
            output.appendChild(passwordLine);
            
            setTimeout(() => {
                inputLine.style.display = 'flex';
                passwordInput.focus();
            }, 500);
        }
    }

    setTimeout(processMessages, 1000);

    // Manejo de contraseña
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const password = passwordInput.value.trim().toLowerCase();
            
            if (password === '1(๑◕‿◕๑)?' || password === 'torta' || password === 'tina') {
                const successLine = document.createElement('div');
                successLine.innerHTML = '<span class="prompt">> </span><span style="color: #FFD700;">access granted. loading scene...</span>';
                output.appendChild(successLine);
                
                inputLine.style.display = 'none';
                
                setTimeout(() => {
                    terminalDiv.classList.add('fade-out');
                    
                    setTimeout(() => {
                        terminalDiv.style.display = 'none';
                        sceneDiv.style.display = 'block';
                        init3DScene();
                    }, 1000);
                }, 1000);
            } else {
                const errorLine = document.createElement('div');
                errorLine.innerHTML = '<span class="prompt">> </span><span style="color: #FF0000;">ERROR: incorrect password.</span>';
                output.appendChild(errorLine);
                
                terminalDiv.classList.add('glitch');
                setTimeout(() => terminalDiv.classList.remove('glitch'), 300);
                
                passwordInput.value = '';
                output.scrollTop = output.scrollHeight;
            }
        }
    });
});

// ============================================
// PARTE 2: INICIALIZACIÓN 3D
// ============================================
function init3DScene() {
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a2e, 15, 35);

    // Cámara en primera persona
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(cameraControls.position.x, cameraControls.position.y, cameraControls.position.z);
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

    // Crear escena
    setupLighting();
    createEnvironment();
    createPicnicTable();
    createCake();
    createRealisticFrames();
    createDecorations();
    
    setupAudio();
    setupEventListeners();
    animate();
}

// ============================================
// ILUMINACIÓN
// ============================================
function setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x404080, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xb8d4f7, 0.8);
    mainLight.position.set(5, 10, -10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    scene.add(mainLight);

    const candleLight = new THREE.PointLight(0xffaa00, 2.5, 5);
    candleLight.position.set(0, 1.8, -0.3);
    candleLight.castShadow = true;
    scene.add(candleLight);

    const parisLight = new THREE.PointLight(0xffd700, 1.5, 25);
    parisLight.position.set(-8, 5, -18);
    scene.add(parisLight);
}

// ============================================
// ENTORNO
// ============================================
function createEnvironment() {
    // Estrellas
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1200;
    const positions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i += 3) {
        const radius = 50 + Math.random() * 15;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.cos(phi);
        positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Fondo de París
    const loader = new THREE.TextureLoader();
    const backdropGeometry = new THREE.PlaneGeometry(40, 20);
    const backdropMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a3e });
    
    loader.load(CONFIG.images.parisBackground, (texture) => {
        backdropMaterial.map = texture;
        backdropMaterial.needsUpdate = true;
    }, undefined, () => console.log('Foto de París no encontrada'));
    
    const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
    backdrop.position.set(0, 5, -20);
    scene.add(backdrop);

    // Torre Eiffel simple
    const towerGroup = new THREE.Group();
    const metalMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3f35, metalness: 0.7, roughness: 0.3 });
    
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.5, 6, 4), metalMaterial);
    tower.position.y = 3;
    tower.castShadow = true;
    towerGroup.add(tower);
    
    towerGroup.position.set(-7, 0, -18);
    scene.add(towerGroup);

    // Suelo
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshStandardMaterial({ color: 0x2a4a2a, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

// ============================================
// MESA DE PICNIC CON MANTEL A CUADROS
// ============================================
function createPicnicTable() {
    const tableGroup = new THREE.Group();

    // Material de madera rústica
    const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8, metalness: 0.1 });

    // Tablero
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(5, 0.1, 3), woodMaterial);
    tableTop.position.y = 1.4;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    // Patas en V (estilo picnic)
    const legGeometry = new THREE.BoxGeometry(0.1, 1.2, 0.1);
    const legPositions = [
        [-2, 0.7, -1.2], [2, 0.7, -1.2],
        [-2, 0.7, 1.2], [2, 0.7, 1.2]
    ];
    
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, woodMaterial);
        leg.position.set(...pos);
        leg.rotation.z = 0.1;
        leg.castShadow = true;
        tableGroup.add(leg);
    });

    // MANTEL A CUADROS (patrón rojo y blanco)
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    const squareSize = 64;
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            ctx.fillStyle = (x + y) % 2 === 0 ? '#DC143C' : '#FFFFFF';
            ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
        }
    }
    
    const clothTexture = new THREE.CanvasTexture(canvas);
    clothTexture.wrapS = THREE.RepeatWrapping;
    clothTexture.wrapT = THREE.RepeatWrapping;
    
    const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(4.5, 2.8),
        new THREE.MeshStandardMaterial({ map: clothTexture, roughness: 0.9, side: THREE.DoubleSide })
    );
    cloth.rotation.x = -Math.PI / 2;
    cloth.position.y = 1.46;
    cloth.receiveShadow = true;
    tableGroup.add(cloth);

    scene.add(tableGroup);
    table = tableGroup;
}

// ============================================
// PASTEL REALISTA
// ============================================
function createCake() {
    const cakeGroup = new THREE.Group();

    // Plato
    const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, 0.03, 32),
        new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 })
    );
    plate.position.y = 1.48;
    plate.castShadow = true;
    cakeGroup.add(plate);

    // Bizcocho (3 capas)
    const cakeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFE4B5, roughness: 0.85 });
    const creamMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFACD, roughness: 0.4 });

    const layers = [
        { radius: 0.8, height: 0.4, y: 1.72 },
        { radius: 0.7, height: 0.35, y: 2.1 },
        { radius: 0.5, height: 0.3, y: 2.4 }
    ];

    layers.forEach(layer => {
        const cake = new THREE.Mesh(new THREE.CylinderGeometry(layer.radius, layer.radius, layer.height, 32), cakeMaterial);
        cake.position.y = layer.y;
        cake.castShadow = true;
        cakeGroup.add(cake);

        const cream = new THREE.Mesh(new THREE.CylinderGeometry(layer.radius + 0.02, layer.radius + 0.02, 0.05, 32), creamMaterial);
        cream.position.y = layer.y + layer.height / 2 + 0.025;
        cakeGroup.add(cream);
    });

    // Fresas
    const strawberryMaterial = new THREE.MeshStandardMaterial({ color: 0xDC143C, roughness: 0.6 });
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const strawberry = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), strawberryMaterial);
        strawberry.scale.set(1, 1.3, 1);
        strawberry.position.set(Math.cos(angle) * 0.7, 2.3, Math.sin(angle) * 0.7);
        strawberry.castShadow = true;
        cakeGroup.add(strawberry);
    }

    // Velas
    const candlePositions = [[0, 2.6, 0], [0.2, 2.6, 0.2], [-0.2, 2.6, 0.2], [0.2, 2.6, -0.2], [-0.2, 2.6, -0.2]];
    candlePositions.forEach(pos => {
        const candle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.3, 12),
            new THREE.MeshStandardMaterial({ color: 0xFFF8DC, roughness: 0.7 })
        );
        candle.position.set(...pos);
        candle.castShadow = true;
        cakeGroup.add(candle);

        const flame = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xFF6600 })
        );
        flame.position.set(pos[0], pos[1] + 0.18, pos[2]);
        flame.scale.set(1, 1.4, 1);
        cakeGroup.add(flame);
    });

    cakeGroup.position.set(0, 0, -0.3);
    cakeGroup.userData = { interactive: true, type: 'cake', name: 'Pastel' };
    interactiveObjects.push(cakeGroup);
    scene.add(cakeGroup);
    cake = cakeGroup;
}

// ============================================
// MARCOS REALISTAS CON PROFUNDIDAD 3D
// ============================================
function createRealisticFrames() {
    const frameData = [
        { pos: [-1.5, 1.52, 0.7], rot: [0, Math.PI * 0.15, 0], photo: CONFIG.images.photo1 },
        { pos: [0, 1.52, -0.8], rot: [0, 0, 0], photo: CONFIG.images.photo2 },
        { pos: [1.5, 1.52, 0.7], rot: [0, -Math.PI * 0.15, 0], photo: CONFIG.images.photo3 }
    ];

    const loader = new THREE.TextureLoader();

    frameData.forEach((data, index) => {
        const frameGroup = new THREE.Group();
        const frameWidth = 0.6;
        const frameHeight = 0.8;
        const borderWidth = 0.05;
        const depth = 0.03;

        // Material del marco (madera dorada)
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0xD4AF37,
            metalness: 0.8,
            roughness: 0.3,
            emissive: 0x332200,
            emissiveIntensity: 0.1
        });

        // Crear bordes con ExtrudeGeometry para profundidad realista
        function createFrameBorder(w, h) {
            const shape = new THREE.Shape();
            shape.moveTo(-w/2, -h/2);
            shape.lineTo(w/2, -h/2);
            shape.lineTo(w/2, h/2);
            shape.lineTo(-w/2, h/2);
            shape.lineTo(-w/2, -h/2);

            const extrudeSettings = {
                depth: depth,
                bevelEnabled: true,
                bevelThickness: 0.008,
                bevelSize: 0.008,
                bevelSegments: 2
            };

            return new THREE.ExtrudeGeometry(shape, extrudeSettings);
        }

        // Bordes del marco
        const topBorder = new THREE.Mesh(createFrameBorder(frameWidth + borderWidth * 2, borderWidth), frameMaterial);
        topBorder.position.y = frameHeight / 2 + borderWidth / 2;
        topBorder.castShadow = true;
        frameGroup.add(topBorder);

        const bottomBorder = new THREE.Mesh(createFrameBorder(frameWidth + borderWidth * 2, borderWidth), frameMaterial);
        bottomBorder.position.y = -(frameHeight / 2 + borderWidth / 2);
        bottomBorder.castShadow = true;
        frameGroup.add(bottomBorder);

        const leftBorder = new THREE.Mesh(createFrameBorder(borderWidth, frameHeight), frameMaterial);
        leftBorder.position.x = -(frameWidth / 2 + borderWidth / 2);
        leftBorder.castShadow = true;
        frameGroup.add(leftBorder);

        const rightBorder = new THREE.Mesh(createFrameBorder(borderWidth, frameHeight), frameMaterial);
        rightBorder.position.x = frameWidth / 2 + borderWidth / 2;
        rightBorder.castShadow = true;
        frameGroup.add(rightBorder);

        // Foto
        const photoMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.7 });
        loader.load(data.photo, (texture) => {
            photoMaterial.map = texture;
            photoMaterial.needsUpdate = true;
        }, undefined, () => console.log(`Foto ${index + 1} no encontrada`));

        const photo = new THREE.Mesh(new THREE.PlaneGeometry(frameWidth - 0.01, frameHeight - 0.01), photoMaterial);
        photo.position.z = depth / 2 + 0.003;
        frameGroup.add(photo);

        // Vidrio protector
        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(frameWidth, frameHeight),
            new THREE.MeshPhysicalMaterial({
                color: 0xFFFFFF,
                metalness: 0,
                roughness: 0.05,
                transmission: 0.85,
                transparent: true,
                opacity: 0.25,
                reflectivity: 0.3
            })
        );
        glass.position.z = depth + 0.008;
        frameGroup.add(glass);

        // Soporte trasero
        const back = new THREE.Mesh(
            new THREE.BoxGeometry(frameWidth + borderWidth, frameHeight + borderWidth, 0.008),
            new THREE.MeshStandardMaterial({ color: 0x2A2A2A, roughness: 0.9 })
        );
        back.position.z = -0.008;
        frameGroup.add(back);

        frameGroup.position.set(...data.pos);
        frameGroup.rotation.set(...data.rot);
        frameGroup.castShadow = true;
        frameGroup.userData = { interactive: true, type: 'frame', index: index, name: `Recuerdo ${index + 1}` };
        
        interactiveObjects.push(frameGroup);
        frames.push(frameGroup);
        scene.add(frameGroup);
    });
}

// ============================================
// DECORACIONES
// ============================================
function createDecorations() {
    const confettiColors = [0xFF69B4, 0xFFD700, 0x4169E1, 0xFF6347, 0x9370DB];
    
    for (let i = 0; i < 50; i++) {
        const confetti = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.05, 0.012),
            new THREE.MeshStandardMaterial({ 
                color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                metalness: 0.6,
                roughness: 0.2
            })
        );
        
        confetti.position.set(
            (Math.random() - 0.5) * 8,
            Math.random() * 5 + 2.5,
            (Math.random() - 0.5) * 8
        );
        
        confetti.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        confetti.userData = {
            velocity: Math.random() * 0.01 + 0.005,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.05,
                y: (Math.random() - 0.5) * 0.05,
                z: (Math.random() - 0.5) * 0.05
            }
        };
        
        confetti.castShadow = true;
        scene.add(confetti);
    }
}

// ============================================
// AUDIO
// ============================================
function setupAudio() {
    audioElement = new Audio();
    audioElement.volume = 0.5;
    audioElement.addEventListener('ended', nextTrack);
}

function toggleMusic() {
    if (!audioElement.src) loadTrack(0);
    
    if (isPlaying) {
        audioElement.pause();
        isPlaying = false;
        document.getElementById('music-icon').textContent = '▶️';
        document.querySelector('.music-btn').classList.remove('playing');
    } else {
        audioElement.play();
        isPlaying = true;
        document.getElementById('music-icon').textContent = '⏸️';
        document.querySelector('.music-btn').classList.add('playing');
        showTrackInfo();
    }
}

function loadTrack(index) {
    if (CONFIG.music[index]) {
        currentTrackIndex = index;
        audioElement.src = CONFIG.music[index].url;
        document.querySelector('.track-name').textContent = CONFIG.music[index].name;
        document.querySelector('.track-artist').textContent = CONFIG.music[index].artist;
    }
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % CONFIG.music.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) audioElement.play();
    showTrackInfo();
}

function showTrackInfo() {
    const trackInfo = document.getElementById('track-info');
    trackInfo.classList.add('show');
    setTimeout(() => trackInfo.classList.remove('show'), 3000);
}

// ============================================
// EVENT LISTENERS Y CONTROLES
// ============================================
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onMouseWheel);
    renderer.domElement.addEventListener('click', onClick);
    document.getElementById('play-music').addEventListener('click', toggleMusic);
}

function onMouseDown(event) {
    if (event.button === 0) {
        cameraControls.isDragging = true;
        cameraControls.previousMouse = { x: event.clientX, y: event.clientY };
    }
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (cameraControls.isDragging) {
        const deltaX = event.clientX - cameraControls.previousMouse.x;
        const deltaY = event.clientY - cameraControls.previousMouse.y;

        cameraControls.rotation.y -= deltaX * 0.003;
        cameraControls.rotation.x -= deltaY * 0.003;
        cameraControls.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraControls.rotation.x));

        camera.rotation.y = cameraControls.rotation.y;
        camera.rotation.x = cameraControls.rotation.x;

        cameraControls.previousMouse = { x: event.clientX, y: event.clientY };
    } else {
        checkHover();
    }
}

function onMouseUp() {
    cameraControls.isDragging = false;
}

function onMouseWheel(event) {
    event.preventDefault();
    const zoomSpeed = 0.05;
    const direction = event.deltaY > 0 ? 1 : -1;
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(camera.quaternion);
    camera.position.addScaledVector(forward, -direction * zoomSpeed);
    camera.position.z = Math.max(2, Math.min(5, camera.position.z));
}

function checkHover() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, true);
    
    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
        document.getElementById('interaction-hint').classList.add('show');
    } else {
        document.body.style.cursor = 'default';
        document.getElementById('interaction-hint').classList.remove('show');
    }
}

function onClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, true);

    if (intersects.length > 0) {
        let object = intersects[0].object;
        while (object.parent && !object.userData.interactive) {
            object = object.parent;
        }

        if (object.userData.type === 'frame') {
            alert(`${object.userData.name}\n\n📸 Aquí irá el visor 3D próximamente`);
        } else if (object.userData.type === 'cake') {
            alert('🎂 ¡Feliz Cumpleaños, Tina!\n\n✨ Pide un deseo...');
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// ANIMACIÓN
// ============================================
function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    if (cake) cake.rotation.y += 0.002;

    scene.children.forEach(child => {
        if (child.userData.velocity) {
            child.position.y -= child.userData.velocity;
            child.rotation.x += child.userData.rotationSpeed.x;
            child.rotation.y += child.userData.rotationSpeed.y;
            child.rotation.z += child.userData.rotationSpeed.z;
            if (child.position.y < 0.5) {
                child.position.y = 7;
                child.position.x = (Math.random() - 0.5) * 8;
                child.position.z = (Math.random() - 0.5) * 8;
            }
        }
    });

    if (cake) {
        cake.children.forEach(child => {
            if (child.material && child.material.color && child.material.color.r > 0.9 && child.material.color.g < 0.5) {
                const flicker = Math.sin(time * 8 + child.position.x * 10) * 0.15;
                child.scale.y = 1.4 + flicker;
                child.scale.x = 1 + flicker * 0.5;
                child.scale.z = 1 + flicker * 0.5;
            }
        });
    }

    frames.forEach((frame, index) => {
        const breathe = Math.sin(time + index) * 0.002;
        frame.position.y = 1.52 + breathe;
    });

    renderer.render(scene, camera);
}
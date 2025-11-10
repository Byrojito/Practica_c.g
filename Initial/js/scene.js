// js/scene.js - Parte 1: Configuración e inicialización

// ==================== CONFIGURACIÓN ====================
const CONFIG = {
    // Rutas de assets (ACTUALIZA ESTAS RUTAS CON TUS ARCHIVOS)
    images: {
        parisBackground: 'assets/images/paris-night.jpg',
        photo1: 'assets/images/photo1.jpg',
        photo2: 'assets/images/photo2.jpg',
        photo3: 'assets/images/photo3.jpg'
    },
    music: [
        { 
            name: 'Video Games', 
            artist: 'Lana Del Rey', 
            url: 'assets/music/track1.mp3' 
        },
        { 
            name: 'BIZCOCHITO', 
            artist: 'ROSALÍA', 
            url: 'assets/music/track2.mp3' 
        },
        { 
            name: 'Lover', 
            artist: 'Taylor Swift', 
            url: 'assets/music/track3.mp3' 
        }
    ]
};

// ==================== VARIABLES GLOBALES ====================
let scene, camera, renderer;
let cake, table, frames = [];
let parisBackground;
let raycaster, mouse;
let controls = {
    isDragging: false,
    previousMouse: { x: 0, y: 0 },
    rotation: { x: 0, y: Math.PI / 4 },
    distance: 12
};

// Audio
let audioElement, currentTrackIndex = 0, isPlaying = false;

// Objetos interactivos
let interactiveObjects = [];

// Clock para animaciones
let clock;

// ==================== INICIALIZACIÓN ====================
function init() {
    // Clock
    clock = new THREE.Clock();

    // Escena
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a2e, 20, 60);

    // Cámara
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    updateCameraPosition();

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: false
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.getElementById('container').appendChild(renderer.domElement);

    // Raycaster
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Crear escena
    setupLighting();
    createEnvironment();
    createTable();
    createCake();
    createFrames();
    createDecorations();

    // Audio setup
    setupAudio();

    // Event listeners
    setupEventListeners();

    // Ocultar loading después de cargar
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 2000);

    // Iniciar animación
    animate();
}

// ==================== ILUMINACIÓN REALISTA ====================
function setupLighting() {
    // Luz ambiental suave
    const ambientLight = new THREE.AmbientLight(0x404080, 0.4);
    scene.add(ambientLight);

    // Luz principal (luna simulada)
    const moonLight = new THREE.DirectionalLight(0xb8d4f7, 0.6);
    moonLight.position.set(10, 15, 5);
    moonLight.castShadow = true;
    moonLight.shadow.camera.left = -20;
    moonLight.shadow.camera.right = 20;
    moonLight.shadow.camera.top = 20;
    moonLight.shadow.camera.bottom = -20;
    moonLight.shadow.camera.near = 0.1;
    moonLight.shadow.camera.far = 50;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.bias = -0.0001;
    scene.add(moonLight);

    // Luz cálida de las velas
    const candleLight = new THREE.PointLight(0xffaa00, 1.5, 8);
    candleLight.position.set(0, 2.8, 0);
    candleLight.castShadow = true;
    scene.add(candleLight);

    // Luces de acento (París iluminado)
    const accentLight1 = new THREE.PointLight(0xffd700, 0.8, 25);
    accentLight1.position.set(-15, 5, -20);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0xff9999, 0.6, 20);
    accentLight2.position.set(15, 4, -18);
    scene.add(accentLight2);

    // Luz del suelo (rebote)
    const groundLight = new THREE.HemisphereLight(0x4a5f7f, 0x1a1a2e, 0.3);
    scene.add(groundLight);
}

// ==================== ENTORNO ====================
function createEnvironment() {
    // Cielo nocturno con estrellas
    createNightSky();
    
    // Fondo de París (imagen plana al fondo)
    createParisBackdrop();
    
    // Torre Eiffel 3D realista
    createEiffelTower();
    
    // Suelo/piso
    createGround();
}

function createNightSky() {
    // Estrellas
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        // Posición
        const radius = 80 + Math.random() * 20;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.cos(phi);
        positions[i + 2] = radius * Math.sin(phi) * Math.sin(theta);

        // Color (tonos azulados y blancos)
        const colorChoice = Math.random();
        if (colorChoice > 0.7) {
            colors[i] = 1;
            colors[i + 1] = 1;
            colors[i + 2] = 1;
        } else {
            colors[i] = 0.7 + Math.random() * 0.3;
            colors[i + 1] = 0.8 + Math.random() * 0.2;
            colors[i + 2] = 1;
        }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

function createParisBackdrop() {
    // Plano con imagen de París al fondo
    const loader = new THREE.TextureLoader();
    
    // Si no tienes la imagen, usaremos un degradado
    const backdropGeometry = new THREE.PlaneGeometry(60, 30);
    const backdropMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color1: { value: new THREE.Color(0x1a1a3e) },
            color2: { value: new THREE.Color(0x0a0a1e) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            void main() {
                gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
            }
        `,
        side: THREE.DoubleSide
    });

    // Intentar cargar la imagen si existe
    loader.load(
        CONFIG.images.parisBackground,
        (texture) => {
            backdropMaterial.map = texture;
            backdropMaterial.needsUpdate = true;
        },
        undefined,
        (error) => {
            console.log('Imagen de París no encontrada, usando degradado');
        }
    );

    const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
    backdrop.position.set(0, 8, -30);
    scene.add(backdrop);
    parisBackground = backdrop;
}

function createEiffelTower() {
    const towerGroup = new THREE.Group();
    
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a3f35,
        metalness: 0.6,
        roughness: 0.4,
        emissive: 0xffd700,
        emissiveIntensity: 0.15
    });

    // Base (4 patas)
    const legGeometry = new THREE.CylinderGeometry(0.15, 0.3, 4, 8);
    const legPositions = [
        [-0.8, 2, -0.8],
        [0.8, 2, -0.8],
        [-0.8, 2, 0.8],
        [0.8, 2, 0.8]
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, metalMaterial);
        leg.position.set(...pos);
        leg.castShadow = true;
        towerGroup.add(leg);
    });

    // Primer nivel
    const level1Geometry = new THREE.CylinderGeometry(0.6, 1.2, 1, 4);
    const level1 = new THREE.Mesh(level1Geometry, metalMaterial);
    level1.position.y = 4.5;
    level1.castShadow = true;
    towerGroup.add(level1);

    // Segundo nivel
    const level2Geometry = new THREE.CylinderGeometry(0.4, 0.6, 2, 4);
    const level2 = new THREE.Mesh(level2Geometry, metalMaterial);
    level2.position.y = 6.5;
    level2.castShadow = true;
    towerGroup.add(level2);

    // Tercer nivel
    const level3Geometry = new THREE.CylinderGeometry(0.2, 0.4, 1.5, 4);
    const level3 = new THREE.Mesh(level3Geometry, metalMaterial);
    level3.position.y = 8.5;
    level3.castShadow = true;
    towerGroup.add(level3);

    // Antena
    const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const antenna = new THREE.Mesh(antennaGeometry, metalMaterial);
    antenna.position.y = 10;
    towerGroup.add(antenna);

    // Luces de la torre (puntos luminosos)
    for (let i = 0; i < 30; i++) {
        const lightSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            new THREE.MeshBasicMaterial({ 
                color: 0xffd700,
                transparent: true,
                opacity: 0.8
            })
        );
        
        const height = Math.random() * 9 + 1;
        const radius = 1.2 - (height / 9) * 1.0;
        const angle = Math.random() * Math.PI * 2;
        
        lightSphere.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        towerGroup.add(lightSphere);
    }

    towerGroup.position.set(-12, 0, -25);
    towerGroup.scale.set(1.2, 1.2, 1.2);
    scene.add(towerGroup);
}

function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.9,
        metalness: 0.1
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);
}

// Continúa en la Parte 2...

// js/scene.js - Parte 2: Mesa, Pastel, Cuadros e Interacciones

// ==================== MESA REALISTA ====================
function createTable() {
    const tableGroup = new THREE.Group();

    // Material de madera
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b4423,
        roughness: 0.7,
        metalness: 0.1
    });

    // Tablero principal
    const topGeometry = new THREE.BoxGeometry(8, 0.15, 5);
    const tableTop = new THREE.Mesh(topGeometry, woodMaterial);
    tableTop.position.y = 1.5;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    // Marco decorativo del tablero
    const edgeGeometry = new THREE.BoxGeometry(8.1, 0.1, 0.1);
    const edge1 = new THREE.Mesh(edgeGeometry, woodMaterial);
    edge1.position.set(0, 1.58, 2.5);
    tableGroup.add(edge1);
    
    const edge2 = edge1.clone();
    edge2.position.z = -2.5;
    tableGroup.add(edge2);

    // Patas de la mesa
    const legGeometry = new THREE.CylinderGeometry(0.12, 0.15, 1.5, 16);
    const legPositions = [
        [-3.3, 0.75, -2],
        [3.3, 0.75, -2],
        [-3.3, 0.75, 2],
        [3.3, 0.75, 2]
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, woodMaterial);
        leg.position.set(...pos);
        leg.castShadow = true;
        tableGroup.add(leg);
    });

    // Mantel decorativo (opcional)
    const clothGeometry = new THREE.PlaneGeometry(7, 4);
    const clothMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f5dc,
        roughness: 0.9,
        side: THREE.DoubleSide
    });
    const cloth = new THREE.Mesh(clothGeometry, clothMaterial);
    cloth.rotation.x = -Math.PI / 2;
    cloth.position.y = 1.58;
    cloth.receiveShadow = true;
    tableGroup.add(cloth);

    scene.add(tableGroup);
    table = tableGroup;
}

// ==================== PASTEL 3D REALISTA ====================
function createCake() {
    const cakeGroup = new THREE.Group();

    // Plato base
    const plateGeometry = new THREE.CylinderGeometry(1.3, 1.3, 0.05, 32);
    const plateMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.8
    });
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.y = 1.6;
    plate.castShadow = true;
    cakeGroup.add(plate);

    // Base del pastel (bizcocho)
    const cakeMaterial = new THREE.MeshStandardMaterial({
        color: 0xffe4c4,
        roughness: 0.8
    });

    const baseGeometry = new THREE.CylinderGeometry(1.1, 1.1, 0.6, 32);
    const base = new THREE.Mesh(baseGeometry, cakeMaterial);
    base.position.y = 1.95;
    base.castShadow = true;
    cakeGroup.add(base);

    // Crema entre capas
    const creamMaterial = new THREE.MeshStandardMaterial({
        color: 0xfffacd,
        roughness: 0.4
    });
    const cream1 = new THREE.Mesh(
        new THREE.CylinderGeometry(1.12, 1.12, 0.08, 32),
        creamMaterial
    );
    cream1.position.y = 2.25;
    cakeGroup.add(cream1);

    // Segunda capa
    const layer2 = new THREE.Mesh(
        new THREE.CylinderGeometry(1.0, 1.0, 0.5, 32),
        cakeMaterial
    );
    layer2.position.y = 2.55;
    layer2.castShadow = true;
    cakeGroup.add(layer2);

    const cream2 = new THREE.Mesh(
        new THREE.CylinderGeometry(1.02, 1.02, 0.08, 32),
        creamMaterial
    );
    cream2.position.y = 2.8;
    cakeGroup.add(cream2);

    // Tercera capa (pequeña arriba)
    const layer3 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 0.4, 32),
        cakeMaterial
    );
    layer3.position.y = 3.1;
    layer3.castShadow = true;
    cakeGroup.add(layer3);

    // Decoración: Fresas
    const strawberryMaterial = new THREE.MeshStandardMaterial({
        color: 0xdc143c,
        roughness: 0.6
    });

    for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const strawberry = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 8, 8),
            strawberryMaterial
        );
        strawberry.scale.set(1, 1.2, 1);
        strawberry.position.set(
            Math.cos(angle) * 1.0,
            2.85,
            Math.sin(angle) * 1.0
        );
        strawberry.castShadow = true;
        cakeGroup.add(strawberry);

        // Hojitas de fresa
        const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
        const leaf = new THREE.Mesh(
            new THREE.ConeGeometry(0.04, 0.06, 6),
            leafMaterial
        );
        leaf.position.copy(strawberry.position);
        leaf.position.y += 0.12;
        leaf.rotation.x = Math.PI;
        cakeGroup.add(leaf);
    }

    // Velas
    const candleMaterial = new THREE.MeshStandardMaterial({
        color: 0xfff8dc,
        roughness: 0.7
    });

    const flameMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6600
    });

    const candlePositions = [
        [0, 3.3, 0],
        [0.3, 3.3, 0.3],
        [-0.3, 3.3, 0.3],
        [0.3, 3.3, -0.3],
        [-0.3, 3.3, -0.3]
    ];

    candlePositions.forEach(pos => {
        // Vela
        const candle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.4, 12),
            candleMaterial
        );
        candle.position.set(...pos);
        candle.castShadow = true;
        cakeGroup.add(candle);

        // Llama
        const flame = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            flameMaterial
        );
        flame.position.set(pos[0], pos[1] + 0.25, pos[2]);
        flame.scale.set(1, 1.4, 1);
        cakeGroup.add(flame);

        // Luz de la llama
        const flameLight = new THREE.PointLight(0xff6600, 0.3, 2);
        flameLight.position.copy(flame.position);
        cakeGroup.add(flameLight);
    });

    cakeGroup.userData = { interactive: true, type: 'cake', name: 'Pastel' };
    interactiveObjects.push(cakeGroup);
    scene.add(cakeGroup);
    cake = cakeGroup;
}

// ==================== CUADROS/MARCOS CON FOTOS ====================
function createFrames() {
    const frameData = [
        { pos: [-3, 1.65, 0.5], rot: [0, 0, 0], photo: CONFIG.images.photo1 },
        { pos: [0, 1.65, -1.5], rot: [0, 0, 0], photo: CONFIG.images.photo2 },
        { pos: [3, 1.65, 0.5], rot: [0, 0, 0], photo: CONFIG.images.photo3 }
    ];

    const loader = new THREE.TextureLoader();

    frameData.forEach((data, index) => {
        const frameGroup = new THREE.Group();

        // Marco dorado
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4af37,
            metalness: 0.8,
            roughness: 0.2
        });

        // Borde del marco
        const borderThickness = 0.08;
        const frameWidth = 0.9;
        const frameHeight = 1.2;

        // Bordes (4 piezas)
        const topBorder = new THREE.Mesh(
            new THREE.BoxGeometry(frameWidth, borderThickness, 0.06),
            frameMaterial
        );
        topBorder.position.y = frameHeight / 2;
        frameGroup.add(topBorder);

        const bottomBorder = topBorder.clone();
        bottomBorder.position.y = -frameHeight / 2;
        frameGroup.add(bottomBorder);

        const leftBorder = new THREE.Mesh(
            new THREE.BoxGeometry(borderThickness, frameHeight, 0.06),
            frameMaterial
        );
        leftBorder.position.x = -frameWidth / 2;
        frameGroup.add(leftBorder);

        const rightBorder = leftBorder.clone();
        rightBorder.position.x = frameWidth / 2;
        frameGroup.add(rightBorder);

        // Foto
        const photoGeometry = new THREE.PlaneGeometry(
            frameWidth - borderThickness * 2,
            frameHeight - borderThickness * 2
        );
        const photoMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.8
        });

        // Cargar textura de foto
        loader.load(
            data.photo,
            (texture) => {
                photoMaterial.map = texture;
                photoMaterial.needsUpdate = true;
            },
            undefined,
            (error) => {
                console.log(`Foto ${index + 1} no encontrada, usando placeholder`);
            }
        );

        const photo = new THREE.Mesh(photoGeometry, photoMaterial);
        photo.position.z = 0.01;
        frameGroup.add(photo);

        // Soporte trasero
        const backGeometry = new THREE.BoxGeometry(frameWidth, frameHeight, 0.02);
        const backMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const back = new THREE.Mesh(backGeometry, backMaterial);
        back.position.z = -0.03;
        frameGroup.add(back);

        frameGroup.position.set(...data.pos);
        frameGroup.rotation.set(...data.rot);
        frameGroup.castShadow = true;
        
        frameGroup.userData = {
            interactive: true,
            type: 'frame',
            index: index,
            name: `Recuerdo ${index + 1}`
        };

        interactiveObjects.push(frameGroup);
        frames.push(frameGroup);
        scene.add(frameGroup);
    });
}

// ==================== DECORACIONES ====================
function createDecorations() {
    // Confeti flotante
    const confettiColors = [0xff69b4, 0xffd700, 0x4169e1, 0xff6347, 0x9370db];
    
    for (let i = 0; i < 80; i++) {
        const confetti = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.08, 0.02),
            new THREE.MeshStandardMaterial({
                color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                metalness: 0.6,
                roughness: 0.3
            })
        );
        
        confetti.position.set(
            (Math.random() - 0.5) * 15,
            Math.random() * 8 + 3,
            (Math.random() - 0.5) * 15
        );
        
        confetti.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        confetti.userData = {
            velocity: Math.random() * 0.015 + 0.008,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.08,
                y: (Math.random() - 0.5) * 0.08,
                z: (Math.random() - 0.5) * 0.08
            }
        };
        
        scene.add(confetti);
    }
}

// ==================== CONTROLES DE CÁMARA ====================
function updateCameraPosition() {
    const { rotation, distance } = controls;
    camera.position.x = distance * Math.sin(rotation.y) * Math.cos(rotation.x);
    camera.position.y = 4 + distance * Math.sin(rotation.x);
    camera.position.z = distance * Math.cos(rotation.y) * Math.cos(rotation.x);
    camera.lookAt(0, 2, 0);
}

// ==================== AUDIO ====================
function setupAudio() {
    audioElement = new Audio();
    audioElement.volume = 0.5;
    
    audioElement.addEventListener('ended', () => {
        nextTrack();
    });
}

function toggleMusic() {
    if (!audioElement.src) {
        loadTrack(0);
    }
    
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
        updateTrackInfo();
    }
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % CONFIG.music.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) {
        audioElement.play();
    }
    showTrackInfo();
}

function updateTrackInfo() {
    const track = CONFIG.music[currentTrackIndex];
    if (track) {
        document.querySelector('.track-name').textContent = track.name;
        document.querySelector('.track-artist').textContent = track.artist;
    }
}

function showTrackInfo() {
    const trackInfo = document.getElementById('track-info');
    trackInfo.classList.add('show');
    setTimeout(() => {
        trackInfo.classList.remove('show');
    }, 3000);
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onMouseWheel);
    renderer.domElement.addEventListener('click', onClick);
    
    document.getElementById('play-music').addEventListener('click', toggleMusic);
    document.getElementById('next-track').addEventListener('click', nextTrack);
    document.getElementById('close-viewer').addEventListener('click', closeViewer);
}

function onMouseDown(event) {
    if (event.button === 0) {
        controls.isDragging = true;
        controls.previousMouse = { x: event.clientX, y: event.clientY };
    }
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (controls.isDragging) {
        const deltaX = event.clientX - controls.previousMouse.x;
        const deltaY = event.clientY - controls.previousMouse.y;

        controls.rotation.y += deltaX * 0.005;
        controls.rotation.x += deltaY * 0.005;
        controls.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, controls.rotation.x));

        updateCameraPosition();
        controls.previousMouse = { x: event.clientX, y: event.clientY };
    } else {
        checkHover();
    }
}

function onMouseUp() {
    controls.isDragging = false;
}

function onMouseWheel(event) {
    event.preventDefault();
    controls.distance += event.deltaY * 0.01;
    controls.distance = Math.max(6, Math.min(20, controls.distance));
    updateCameraPosition();
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
            openFrameViewer(object);
        } else if (object.userData.type === 'cake') {
            interactWithCake();
        }
    }
}

// ==================== INTERACCIONES ====================
function openFrameViewer(frame) {
    console.log('Abriendo visor de:', frame.userData.name);
    // TODO: Implementar visor 3D rotable
    alert(`${frame.userData.name} - Visor 3D próximamente`);
}

function interactWithCake() {
    console.log('Cortando el pastel...');
    // TODO: Implementar animación de cortar + mostrar carta
    alert('¡Próximamente podrás cortar el pastel y ver la carta! 🎂💌');
}

function closeViewer() {
    document.getElementById('object-viewer').classList.remove('active');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==================== LOOP DE ANIMACIÓN ====================
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    // Rotar pastel suavemente
    if (cake) {
        cake.rotation.y += 0.003;
    }

    // Animar confeti
    scene.children.forEach(child => {
        if (child.userData.velocity) {
            child.position.y -= child.userData.velocity;
            child.rotation.x += child.userData.rotationSpeed.x;
            child.rotation.y += child.userData.rotationSpeed.y;
            child.rotation.z += child.userData.rotationSpeed.z;

            if (child.position.y < 0.5) {
                child.position.y = 10;
            }
        }
    });

    // Animar llamas de velas (parpadeo)
    if (cake) {
        const time = clock.getElapsedTime();
        cake.children.forEach(child => {
            if (child.material && child.material.color.r === 1 && child.material.color.g === 0.4) {
                child.scale.y = 1.4 + Math.sin(time * 8 + child.position.x) * 0.1;
            }
        });
    }

    renderer.render(scene, camera);
}

// ==================== INICIAR ====================
window.addEventListener('load', init);
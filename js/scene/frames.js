// js/scene/frames.js - Cuadros realistas SOBRE la mesa

function createRealisticFrames() {
    const tableHeight = CONFIG.table.height;
    
    const frameData = [
        {
            pos: [-1.2, tableHeight + 0.05, 0.5], // SOBRE la mesa
            rot: [0, Math.PI * 0.2, 0], // Girado hacia el centro
            photo: CONFIG.images.photo1
        },
        {
            pos: [0, tableHeight + 0.05, -0.9], // SOBRE la mesa, al fondo
            rot: [0, 0, 0],
            photo: CONFIG.images.photo2
        },
        {
            pos: [1.2, tableHeight + 0.05, 0.5], // SOBRE la mesa
            rot: [0, -Math.PI * 0.2, 0], // Girado hacia el centro
            photo: CONFIG.images.photo3
        }
    ];

    const loader = new THREE.TextureLoader();

    frameData.forEach((data, index) => {
        const frameGroup = new THREE.Group();
        
        // Dimensiones más pequeñas y realistas
        const frameWidth = 0.35;
        const frameHeight = 0.45;
        const borderWidth = 0.03;
        const depth = 0.02;

        // Material del marco (dorado)
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0xD4AF37,
            metalness: 0.85,
            roughness: 0.25,
            emissive: 0x332200,
            emissiveIntensity: 0.1
        });

        // Función para crear bordes con profundidad
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
                bevelThickness: 0.005,
                bevelSize: 0.005,
                bevelSegments: 2
            };

            return new THREE.ExtrudeGeometry(shape, extrudeSettings);
        }

        // Bordes del marco (4 piezas)
        const topBorder = new THREE.Mesh(
            createFrameBorder(frameWidth + borderWidth * 2, borderWidth),
            frameMaterial
        );
        topBorder.position.y = frameHeight / 2 + borderWidth / 2;
        topBorder.castShadow = true;
        frameGroup.add(topBorder);

        const bottomBorder = new THREE.Mesh(
            createFrameBorder(frameWidth + borderWidth * 2, borderWidth),
            frameMaterial
        );
        bottomBorder.position.y = -(frameHeight / 2 + borderWidth / 2);
        bottomBorder.castShadow = true;
        frameGroup.add(bottomBorder);

        const leftBorder = new THREE.Mesh(
            createFrameBorder(borderWidth, frameHeight),
            frameMaterial
        );
        leftBorder.position.x = -(frameWidth / 2 + borderWidth / 2);
        leftBorder.castShadow = true;
        frameGroup.add(leftBorder);

        const rightBorder = new THREE.Mesh(
            createFrameBorder(borderWidth, frameHeight),
            frameMaterial
        );
        rightBorder.position.x = frameWidth / 2 + borderWidth / 2;
        rightBorder.castShadow = true;
        frameGroup.add(rightBorder);

        // Foto
        const photoMaterial = new THREE.MeshStandardMaterial({
            color: 0xCCCCCC,
            roughness: 0.7,
            metalness: 0.1
        });

        loader.load(
            data.photo,
            (texture) => {
                photoMaterial.map = texture;
                photoMaterial.needsUpdate = true;
                console.log(`✅ Foto ${index + 1} cargada`);
            },
            undefined,
            (error) => {
                console.error(`❌ Error cargando foto ${index + 1}:`, error);
                console.log(`Verifica que exista: ${data.photo}`);
            }
        );

        const photo = new THREE.Mesh(
            new THREE.PlaneGeometry(frameWidth - 0.008, frameHeight - 0.008),
            photoMaterial
        );
        photo.position.z = depth / 2 + 0.002;
        frameGroup.add(photo);

        // Vidrio protector con reflejos
        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(frameWidth, frameHeight),
            new THREE.MeshPhysicalMaterial({
                color: 0xFFFFFF,
                metalness: 0,
                roughness: 0.05,
                transmission: 0.88,
                transparent: true,
                opacity: 0.22,
                reflectivity: 0.35,
                ior: 1.5
            })
        );
        glass.position.z = depth + 0.006;
        frameGroup.add(glass);

        // Soporte trasero
        const back = new THREE.Mesh(
            new THREE.BoxGeometry(
                frameWidth + borderWidth,
                frameHeight + borderWidth,
                0.006
            ),
            new THREE.MeshStandardMaterial({
                color: 0x2A2A2A,
                roughness: 0.9
            })
        );
        back.position.z = -0.006;
        frameGroup.add(back);

        // Posicionar el cuadro
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

// Decoraciones (confeti)
function createDecorations() {
    const confettiColors = [0xFF69B4, 0xFFD700, 0x4169E1, 0xFF6347, 0x9370DB];
    
    for (let i = 0; i < 35; i++) {
        const confetti = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, 0.03, 0.008),
            new THREE.MeshStandardMaterial({
                color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                metalness: 0.6,
                roughness: 0.2
            })
        );
        
        confetti.position.set(
            (Math.random() - 0.5) * 6,
            Math.random() * 3 + 2,
            (Math.random() - 0.5) * 6
        );
        
        confetti.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        confetti.userData = {
            velocity: Math.random() * 0.008 + 0.004,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.04,
                y: (Math.random() - 0.5) * 0.04,
                z: (Math.random() - 0.5) * 0.04
            }
        };
        
        confetti.castShadow = true;
        scene.add(confetti);
    }
}
// js/scene/table.js - Mesa de picnic con mantel a cuadros

function createPicnicTable() {
    const tableGroup = new THREE.Group();
    const tableHeight = CONFIG.table.height;
    const tableWidth = CONFIG.table.width;
    const tableDepth = CONFIG.table.depth;

    // Material de madera
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        roughness: 0.8,
        metalness: 0.1
    });

    // Tablero de la mesa
    const tableTop = new THREE.Mesh(
        new THREE.BoxGeometry(tableWidth, 0.08, tableDepth),
        woodMaterial
    );
    tableTop.position.y = tableHeight;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    // Patas estilo picnic (en V)
    const legGeometry = new THREE.BoxGeometry(0.08, tableHeight - 0.05, 0.08);
    const legPositions = [
        [-tableWidth/2 + 0.3, tableHeight/2, -tableDepth/2 + 0.3],
        [tableWidth/2 - 0.3, tableHeight/2, -tableDepth/2 + 0.3],
        [-tableWidth/2 + 0.3, tableHeight/2, tableDepth/2 - 0.3],
        [tableWidth/2 - 0.3, tableHeight/2, tableDepth/2 - 0.3]
    ];
    
    legPositions.forEach((pos, index) => {
        const leg = new THREE.Mesh(legGeometry, woodMaterial);
        leg.position.set(...pos);
        // Inclinar levemente las patas (estilo picnic)
        leg.rotation.z = (index % 2 === 0) ? 0.08 : -0.08;
        leg.castShadow = true;
        tableGroup.add(leg);
    });

    // Soporte horizontal entre patas
    const support = new THREE.Mesh(
        new THREE.BoxGeometry(tableWidth - 0.6, 0.06, 0.06),
        woodMaterial
    );
    support.position.y = tableHeight / 2;
    support.castShadow = true;
    tableGroup.add(support);

    // MANTEL A CUADROS (patrón rojo y blanco)
    createCheckeredCloth(tableGroup, tableWidth, tableDepth, tableHeight);

    scene.add(tableGroup);
    table = tableGroup;
}

function createCheckeredCloth(parent, width, depth, height) {
    // Crear textura de cuadros proceduralmente
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    const squareSize = 64;
    const numSquares = 8;
    
    for (let x = 0; x < numSquares; x++) {
        for (let y = 0; y < numSquares; y++) {
            // Alternar entre rojo y blanco
            ctx.fillStyle = (x + y) % 2 === 0 ? '#8B4789' : '#E6D5E6';
            ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
        }
    }
    
    const clothTexture = new THREE.CanvasTexture(canvas);
    clothTexture.wrapS = THREE.RepeatWrapping;
    clothTexture.wrapT = THREE.RepeatWrapping;
    clothTexture.repeat.set(2, 2); // Repetir patrón
    
    // Mantel sobre la mesa
    const clothWidth = width - 0.1;
    const clothDepth = depth - 0.1;
    
    const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(clothWidth, clothDepth),
        new THREE.MeshStandardMaterial({
            map: clothTexture,
            roughness: 0.9,
            side: THREE.DoubleSide
        })
    );
    
    cloth.rotation.x = -Math.PI / 2;
    cloth.position.y = height + 0.042; // Justo encima del tablero
    cloth.receiveShadow = true;
    
    parent.add(cloth);
}
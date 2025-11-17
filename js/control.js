// js/controls.js - Controles de cámara y audio

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

        // Sensibilidad más suave
        cameraControls.rotation.y -= deltaX * 0.002;
        cameraControls.rotation.x -= deltaY * 0.002;
        
        // Limitar rotación vertical
        cameraControls.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, cameraControls.rotation.x));

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
    
    // Mover cámara adelante/atrás (zoom)
    const zoomSpeed = 0.03;
    const direction = event.deltaY > 0 ? 1 : -1;
    
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(camera.quaternion);
    
    camera.position.addScaledVector(forward, -direction * zoomSpeed);
    
    // Limitar rango de movimiento (no atravesar la mesa ni alejarse demasiado)
    camera.position.z = Math.max(0.5, Math.min(2.5, camera.position.z));
    camera.position.y = Math.max(0.7, Math.min(1.3, camera.position.y));
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
            alert(`${object.userData.name}\n\n📸 Visor 3D próximamente`);
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

// ========== AUDIO ==========
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
// js/config.js - Configuración global

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
    ],
    camera: {
        // Posición REALISTA: sentado en la mesa
        position: { x: 0, y: 0.95, z: 1.2 }, // Altura de ojos sentado, MUY cerca
        fov: 80, // Campo de visión amplio (más humano)
        near: 0.01,
        far: 100
    },
    table: {
        height: 0.75, // Altura de mesa que llega al torso
        width: 3.5,
        depth: 2.5
    },
    cake: {
        scale: 0.5, // Más pequeño, realista
        position: { x: 0, y: 0.75, z: -0.4 } // Centro de la mesa
    }
};

// Variables globales
let scene, camera, renderer, clock;
let cake, table, frames = [];
let raycaster, mouse;
let interactiveObjects = [];
let audioElement, currentTrackIndex = 0, isPlaying = false;

// Controles de cámara
let cameraControls = {
    rotation: { x: 0, y: 0 },
    isDragging: false,
    previousMouse: { x: 0, y: 0 }
};
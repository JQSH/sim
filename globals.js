// globals.js
let scene, camera, renderer, clock;
let mazeLayout, walls, pellets, player, ghosts;
let score = 0, level = 1;
let isGameOver = false, gameStarted = false;
let audioContext;

function initializeGlobals() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    clock = new THREE.Clock();
    
    walls = [];
    pellets = [];
    ghosts = [];
    
    // Other global initializations...
}
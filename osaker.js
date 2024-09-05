// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setClearColor(0x000000, 1); // Start with a dark background for night
document.body.appendChild(renderer.domElement);

// Load a texture
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('resources/osaka.png'); // Make sure 'osaka.png' is in the correct directory

// Create a cube geometry and a basic material with the loaded texture
const OsakerGeometry = new THREE.BoxGeometry();
const OsakerMaterial = new THREE.MeshBasicMaterial({ map: texture });

// Create a mesh from the geometry and material, and add it to the scene
const OsakerCube = new THREE.Mesh(OsakerGeometry, OsakerMaterial);
OsakerCube.castShadow = true;
OsakerCube.receiveShadow = true;
scene.add(OsakerCube);

// Position the camera
camera.position.z = 5;

OsakerCube.position.set(0, 1, 0);

// Create a plane to receive shadows
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
plane.position.y = -1.5; // Position the plane under the cube and text
plane.receiveShadow = true; // Plane will receive shadows
scene.add(plane);

// Initialize lighting for the scene
let sunLight = new THREE.DirectionalLight(0xffffff, 0.8); // Sunlight
sunLight.castShadow = true;
sunLight.position.set(5, 10, 5);
scene.add(sunLight);

let streetLight1 = new THREE.PointLight(0xffa500, 0); // Streetlight color (orange) and intensity
streetLight1.position.set(-3, 3, -2);
scene.add(streetLight1);

let streetLight2 = new THREE.PointLight(0xffa500, 0); // Another streetlight
streetLight2.position.set(3, 3, -2);
scene.add(streetLight2);

// Configure shadow properties for the sun
sunLight.shadow.mapSize.width = 1024; // Shadow map resolution
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 50;

// Audio setup
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('audio.mp3', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.play();
});

const analyzer = new THREE.AudioAnalyser(sound, 64);

// Create visualizer bars
const barCount = 32; // Increase the number of bars for a bigger visualizer
const bars = [];
const barGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15); // Slightly larger geometry for each bar
const barMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

for (let i = 0; i < barCount; i++) {
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.position.set(i * 0.3 - (barCount * 0.3) / 2, -3, -5); // Position bars along x-axis below the 3D scene
    bars.push(bar);
    scene.add(bar);
}

// Initialize clock variables
let clockMesh;
const fontLoader = new THREE.FontLoader();

// Function to create or update the 3D clock text
function updateClock(scene) {
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const timeStr = new Date().toLocaleTimeString(); // Correct variable name

        // Remove previous clock mesh if it exists
        if (clockMesh) {
            scene.remove(clockMesh);
            clockMesh.geometry.dispose();
            clockMesh.material.dispose();
        }

        const textGeometry = new THREE.TextGeometry(timeStr, { // Use correct variable name
            font: font,
            size: 0.5,      // Size of the text
            height: 0.2,    // Thickness of the text
            curveSegments: 12, // Number of curve segments for the text
            bevelEnabled: true, // Enable bevel effect on the text edges
            bevelThickness: 0.03, // Bevel thickness
            bevelSize: 0.02,      // Bevel size
            bevelOffset: 0,       // Bevel offset
            bevelSegments: 5      // Number of bevel segments
        });

        const textMaterial = new THREE.MeshStandardMaterial({ color: 'red' });
        clockMesh = new THREE.Mesh(textGeometry, textMaterial);
        clockMesh.castShadow = true;   // Text will cast a shadow
        clockMesh.receiveShadow = true; // Text will receive a shadow
        clockMesh.position.set(-2.5, -1.5, -2); // Adjust this position as needed to place the clock behind the cube

        scene.add(clockMesh);
    });
}

// Function to start updating the clock every second
function startClock(scene) {
    updateClock(scene); // Initial clock update

    // Update clock every second
    setInterval(() => {
        updateClock(scene);
    }, 1000);
}

// Function to update lighting based on time of day
function updateLighting() {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour <= 18) {
        // Daytime settings
        sunLight.intensity = 0.8;
        sunLight.position.set(Math.cos(currentHour / 12 * Math.PI) * 10, 10, Math.sin(currentHour / 12 * Math.PI) * 10);
        streetLight1.intensity = 0; // Turn off streetlights
        streetLight2.intensity = 0;
        renderer.setClearColor(0x87ceeb, 1); // Light blue sky
    } else {
        // Nighttime settings
        sunLight.intensity = 0;
        streetLight1.intensity = 1; // Turn on streetlights
        streetLight2.intensity = 1;
        renderer.setClearColor(0x000000, 1); // Dark night sky
    }
}

// Start the 3D clock
startClock(scene); // Initialize the clock

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the cube for animation
    OsakerCube.rotation.y += 0.02;

    // Update visualizer bars based on audio frequency data
    const data = analyzer.getFrequencyData();
    for (let i = 0; i < barCount; i++) {
        const scale = data[i] / 256 * 3; // Increase scaling factor for taller bars
        bars[i].scale.y = scale; // Scale the height of each bar based on frequency data
    }

    // Update lighting
    updateLighting();

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);
}

// Start the animation loop
animate();